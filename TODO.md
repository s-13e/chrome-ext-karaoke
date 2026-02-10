# TODO (v1.3.0)

## 🐛 Bugs

1. ~~가사 로딩되기 전에 다른 페이지 전환 시, 기존 페이지의 가사가 다음 페이지에 전송이 됨.~~

2. ~~영상의 화질 깨짐 이슈~~

3. ~~**버튼 tooltip이 언어 설정을 무시하고 한국어로 표시되는 문제**~~
   - ~~영어 설정인데 일부 tooltip이 한국어로 뜸 → i18n 미적용 또는 하드코딩된 부분 수정~~
   - ~~MusicNoteButton 커스텀 툴팁 + i18n 적용, BottomContainer/TutorialTooltip/TutorialMenu/ReservationSidebar 하드코딩 한국어 교체~~

## ✨ Features

1. ~~**[DEV_MODE] 오프셋 캐시 기능**~~
   - ~~수동 검색에서 선택한 가사의 오프셋 조정값도 서버에 저장~~
   - ~~videoId → { lrclibId, offset } 매핑~~

2. ~~**Spotify API 조회 결과 검사 로직 도입**~~
   - ~~현재 Spotify 조회 결과를 그대로 사용 중 → 신뢰도 검증 단계 추가~~

## 🔧 Improvements

3. ~~**튜토리얼 로직 분리 (index.tsx → tutorialController.ts)**~~
   - ~~index.tsx 내 showTutorial1\~6FromMenu 함수들(\~850줄)을 별도 모듈로 분리~~
   - ~~6개 함수의 공통 패턴(컨테이너 생성 → substeps → 위치 계산 → 렌더)을 하나의 `showMenuTutorial(config)` 함수로 추상화~~

4. ~~**핵심 모듈 테스트 커버리지 확대**~~
   - ~~현재 테스트 파일 8개 / 소스 158개 → 주요 경로 우선 보강~~
   - ~~대상: 가사 파싱(lyricsParser), API 에러 핸들링(lrclib), 플랫폼 감지(videoDetection)~~

## 📋 Backlog

- **피드백 시스템** — 팝업/설정에 피드백 버튼 추가, 일정 기간 사용 후 만족도 조사
- **일본어 로마자 가독성 향상** — 띄어쓰기 도입으로 읽기 쉽게 개선
- **접근성(a11y) 개선** — 주요 인터랙티브 요소에 ARIA 라벨·키보드 내비게이션 추가
- **외부 API 레이트 리미팅** — 빠른 영상 전환 시 LRCLib/MusicBrainz 호출 제한
- **프로덕션 소스맵 활성화** — `hidden-source-map` 적용으로 에러 리포팅 개선
- **songInfo 위치 초기화 버그** - 알 수 없는 오류 발생 후 재시도 버튼 클릭 시 songInfo가 윈도우 중앙에 생성되는데 후에 트리거 알아내면 개선
