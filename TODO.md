# TODO

## 🐛 Bugs

1. ~~**[재현 불가] songInfo 위치 초기화 버그**~~

   - 증상: 알 수 없는 오류 발생 후 재시도 버튼 클릭 시 songInfo가 윈도우 중앙에 생성됨
   - 상태: 현재 재현 불가 - 특정 계정/조건에서만 발생할 수 있음

2. ~~**[수정 완료] 동일 영상 재방문 시 가사 미표시 버그**~~
   - 원인: `handleVideoDetection`에서 video element 미발견 시 `isDetecting` 플래그가 리셋되지 않음
   - 수정: video element 검사를 try 블록 내로 이동하여 finally에서 항상 플래그 리셋

## ✨ Features

1. **musicNoteButton 가시성 개선 + 첫 사용 튜토리얼**
   - musicNoteButton을 더 눈에 띄게 디자인 개선
   - 첫 설치/사용 시 모달로 버튼 위치 안내

## 🔧 Improvements

1. **Title 파싱 시스템 개선** (진행 중)

   - 1단계: 패턴 배열 기반 리팩토링 (구조 개선)
     - 현재: `extractArtistAndTitleCustom()` 내부에 패턴들이 하드코딩
     - 목표: 패턴 배열 기반으로 관리하여 추가/수정 용이하게 변경
     - 상태: titlePatterns.ts 생성 완료, 테스트 작성 중
   - 2단계: 탐지 로직 개선 (기능 개선)
     - 제목 필터링 정교화 (괄호, 특수문자, 버전 정보 등 처리)
     - 아티스트명 매칭 개선
     - 검색 실패 시 대체 검색어 시도

2. **[DEV_MODE] 오프셋 캐시 기능**

   - 수동 검색에서 선택한 가사의 오프셋 조정값도 서버에 저장
   - videoId → { lrclibId, offset } 매핑

3. **Spotify 결과 검사 로직 도입**

## ✅ Completed

- [x] DEV_MODE 전용 "확정" 버튼 (videoId → lrclibId 매핑 저장)
- [x] 동일 영상 재방문 시 가사 미표시 버그 수정 (isDetecting 플래그 리셋 문제)

## 📋 Backlog

1. **피드백 시스템**
   - 팝업/설정에 피드백 버튼 추가
   - 사용 중 만족도 조사 (일정 기간 사용 후)
