# WORKLOG

## ① 세팅·토큰
- Vite + React + SCSS 구성, 역할별 partial 분리, 미드센추리 토큰 정의
- 이슈: 엔트리 `main.scss` ↔ `_main.scss` 순환 참조 → `index.scss`로 변경
- 확인: build OK, 데스크톱(1440)·모바일(390) 스크린샷에서 가변 축 적용 확인

## ①-보완 · ② 포인터 엔진
- 레퍼런스 반영: 오프화이트/블랙 + 액센트 5색(`$accents` → `--c-*`, `data-accent` → `--accent`), 헤더·푸터 레이아웃
- `usePointer`(window 포인터 → 대상 요소 기준, rAF+lerp, ref+onFrame), `useReducedMotion`
- 공유 상태 계약: `App` settings `{text, mode, weight, spacing, colorMode, accent}` + `constants/settings.js`
- Stage/ControlBar/Panel 스텁 → ③·④ 병렬 작업 준비. build OK
