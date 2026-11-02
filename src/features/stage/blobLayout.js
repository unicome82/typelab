import { ACCENTS } from '../../constants/settings.js';

// 크기·위치는 글자 크기 비율 — 텍스트 길이·화면 크기가 바뀌어도 구도가 유지되게
const DOT = { size: 0.3, offsetX: 0.5, offsetY: 0.3 };
const PATCH = { size: 0.4, offsetX: -0.05, offsetY: -0.12 };
const CURSOR = { size: 0.26 };

export const CURSOR_FOLLOW_MODES = ['magnetic', 'stretch'];

/**
 * 렌더할 블롭 목록. mono는 모두 --accent, palette는 선택한 액센트부터 순서대로 다른 색.
 * patch는 palette에서만 — mono에서 같은 색 블롭이 셋이면 구도가 답답해짐.
 */
export function getBlobs(colorMode, accent) {
  const start = Math.max(ACCENTS.indexOf(accent), 0);
  const colorAt = (offset) => (colorMode === 'palette' ? ACCENTS[(start + offset) % ACCENTS.length] : undefined);
  const blobs = [
    { id: 'dot', color: colorAt(0) },
    { id: 'cursor', color: colorAt(2) },
  ];
  if (colorMode === 'palette') blobs.splice(1, 0, { id: 'patch', color: colorAt(1) });
  return blobs;
}

/** 글자 배치 기준 블롭 중심·지름(px). dot은 마지막 글자 오른쪽 아래, patch는 첫 글자 위. */
export function getBlobAnchor(id, letters, fontSize) {
  if (id === 'cursor') return { letter: -1, x: 0, y: 0, size: fontSize * CURSOR.size };
  const isDot = id === 'dot';
  const spec = isDot ? DOT : PATCH;
  const index = isDot ? letters.length - 1 : 0;
  const l = letters[index];
  if (!l) return { letter: -1, x: 0, y: 0, size: 0 };
  return {
    letter: index,
    x: l.cx + l.width * spec.offsetX,
    y: l.cy + l.height * spec.offsetY,
    size: fontSize * spec.size,
  };
}
