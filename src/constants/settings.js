export const MODES = [
  { id: 'magnetic', label: 'Magnetic' },
  { id: 'stretch', label: 'Stretch' },
  { id: 'wave', label: 'Wave' },
  { id: 'scatter', label: 'Scatter' },
  { id: 'rotate', label: 'Rotate' },
];

export const TEXT_MAX_LENGTH = 24;
export const TEXT_MAX_LINES = 3;
export const TEXT_FALLBACK = 'TYPE';

// 첫 화면에 무작위로 띄울 3~5자 단어
export const INTRO_WORDS = [
  'TYPE', 'FONT', 'BOLD', 'SERIF', 'KERN', 'GLYPH', 'INK', 'SANS', 'WIDE', 'SLANT', 'CAPS', 'LINE',
  'GRID', 'FORM', 'SHAPE', 'CURVE', 'ANGLE', 'SPACE', 'PAPER', 'PRESS', 'PRINT', 'BLOCK', 'LEAD',
  'WAVE', 'FLOW', 'MOVE', 'SPIN', 'TWIST', 'BEND', 'PUSH', 'PULL', 'FLEX', 'DRIFT', 'FLOAT',
  'SWING', 'SHIFT', 'ROLL', 'JUMP', 'DANCE', 'GLIDE', 'BEAT', 'PULSE', 'ECHO', 'NOISE', 'SOUND',
  'LOUD', 'QUIET', 'CALM', 'WILD', 'FREE', 'OPEN', 'SHUT', 'LIGHT', 'DARK', 'SHADE', 'TONE', 'HUE',
  'COLOR', 'STONE', 'WOOD', 'IRON', 'GOLD', 'SAND', 'SALT', 'SUN', 'MOON', 'STAR', 'SKY', 'CLOUD',
  'RAIN', 'SNOW', 'WIND', 'STORM', 'FIRE', 'SMOKE', 'ASH', 'DUST', 'SEED', 'ROOT', 'LEAF', 'BLOOM',
  'FRUIT', 'HONEY', 'MILK', 'BREAD', 'TEA', 'JAZZ', 'FUNK', 'SOUL', 'BLUES', 'DISCO', 'NEON',
  'RETRO', 'MODE', 'PLAY', 'GAME', 'LOOP', 'DREAM', 'HELLO', 'ZEST',
];

export const WEIGHT_RANGE = { min: 100, max: 1000, step: 10 };
// 자간 단위: 1/100em
export const SPACING_RANGE = { min: -10, max: 20, step: 1 };
// 반응 강도(%): 모드 효과의 변형량에 곱해짐, 100이 기본 세기
export const INTENSITY_RANGE = { min: 0, max: 200, step: 10 };
export const INTENSITY_BASE = 100;

export const DEFAULT_SETTINGS = {
  text: TEXT_FALLBACK,
  mode: 'magnetic',
  weight: 900,
  spacing: 0,
  intensity: INTENSITY_BASE,
  // id는 SCSS $accents 맵의 키와 일치해야 함
  accent: 'orange',
};
