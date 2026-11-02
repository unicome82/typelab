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

## ③ Stage · ④ Controls (서브에이전트 병렬)
- ③ Stage: 글자 분할 + rAF CSS 변수 갱신, 모드 5종(effects.js), 블롭, 텍스트 자동 맞춤, reduced-motion 정지 구도
- ④ Controls: 하단 바 + 패널(공용 필드 4종), Esc/바깥 클릭 닫기, 포커스 이동, 모바일 바텀시트
- 병합: 파일 분리로 충돌 없음. `$accents` 키 따옴표 처리로 Sass 보간 경고 제거
- 통합 확인: 바/패널 → Stage 반영(텍스트·모드·색), 데스크톱·모바일 스크린샷, 콘솔 에러 없음
- 남은 이슈(⑤): 모바일 하단 문구 2줄, 바 테두리 연함, 모바일 글자 크기 작음, scatter 모바일 가장자리 잘림, effects.js 축 범위가 SCSS와 중복
