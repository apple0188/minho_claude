# 컵오브 카드뉴스 틀

인스타 카드뉴스(1080×1350, 4:5)를 JSON 내용만 바꿔서 PNG로 뽑는 틀. 디자인은 사이트 썸네일과 같은 애플 톤(흰 배경, #1D1D1F 계열 그레이)에 포인트 컬러는 컵오브 골드 #C4872A.

## 쓰는 법
```bash
node cardnews/render.mjs cardnews/preview.json cardnews/out
```
→ `out/card-01.png …` + 한눈에 보는 `out/overview.png`. 글이 넘치면 경고가 뜬다.

## 내용 파일(JSON)
- `type: "cover"` 표지: `title`, `sub`
- `type: "body"` 본문: `title`, `text`, `examples: [{en, ko}]`(선택)
- `type: "cta"` 마지막 장: `title`, `sub`, `info: [[라벨, 값]…]`, `button`
- `**강조**` → 표지·제목에선 골드, 본문에선 굵게. `\n` → 줄바꿈.

폰트: Pretendard(OFL). Playwright 경로는 클라우드 세션 기준 `/opt/node-tools/node_modules/playwright`.
