// 사용법: node plandeu/capture-phone.mjs
// → plandeu/share/ 에 카톡으로 보내기 좋은 휴대폰 화면 캡처 4장 + 오프닝 화면 녹화(mp4)
import { chromium, devices } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const dir = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(dir, 'share');
fs.mkdirSync(out, { recursive: true });
const url = 'file://' + path.join(dir, 'homepage', 'index.html');
const phone = devices['iPhone 13'];
const browser = await chromium.launch();

// 1) 화면 캡처 4장 (하단 고정 버튼 포함, 실제 휴대폰에서 보이는 그대로)
const ctx = await browser.newContext({ ...phone });
const p = await ctx.newPage();
await p.goto(url); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(3200);
const shots = [['1_첫화면', null, 0], ['2_핏카드', '.fit', 96], ['3_지난교육', '#cases', 4], ['4_문의', '#contact form', 76]];
for (const [name, sel, off] of shots) {
  if (sel) { await p.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - o); }, [sel, off]); await p.waitForTimeout(2200); }
  await p.screenshot({ path: path.join(out, `플랜듀_시안_${name}.png`) });
  console.log('PNG', name);
}
await ctx.close();

// 2) 오프닝 → 첫 화면 → 핏 카드까지 화면 녹화 (CDP 스크린캐스트로 고해상도 프레임을 받아 mp4로 합침)
const fdir = path.join(out, '.frames'); fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir, { recursive: true });
const vctx = await browser.newContext({ ...phone, deviceScaleFactor: 2 });
const v = await vctx.newPage();
const cdp = await vctx.newCDPSession(v);
const frames = [];
cdp.on('Page.screencastFrame', async f => {
  const file = path.join(fdir, `f${String(frames.length).padStart(4, '0')}.jpg`);
  fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
  frames.push({ file, t: f.metadata.timestamp });
  await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, everyNthFrame: 1 });
await v.goto(url); await v.waitForTimeout(3600);
await v.evaluate(() => window.scrollTo({ top: document.querySelector('.fit').getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' }));
await v.waitForTimeout(3400);
await cdp.send('Page.stopScreencast'); await vctx.close(); await browser.close();
// 프레임 간 실제 시간 간격대로 이어 붙이기
const list = frames.map((f, i) => `file '${f.file}'\nduration ${((frames[i + 1]?.t ?? f.t + 1) - f.t).toFixed(3)}`).join('\n') + `\nfile '${frames.at(-1).file}'\n`;
fs.writeFileSync(path.join(fdir, 'list.txt'), list);
const mp4 = path.join(out, '플랜듀_시안_오프닝.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(fdir, 'list.txt'), '-ss', '0.35', '-vsync', 'cfr', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-vf', 'scale=720:-2', mp4]);
fs.rmSync(fdir, { recursive: true, force: true });
console.log('MP4', mp4, frames.length + ' frames');
