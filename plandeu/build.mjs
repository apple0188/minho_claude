// 사용법: node plandeu/build.mjs
// → plandeu/pdf/ 에 기획서·견적서·계약서 PDF, 홈페이지 시안 데스크톱/모바일 스크린샷 생성
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(dir, 'pdf');
fs.mkdirSync(out, { recursive: true });

const docs = ['01_기획서', '02_견적서', '03_계약서'];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const name of docs) {
  await page.goto('file://' + path.join(dir, name + '.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(out, `플랜듀_${name.slice(3)}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log('PDF', name);
}

// 홈페이지 시안 스크린샷
const hp = 'file://' + path.join(dir, 'homepage', 'index.html');
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const p = await browser.newPage({ viewport: vp, deviceScaleFactor: 2 });
  await p.goto(hp, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(4500); // 오프닝 애니메이션이 끝날 때까지 대기
  await p.addStyleTag({ content: '.mbar{display:none!important}' });
  await p.evaluate(() => { document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); document.querySelectorAll('.fit,.fitbox').forEach(e => e.classList.add('on')); });
  await p.waitForTimeout(2600); // 고정 하단바는 전체 캡처에서 중간에 떠 보이므로 숨김
  await p.screenshot({ path: path.join(out, `플랜듀_홈페이지시안_${label}.png`), fullPage: true });
  console.log('PNG', label);
  await p.close();
}
// 카톡·SNS 링크 미리보기 이미지 (1200×630)
{
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.goto('file://' + path.join(dir, 'og-template.html')); await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: path.join(dir, 'homepage', 'og.png') }); console.log('PNG og'); await og.close();
}
await browser.close();
