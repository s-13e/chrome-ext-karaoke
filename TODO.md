# TODO

## 🐛 Bugs

## ✨ Features

## 🔧 Improvements

1. **Title 파싱 패턴 기반 리팩토링**

   - 현재: `extractArtistAndTitleCustom()` 내부에 패턴들이 하드코딩
   - 목표: 패턴 배열 기반으로 관리하여 추가/수정 용이하게 변경
   - 구조:
     ```typescript
     interface TitlePattern {
       name: string; // 패턴 식별자
       regex: RegExp;
       extract: (match, rawTitle) => ParseResult | null;
       skipSwap: boolean; // 순서 뒤집기 시도 스킵 여부
       requiresCleanup?: boolean; // 정제된 문자열에서 매칭할지
       returnNull?: boolean; // null 반환해서 채널명 fallback 유도
     }
     ```
   - 예상 패턴 목록:
     - `japanese-quote`: `YOASOBI「アイドル」`
     - `leading-quote`: `"Your Idol" | Sony` → null (fallback)
     - `nested-parentheses`: `HEYA (해야 (HEYA))` → null
     - `quoted-title`: `Artist "Title"`
     - `delimiter`: `Artist - Title`, `Artist / Title`, `Artist | Title`
     - `parentheses`: `Artist (Title)`
     - `track-number`: `01. Title` → title만 추출
   - 장점:
     - 패턴 추가/수정 시 배열에만 추가
     - 우선순위 명확 (배열 순서 = 우선순위)
     - 패턴별 단위 테스트 용이
     - 디버깅용 `patternUsed` 메타데이터

2. spotify 결과 검사 로직 도입

## 📋 Backlog

1. 피드백 시스템 (나머지)

- 팝업/설정에 피드백 버튼 추가
- 사용 중 만족도 조사 (일정 기간 사용 후)

2. 가사 탐지 로직 개선

- 제목 필터링 정교화 (괄호, 특수문자, 버전 정보 등 처리)
- 아티스트명 매칭 개선
- 검색 실패 시 대체 검색어 시도
