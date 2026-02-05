# TODO

## 🐛 Bugs

## 🔧 Improvements

## ✅ Completed

- [x] DEV_MODE 전용 "확정" 버튼 (videoId → lrclibId 매핑 저장)
- [x] 동일 영상 재방문 시 가사 미표시 버그 수정 (isDetecting 플래그 리셋 문제)
- [x] 첫 사용 튜토리얼 (TutorialTooltip, TutorialMenu, Step1~6)
- [x] Title 파싱 1단계 - 패턴 배열 기반 리팩토링 (`titlePatterns.ts`)
- [x] 캐시 미스 시 로딩 문구 개선 (`extLyricsLoadingCacheMiss` 번역키 추가, 7개 언어)
- [x] TypeScript 오류 수정 (TutorialTooltip 타입, 미사용 코드 제거, 테스트 파일 타입 안전성)
- [x] Step1 튜토리얼 툴팁 스크롤 추적 (스크롤 시 버튼 위치에 맞게 툴팁 이동)

## 📋 Backlog

1. **[DEV_MODE] 오프셋 캐시 기능**

   - 수동 검색에서 선택한 가사의 오프셋 조정값도 서버에 저장
   - videoId → { lrclibId, offset } 매핑

2. **Spotify 결과 검사 로직 도입**

3. **피드백 시스템**

   - 팝업/설정에 피드백 버튼 추가
   - 사용 중 만족도 조사 (일정 기간 사용 후)

4. **[재현 불가] songInfo 위치 초기화 버그**

   - 증상: 알 수 없는 오류 발생 후 재시도 버튼 클릭 시 songInfo가 윈도우 중앙에 생성됨
   - 상태: 현재 재현 불가 - 특정 계정/조건에서만 발생할 수 있음

5. 일본어 로마자 가독성 높이기 위한 띄어쓰기 도입
