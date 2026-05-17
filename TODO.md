# TODO (v2.3.2 — 완료)

> **사이클 성격**: patch — v2.3.1 배포 후 churn(설치/삭제 2:1.2) 후속 대응.
> 사용자 직접 체험으로 짚어진 마찰점 셋(가설 D + Simple 회복 경로 부재) 해소.
>
> Vocal removal(반주)는 다음 사이클(v2.4.0)에서 minor의 메인 feature로 다룰 예정.

## Bugs

_없음_

## Features

_없음 (음차 표기는 라이브러리 리서치 필요해서 Backlog 이월)_

## Improvements (완료)

### 🚪 Simple 유저용 회복 경로 신설 (가장 큰 발견, High impact)

- [x] **microFeedback 분기 확장** — thumbs_down → "타이밍 어긋남"(sync_mismatch)도 wrong_lyrics와 동일하게 자동 가사 숨김 + 5초 되돌리기 토스트. content/index.tsx handleFeedback + LyricsFeedbackButton 토스트 분기/duration까지 일관화. 가라오케 모드 진입 없이도 회복 가능
- [x] **가사 회복을 메모리 스냅샷 경로로 통일** — "숨긴 가사 다시 표시"가 force-rematch로 API 재검색하던 것을 사이드바 [되돌리기]와 동일한 `undo-lyrics-hide` 이벤트로 통일. handleUndoHide에 fallback(스냅샷 없을 때 force-rematch) 보강. 같은 영상에서 5초 후 회복도 API 호출 0회로 빠르게

### 🎓 Welcome 가이드 카피·진입 수정

- [x] **step3 카피를 "선택적" 톤으로** — "노래방 모드 (선택사항)" + 옵션 톤 desc (7개 로케일)
- [x] **사이드바 "가이드" 메뉴 존재 안내** — Welcome step3에 hint 박스 + welcome-step-guide.png 이미지 추가
- [x] **step 재구성** — 팝업 첫 화면(모드 온보딩) 안내를 step2로 분리, 기존 step2/3는 step3/4로 이동. popup 첫 진입이 ModeOnboarding이라는 사실 반영

### 🔌 "Try on YouTube" 버튼과 확장 활성화 상태 일치

- [x] **welcome 가이드 마지막 화면에 확장 상태 가시화** — title 자체가 상태 표현(🎉 준비 완료! / ⚠️ 확장이 꺼져 있어요). subtitle 조건부. Primary CTA 한 개만. OFF에선 "✨ 확장 켜기" → `chrome.action.openPopup()` 호출, 실패 시 storage 직접 fallback. useChromeStorage hook에 onChanged listener 추가로 popup 토글 실시간 반영

---

## 📋 Backlog

### v2.4.0 / 다음 minor 후보

- **Vocal Removal (반주 모드)** — minor 메인 feature 후보. `_notes_a.md`에 기술 리서치. found_alternative 피드백 대응. AudioWorklet 마이그레이션과 묶어서 처리 가능
- **외국어 곡 발음 음차 표기 (ko/ja 한정)** — 라틴 알파벳 곡 → 한글/카타카나 음차 (영어 곡 위에 한글 발음 적어주는 노래방 경험). 기존 로마자 변환 토글과 통합하면 곡 언어=UI 언어 시 토글 자체 숨김으로 글로벌 UX 미니멀화 자연 해결. **선행 리서치**: npm 라이브러리(영→한, 영→카타카나) quality·라이선스 평가 필요
- **커버 곡 미스 매치 완화** — 피드백 다수. 원곡/커버 구분 로직 또는 수동 매핑 유도 UX 검토 (선행 리서치 필요)

### 피드백 사전 차단 / UX

- **Options 페이지 FAQ 추가** — 자주 받은 피드백 + 답변 섹션. v2.3.2에서 stretch로 넣었으나 메인 발견 셋이 광범위 신호를 흡수해 우선순위 낮음
  - "가사가 안 맞아요" → microFeedback의 가사 숨김 + 수동 검색
  - "노래방 모드 어떻게 켜나요?" → welcome-step3 사진 재활용
  - "영어 노래 가사가 안 나와요" → 수동 검색 영문 입력
  - "반주/MR 기능 있나요?" → v2.4.0 계획임을 정직하게 명시 (vocal removal 기대 churn 차단)
- **피드백 반영 알림** — 사용자가 보낸 피드백이 반영됐을 때 알림. 식별/저장/전송 인프라 필요
- **popup, Song-info 디자인 수정**
- **다음 곡 예약/자동재생** — 재생 큐. YouTube DOM 제어 복잡도 높아 별도 사이클
- **기본 사용 지표 수집** — 익명·옵트인 방식. 정책/권한 이슈로 보류

### 매칭 / 가사 신뢰성

- **영문 alias 다중 후보 순차 시도** — `extractEnglishAliasFromArtists`를 배열 반환으로 확장, LRCLib에 순차 시도. 아래 로컬 캐시와 묶어서 처리하면 효율적
- **아티스트 영문 별칭 로컬 캐시** — 수동 검색에서 검증된 영문 표기를 `chrome.storage.local`에 저장해 다음 감지 때 자동 치환. LRCLib hit한 "승자"만 저장
- **아티스트 별칭 캐시 관리 UI** — 옵션 페이지에서 자동 저장된 영문 별칭 확인·수정·삭제 (v2.4.0+ 검토)
- **음차 표기 다국어 확장** — ko/ja 출시 이후 zh/es/pt 등 확장 검토. 라이브러리 가용성에 따라
- **로컬 단어 현지화 적용**
- **일본어 로마자 가독성 향상** — 띄어쓰기 도입

### 인프라 / 품질

- **외부 API 레이트 리미팅** — 빠른 영상 전환 시 LRCLib/MusicBrainz 호출 제한
- **에러 리포팅 인프라** — `hidden-source-map` + Sentry 연동. 소스맵만 켜는 게 아니라 리포팅 서비스까지 구성해야 의미 있으므로 별도 사이클
- **Tune 파이프라인 AudioWorklet 마이그레이션** — deprecated `ScriptProcessorNode` 대체. Tier 2(ML HD) 인프라 필요 시 동시 처리하면 효율적. v2.4.0 vocal removal과 묶어서 처리 가능
- **tsconfig deprecation 마이그레이션** — v2.3.1 deps bump에서 `ignoreDeprecations: "6.0"` 임시 silence 적용. TypeScript v7 진입 전 `baseUrl` 제거 + `paths`만 사용 + `moduleResolution` 정리. ts-jest config의 node10 fallback 추적 포함
- **setupUIResources cleanup→skip race** — v2.3.2 검증 중 발견. 새로고침 직후 영상 진입 시 가사 오버레이가 안 뜨는 케이스. 로그상 `cleanupAllResources` 직후 `Overlays already initialized, skipping mount`로 분기되어 React root는 unmount됐는데 mount는 skip됨. 한 번 더 새로고침하면 회복. 재현 빈도/조건 추가 수집 후 root cause 진단
- **접근성(a11y) 개선** — 주요 인터랙티브 요소에 ARIA 라벨·키보드 내비게이션
