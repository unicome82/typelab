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

## 피드백 반영: 단순화 + 반응 강도
- 삭제: 액센트 블롭, rotate 잔상, 헤더 메뉴 버튼, 설정 패널(텍스트·컬러 모드·스와치), 관련 토큰
- 하단 바 한 줄: Text · Weight · Spacing · Mode · Intensity(0~200%, 기본 100)
- Intensity: 모드 효과의 변형량(REST 대비)에 곱함 → 0 정지, 200 두 배
- 반응형: ≤1280 안내 문구 숨김, ≤1024 바를 2열 카드로 접음
- 확인: 1440·1100·390 스크린샷, 가로 넘침 없음, 강도 0/200 동작, 콘솔 에러 없음

- 조절 바 배경·테두리·구분선 제거(데스크톱/2열 모두). 1440·390 스크린샷 확인
- SCSS 통합: _common/_layout/_main/index → style.scss 하나로. 빌드 CSS 해시 동일(출력 변화 없음)
- 조절 바 재구성: Text 라벨 제거·흰 배경 입력칸, Mode는 select→버튼 5개(입력칸 옆), 슬라이더 3개 한 줄씩. 1440·900·390 확인
- 모바일 헤더·조절 영역 좌우 여백 2배($gutter-mobile-chrome), 입력칸↔모드 간격 확대, 비선택 모드 버튼에 ink 50% 테두리. 1440·390 확인
- 타이포 최대 3줄: 띄어쓰기마다 줄바꿈, 4단어 이상은 마지막 줄에 이어 붙임, 글자 수 10→24. 세로 늘림만큼 줄 패딩 확보. 1440·390에서 1/3/5단어 확인, 콘솔 에러 없음
- 3단어 초과 띄어쓰기는 입력에서 무시(붙여넣기는 앞 3단어만). 타이핑 "A B C D E"→"A B CDE", 붙여넣기 4단어→3단어 확인
- Magnetic 모드 확대(scale) 제거, 끌림·굵기 변화는 유지. 1440·390 커서 근접 스크린샷 확인
- 한글 폰트: Pretendard Variable(jsDelivr dynamic subset) 대체 글꼴로 추가, 한글 글자는 윗선 trim을 text로 바꿔 줄 겹침 방지, 폰트 묶음 도착 시 재측정. 로컬 대체 로드로 1440·390 확인
- Wave 폭(wdth) 변화 제거. Rotate는 커서 반경 안 글자만 회전(반경 밖은 제자리). 1440·390 근접/원거리 확인
- Rotate 반응 반경을 공통 반경의 50%로 축소. 1440·390에서 커서 아래 글자만 회전 확인
- 전 모드 공통 반경 0.6→0.3(Rotate와 동일), Wave도 커서 근처 글자만 출렁임(상시 움직임 제거). 1440·390에서 5개 모드 확인
- 첫 화면 단어 랜덤: INTRO_WORDS(3~5자 100개) 중 하나로 시작. 4회 로드 BOLD/MOVE/SANS/COLOR 확인
