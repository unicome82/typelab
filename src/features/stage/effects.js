// 모드별 효과는 모두 순수 함수: (letter, pointer, time) → 휴지 상태 대비 변형값.
// letter: { index, count, cx, cy, width, height } (무대 기준 px)
// pointer: usePointer 값 + energy(0~1, 커서 활성도를 부드럽게 보간한 값)

export const REST = { tx: 0, ty: 0, rot: 0, skew: 0, sx: 1, sy: 1, wght: 0, wdth: 0 };

// 반경을 px가 아닌 무대 짧은 변 비율로 둬야 화면 크기와 무관하게 같은 느낌이 남
// 모든 모드가 커서 바로 근처 글자에만 반응하도록 좁게 둠
const FALLOFF_RADIUS_RATIO = 0.3;
const SMOOTH_A = 3;
const SMOOTH_B = 2;
const FULL_TURN = Math.PI * 2;
const RAD_TO_DEG = 180 / Math.PI;
const MIN_DISTANCE = 1;
const CENTER = 0.5;
const PARITY = 2;

const MAGNET = { pull: 0.25, wght: 300, wdth: 6 };
const STRETCH = { scaleY: 0.22, wdth: 70, bend: 18, rot: 6 };
const WAVE = { speed: 2.4, phaseStep: 0.9, pointerPhase: 1, amp: 0.18, rot: 8, scale: 0.08 };
// edge: 화면 끝에 붙지 않도록 남길 여백(무대 짧은 변 비율)
const SCATTER = { push: 0.45, rot: 35, spin: 20, edge: 0.04 };
const ROTATE = { ratio: 0.35, boost: 20 };

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const clamp01 = (v) => clamp(v, 0, 1);

function getRadius(pointer) {
  return Math.min(pointer.width, pointer.height) * FALLOFF_RADIUS_RATIO || MIN_DISTANCE;
}

// 거리 기반 영향도(smoothstep) — 경계가 딱 끊기지 않도록
function falloff(letter, pointer) {
  const radius = getRadius(pointer);
  const d = Math.hypot(pointer.x - letter.cx, pointer.y - letter.cy);
  const t = clamp01(1 - d / radius);
  return t * t * (SMOOTH_A - SMOOTH_B * t) * pointer.energy;
}

function magnetic(letter, pointer) {
  const f = falloff(letter, pointer);
  return {
    tx: (pointer.x - letter.cx) * MAGNET.pull * f,
    ty: (pointer.y - letter.cy) * MAGNET.pull * f,
    wght: MAGNET.wght * f,
    wdth: MAGNET.wdth * f,
  };
}

function stretch(letter, pointer) {
  const f = falloff(letter, pointer);
  const bend = (pointer.x - letter.cx) / getRadius(pointer);
  return {
    sy: 1 + STRETCH.scaleY * f,
    wdth: STRETCH.wdth * f,
    skew: -bend * STRETCH.bend * f,
    rot: bend * STRETCH.rot * f,
  };
}

function wave(letter, pointer, time) {
  const phase = time * WAVE.speed + letter.index * WAVE.phaseStep + pointer.nx * FULL_TURN * WAVE.pointerPhase;
  // 커서 근처 글자만 출렁이고 반경 밖은 제자리
  const f = falloff(letter, pointer);
  const s = Math.sin(phase) * f;
  const c = Math.cos(phase) * f;
  return {
    ty: s * WAVE.amp * letter.height,
    rot: c * WAVE.rot,
    sy: 1 + s * WAVE.scale,
  };
}

function scatter(letter, pointer) {
  const f = falloff(letter, pointer);
  const dx = letter.cx - pointer.x;
  const dy = letter.cy - pointer.y;
  const d = Math.max(Math.hypot(dx, dy), MIN_DISTANCE);
  const push = SCATTER.push * getRadius(pointer) * f;
  const side = letter.index % PARITY ? 1 : -1;
  const rot = side * SCATTER.rot * f + (dx / d) * SCATTER.spin * f;
  // 좁은 화면에서 글자가 잘리지 않게, 회전으로 넓어진 외곽 박스 기준으로 가장자리에서 멈춤
  const rad = rot / RAD_TO_DEG;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const edge = Math.min(pointer.width, pointer.height) * SCATTER.edge;
  const halfW = (letter.width * cos + letter.height * sin) * CENTER + edge;
  const halfH = (letter.width * sin + letter.height * cos) * CENTER + edge;
  const x = clamp(letter.cx + (dx / d) * push, halfW, pointer.width - halfW);
  const y = clamp(letter.cy + (dy / d) * push, halfH, pointer.height - halfH);
  return { tx: x - letter.cx, ty: y - letter.cy, rot };
}

function rotate(letter, pointer) {
  const f = falloff(letter, pointer);
  const dx = pointer.x - letter.cx;
  const dy = pointer.y - letter.cy;
  // 커서가 바로 위일 때 0°가 되도록 기준을 위쪽으로 둠
  const angle = Math.atan2(dx, -dy) * RAD_TO_DEG;
  // 커서 반경 밖 글자는 제자리에 두고, 가까운 글자만 커서 쪽으로 돌림
  return { rot: (angle * ROTATE.ratio + Math.sign(dx) * ROTATE.boost) * f };
}

export const MODE_EFFECTS = { magnetic, stretch, wave, scatter, rotate };

export function getEffect(mode) {
  return MODE_EFFECTS[mode] ?? magnetic;
}
