# Contributing Guide

## Development Workflow

### 1. 브랜치 전략 (GitHub Flow)

```
main              # 배포 가능한 안정 버전
v*.*.*            # 릴리스 브랜치 (여러 task를 묶어 다음 버전 준비)
hotfix/*          # 긴급 버그 수정 (배포 후 발견된 경우)
```

### 2. 일반 개발 흐름

여러 task(버그 수정·개선·기능)를 하나의 릴리스로 묶어서 진행합니다.
버전 업은 task 단위가 아니라 **릴리스 브랜치를 만든 직후 한 번만** 수행합니다.

```
1. TODO.md에 다음 릴리스(v2.X.Y) 범위 정의
        │
2. 릴리스 브랜치 생성
   git checkout -b v2.X.Y
        │
3. 버전 업 & 커밋
   npm run version:patch / minor
        │
4. task 1 작업 & 커밋
        │
5. task 2, 3 ... 순차 작업 & 커밋 & 푸시
        │
6. PR 생성 → CI 통과 → main 머지
        │
7. 브랜치 삭제
        │
8. 배포 (웹스토어 업로드)
        │
9. TODO.md에서 완료 항목 삭제
```

> **버전 업 타이밍 원칙**: 릴리스 브랜치를 만들자마자 목표 버전으로 올립니다.
> 그래야 브랜치 안에서 생성되는 모든 task 커밋이 처음부터 목표 버전을 달고 있어,
> 나중에 "이 커밋이 어느 버전에 속하지?" 하는 혼란이 생기지 않습니다.
> 중간이나 끝에 올리면 일부 커밋이 이전 버전 문자열을 들고 다니게 되므로 피합니다.

### 3. 심사 실패 시

```
1. 기존 feature 브랜치에서 계속 작업
   git checkout feature/기능명
        │
2. 수정사항 커밋
   git commit -m "fix: 심사 거절 사유 수정"
        │
3. 푸시 후 PR 업데이트
   git push
        │
4. 다시 머지 & 배포
```

### 4. 브랜치 삭제

머지 완료 후 브랜치 정리:

```bash
# GitHub PR 페이지에서 "Delete branch" 클릭
# 또는 터미널에서:
git branch -d feature/기능명              # 로컬 삭제
git push origin --delete feature/기능명   # 원격 삭제
```

### 5. 긴급 핫픽스 (배포 후 발견된 버그)

```
1. main에서 hotfix 브랜치 생성
   git checkout main
   git checkout -b hotfix/버그명
        │
2. 수정 & 커밋
        │
3. PR 생성 → 즉시 머지
        │
4. 버전 업 (patch) & 배포
```

## Commands

```bash
# 개발
npm run dev              # Watch 모드 개발 빌드
npm run build            # 프로덕션 빌드

# 코드 품질
npm run lint             # ESLint 검사
npm run lint:fix         # ESLint 자동 수정
npm run format           # Prettier 포맷팅
npm test                 # Jest 테스트

# 버전 관리
npm run version:patch    # 0.0.x (버그 수정)
npm run version:minor    # 0.x.0 (새 기능)
npm run version:major    # x.0.0 (큰 변경)

# 배포
npm run package          # 확장 프로그램 패키징
```

## Commit Convention

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (기능 변경 X)
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드, 설정 등 기타 변경
```

예시:

```
feat: add offline lyrics caching
fix: sync timing issue on fullscreen
docs: update README installation guide
```

## PR Checklist

- [ ] `npm run lint` 통과
- [ ] `npm test` 통과
- [ ] `npm run build` 성공
- [ ] 관련 TODO.md 항목 업데이트
