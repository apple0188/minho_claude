// 사용법: node render.mjs slides.json [출력폴더]  → card-01.png … + overview.png
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = path.resolve(process.argv[3] || path.join(dir, 'out'));
fs.mkdirSync(out, { recursive: true });
fs.readdirSync(out).filter(f => f.endsWith('.png')).forEach(f => fs.unlinkSync(path.join(out, f)));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.addInitScript(d => { window.__DATA__ = d; }, data);
await page.goto('file://' + path.join(dir, 'template.html'));
await page.evaluate(() => document.fonts.ready);
const cards = await page.$$('.card');
for (const [i, c] of cards.entries()) {
  // 넘침 검사: 본문이 하단 푸터를 침범하면 경고
  const over = await c.evaluate(el => { const a = el.querySelector('.in'), b = el.querySelector('.foot,.info,.rule'); return a && b && a.getBoundingClientRect().bottom > b.getBoundingClientRect().top - 24; });
  if (over) console.warn(`⚠ ${i + 1}번 카드 글이 넘칩니다 — 줄이세요`);
  await c.screenshot({ path: path.join(out, `card-${String(i + 1).padStart(2, '0')}.png`) });
}
// 한눈에 보기용 미리보기 시트
if (!cards.length) throw new Error("카드가 0장 — template.html 오류");
const imgs = fs.readdirSync(out).filter(f => /^card-\d+\.png$/.test(f)).sort();
const cols = Math.min(4, imgs.length), W = 360, H = 450, G = 16;
await page.setViewportSize({ width: cols * W + (cols + 1) * G, height: Math.ceil(imgs.length / cols) * (H + G) + G });
await page.setContent(`<body style="margin:0;background:#E5E5EA;display:grid;grid-template-columns:repeat(${cols},${W}px);gap:${G}px;padding:${G}px">` +
  imgs.map(f => `<img style="width:${W}px;height:${H}px;border-radius:10px" src="data:image/png;base64,${fs.readFileSync(path.join(out, f)).toString('base64')}">`).join('') + '</body>');
await page.screenshot({ path: path.join(out, 'overview.png'), fullPage: true });
await browser.close();
console.log(`${cards.length}장 → ${out}`);
