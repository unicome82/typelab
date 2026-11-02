// 모드별 효과는 모두 순수 함수: (letter, pointer, time) → 휴지 상태 대비 변형값.
// letter: { index, count, cx, cy, width, height } (무대 기준 px)
// pointer: usePointer 값 + energy(0~1, 커서 활성도를 부드럽게 보간한 값)

// SCSS $axis-* 토큰과 같은 값 — 프레임마다 JS가 축 값을 계산하므로 범위를 알아야 함
export const AXIS = {
  wghtMin: 100,
  wghtMax: 1000,
  wdthMin: 25,
  wdthMax: 151,
  wdthBase: 25,
};

export const REST = { tx: 0, ty: 0, rot: 0, skew: 0, sx: 1, sy: 1, wght: 0, wdth: 0, gtx: 0, gty: 0, grot: 0 };

// 반경을 px가 아닌 무대 짧은 변 비율로 둬야 화면 크기와 무관하게 같은 느낌이 남
const FALLOFF_RADIUS_RATIO = 0.6;
const SMOOTH_A = 3;
const SMOOTH_B = 2;
const FULL_TURN = Math.PI * 2;
const RAD_TO_DEG = 180 / Math.PI;
const MIN_DISTANCE = 1;
const CENTER = 0.5;
const PARITY = 2;

const MAGNET = { pull: 0.25, wght: 300, wdth: 6, scale: 0.06 };
const STRETCH = { scaleY: 0.22, wdth: 70, bend: 18, rot: 6 };
const WAVE = { speed: 2.4, phaseStep: 0.9, pointerPhase: 1, ampBase: 0.08, ampPointer: 0.14, rot: 8, scale: 0.08, wdth: 30 };
const SCATTER = { push: 0.45, rot: 35, spin: 20 };
const ROTATE = { ratio: 0.35, boost: 20, ghostRot: 0.45, ghostOffset: 0.18, trail: 6 };

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
    sx: 1 + MAGNET.scale * f,
    sy: 1 + MAGNET.scale * f,
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
  // 커서가 위/아래 가장자리로 갈수록 파도가 커짐
  const lift = (Math.abs(pointer.ny - CENTER) / CENTER) * pointer.energy;
  const amp = WAVE.ampBase + WAVE.ampPointer * lift;
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  return {
    ty: s * amp * letter.height,
    rot: c * WAVE.rot,
    sy: 1 + s * WAVE.scale,
    wdth: c * WAVE.wdth,
  };
}

function scatter(letter, pointer) {
  const f = falloff(letter, pointer);
  const dx = letter.cx - pointer.x;
  const dy = letter.cy - pointer.y;
  const d = Math.max(Math.hypot(dx, dy), MIN_DISTANCE);
  const push = SCATTER.push * getRadius(pointer) * f;
  const side = letter.index % PARITY ? 1 : -1;
  // 좁은 화면에서 글자가 무대 밖으로 사라지지 않게 가장자리에서 멈춤
  const halfW = letter.width * CENTER;
  const halfH = letter.height * CENTER;
  const x = clamp(letter.cx + (dx / d) * push, halfW, pointer.width - halfW);
  const y = clamp(letter.cy + (dy / d) * push, halfH, pointer.height - halfH);
  return {
    tx: x - letter.cx,
    ty: y - letter.cy,
    rot: side * SCATTER.rot * f + (dx / d) * SCATTER.spin * f,
  };
}

function rotate(letter, pointer) {
  const f = falloff(letter, pointer);
  const dx = pointer.x - letter.cx;
  const dy = pointer.y - letter.cy;
  // 커서가 바로 위일 때 0°가 되도록 기준을 위쪽으로 둠
  const angle = Math.atan2(dx, -dy) * RAD_TO_DEG;
  const rot = angle * ROTATE.ratio * pointer.energy + Math.sign(dx) * ROTATE.boost * f;
  const lean = dx / getRadius(pointer);
  return {
    rot,
    grot: rot * ROTATE.ghostRot,
    gtx: -lean * letter.width * ROTATE.ghostOffset * pointer.energy - pointer.vx * ROTATE.trail,
    gty: -pointer.vy * ROTATE.trail,
  };
}

export const MODE_EFFECTS = { magnetic, stretch, wave, scatter, rotate };

export function getEffect(mode) {
  return MODE_EFFECTS[mode] ?? magnetic;
}
