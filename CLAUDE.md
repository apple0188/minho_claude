# 작업 이어하기 안내

새 세션을 시작하면 아래 프로젝트 README의 "진행 상황"부터 확인하고 이어서 작업한다.

| 폴더 | 프로젝트 | 상태 |
|---|---|---|
| `plandeu/` | 플랜듀: 기업교육 컨설팅 회사의 홈페이지 + 자동화 3개월 (700만 원, VAT 별도) | 기획서·견적서·계약서·홈페이지 시안 v1 완료, 서명 대기 |
| `cardnews/` | 컵오브 인스타 카드뉴스 틀 | 완료 |

- 통화 녹음과 녹취록(txt)은 구글 드라이브에 올라온다. 녹취 txt는 UTF-16이라서 `download_file_content`로 받은 뒤 `base64 -d | iconv -f UTF-16 -t UTF-8`로 디코딩한다.
- 비밀번호·API 키 같은 비밀 정보는 이 저장소에 적지 않는다. (저장소는 git 기록에 남는다)
- 문서 PDF와 스크린샷 생성은 `node plandeu/build.mjs` (Playwright, Pretendard 폰트는 `cardnews/fonts`)
