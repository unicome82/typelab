export const MODES = [
  { id: 'magnetic', label: 'Magnetic' },
  { id: 'stretch', label: 'Stretch' },
  { id: 'wave', label: 'Wave' },
  { id: 'scatter', label: 'Scatter' },
  { id: 'rotate', label: 'Rotate' },
];

// id는 SCSS $accents 맵의 키와 일치해야 함
export const ACCENTS = ['orange', 'yellow', 'pink', 'blue', 'green'];

export const COLOR_MODES = [
  { id: 'mono', label: 'Mono' },
  { id: 'palette', label: 'Palette' },
];

export const TEXT_MAX_LENGTH = 10;
export const TEXT_FALLBACK = 'TYPE';

export const WEIGHT_RANGE = { min: 100, max: 1000, step: 10 };
// 자간 단위: 1/100em
export const SPACING_RANGE = { min: -10, max: 20, step: 1 };

export const DEFAULT_SETTINGS = {
  text: TEXT_FALLBACK,
  mode: 'magnetic',
  weight: 900,
  spacing: 0,
  colorMode: 'mono',
  accent: 'orange',
};
