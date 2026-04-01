# TODO (v2.1.0)

## Bugs

## Features

## Improvements

## 📋 Backlog

- **간헐적 가사 오버레이 미표시 버그** — 가사 데이터 로딩 + 렌더링 완료 로그 정상인데 화면에 안 보임. 새로고침하면 복구됨
  - 원인 조사 시 확인할 것:
    - `#lyrics-cc-overlay`와 부모 체인(`#player-container-outer` 등)의 **실제 computed width/height**가 0인 요소가 있는지
    - YouTube SPA 전환 시 오버레이가 이전 플레이어 DOM에 붙어있는지 (고아 노드)
    - `z-index` 충돌로 YouTube 요소에 가려지는지
    - `opacity`, `visibility`, `display` 속성 변경 여부
- **팝업 디자인 수정**
- **다음 곡 예약/자동재생** — 재생 큐 기능으로 다음 곡 자동 전환. YouTube DOM 제어 및 상태 관리 복잡도가 높아 별도 버전 검토
- **기본 사용 지표 수집** — 어떤 기능을 얼마나 사용하는지 파악 (익명, 옵트인 방식). 정책/권한 이슈로 보류
- **일본어 로마자 가독성 향상** — 띄어쓰기 도입으로 읽기 쉽게 개선
- **접근성(a11y) 개선** — 주요 인터랙티브 요소에 ARIA 라벨·키보드 내비게이션 추가
- **외부 API 레이트 리미팅** — 빠른 영상 전환 시 LRCLib/MusicBrainz 호출 제한
- **프로덕션 소스맵 활성화** — `hidden-source-map` 적용으로 에러 리포팅 개선
