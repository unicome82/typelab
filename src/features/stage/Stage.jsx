import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import usePointer from '../../hooks/usePointer.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import { TEXT_FALLBACK } from '../../constants/settings.js';
import { AXIS, REST, getEffect } from './effects.js';
import { CURSOR_FOLLOW_MODES, getBlobAnchor, getBlobs } from './blobLayout.js';
import useFitText from './useFitText.js';
import Letter from './Letter.jsx';
import Blobs from './Blobs.jsx';

const MS_PER_SECOND = 1000;
// 자간 설정 단위: 1/100em
const SPACING_UNIT_EM = 0.01;
const NBSP = ' ';
// 커서 활성도·글자 변형·커서 블롭을 각각 한 번 더 보간해 모드 전환과 진입/이탈이 튀지 않게
const ENERGY_EASE = 0.06;
const OUTPUT_EASE = 0.18;
const BLOB_EASE = 0.08;
const REST_KEYS = Object.keys(REST);

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function toChars(text) {
  const display = (text.trim() || TEXT_FALLBACK).toUpperCase();
  return { display, chars: Array.from(display).map((c) => (c === ' ' ? NBSP : c)) };
}

function writeLetter(el, v, baseWght) {
  const s = el.style;
  s.setProperty('--tx', `${v.tx}px`);
  s.setProperty('--ty', `${v.ty}px`);
  s.setProperty('--rot', `${v.rot}deg`);
  s.setProperty('--skew', `${v.skew}deg`);
  s.setProperty('--sx', v.sx);
  s.setProperty('--sy', v.sy);
  s.setProperty('--wght', clamp(baseWght + v.wght, AXIS.wghtMin, AXIS.wghtMax));
  s.setProperty('--wdth', clamp(AXIS.wdthBase + v.wdth, AXIS.wdthMin, AXIS.wdthMax));
  s.setProperty('--gtx', `${v.gtx}px`);
  s.setProperty('--gty', `${v.gty}px`);
  s.setProperty('--grot', `${v.grot}deg`);
}

function writeBlob(el, x, y, size, scale) {
  const s = el.style;
  s.setProperty('--bx', `${x}px`);
  s.setProperty('--by', `${y}px`);
  s.setProperty('--bs', `${size}px`);
  s.setProperty('--bk', scale);
}

function Stage({ settings }) {
  const { text, mode, weight, spacing, colorMode, accent } = settings;
  const { display, chars } = useMemo(() => toChars(text), [text]);
  const blobs = useMemo(() => getBlobs(colorMode, accent), [colorMode, accent]);
  const reducedMotion = useReducedMotion();

  const stageRef = useRef(null);
  const wordRef = useRef(null);
  const letterRefs = useRef([]);
  const blobRefs = useRef([]);
  // 프레임 루프는 리렌더 없이 돌기 때문에 최신 값을 ref로 읽음
  const live = useRef({ mode, weight, blobs, reducedMotion });
  const motion = useRef({ energy: 0, values: [], cursor: { x: 0, y: 0, k: 0 }, pointer: {} });

  // 레이아웃 효과(맞춤 계산)보다 먼저 갱신돼야 첫 배치에 최신 블롭 목록이 쓰임
  useLayoutEffect(() => {
    live.current = { mode, weight, blobs, reducedMotion };
  }, [mode, weight, blobs, reducedMotion]);

  const renderBlobs = useCallback((layout, pointer, followTarget) => {
    const { cursor, values } = motion.current;
    cursor.x += (pointer.x - cursor.x) * BLOB_EASE;
    cursor.y += (pointer.y - cursor.y) * BLOB_EASE;
    cursor.k += (followTarget - cursor.k) * BLOB_EASE;

    live.current.blobs.forEach((blob, i) => {
      const el = blobRefs.current[i];
      if (!el) return;
      const anchor = getBlobAnchor(blob.id, layout.letters, layout.fontSize);
      if (blob.id === 'cursor') {
        writeBlob(el, cursor.x, cursor.y, anchor.size, cursor.k);
        return;
      }
      // 붙어 있는 글자를 따라 움직여야 흩어질 때도 구도가 유지됨
      const v = values[anchor.letter] ?? REST;
      writeBlob(el, anchor.x + v.tx, anchor.y + v.ty, anchor.size, 1);
    });
  }, []);

  const renderStatic = useCallback(
    (layout, pointer) => {
      const { weight: baseWght } = live.current;
      const m = motion.current;
      m.values = layout.letters.map(() => ({ ...REST }));
      layout.letters.forEach((l) => writeLetter(l.el, REST, baseWght));
      Object.assign(m.cursor, { x: pointer.x, y: pointer.y, k: 0 });
      renderBlobs(layout, pointer, 0);
    },
    [renderBlobs]
  );

  const layoutRef = useFitText({
    stageRef,
    wordRef,
    letterRefs,
    deps: [display, weight, spacing],
    onLayout: (layout) => {
      if (live.current.reducedMotion) renderStatic(layout, pointerRef.current);
    },
  });

  // 정지 모드엔 루프가 없으므로 블롭 구성이 바뀌면 직접 다시 배치
  useLayoutEffect(() => {
    if (reducedMotion) renderStatic(layoutRef.current, pointerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobs, reducedMotion, renderStatic, layoutRef]);

  const onFrame = useCallback(
    (p) => {
      const layout = layoutRef.current;
      if (live.current.reducedMotion) {
        renderStatic(layout, p);
        return;
      }
      const { mode: currentMode, weight: baseWght } = live.current;
      const m = motion.current;
      m.energy += ((p.active ? 1 : 0) - m.energy) * ENERGY_EASE;
      // 프레임마다 새 객체를 만들지 않도록 재사용
      const pointer = Object.assign(m.pointer, p, { energy: m.energy });
      const effect = getEffect(currentMode);
      const time = performance.now() / MS_PER_SECOND;

      layout.letters.forEach((letter, i) => {
        const target = effect(letter, pointer, time);
        const v = (m.values[i] ??= { ...REST });
        REST_KEYS.forEach((key) => {
          v[key] += ((target[key] ?? REST[key]) - v[key]) * OUTPUT_EASE;
        });
        writeLetter(letter.el, v, baseWght);
      });

      const follows = CURSOR_FOLLOW_MODES.includes(currentMode) ? m.energy : 0;
      renderBlobs(layout, pointer, follows);
    },
    [layoutRef, renderBlobs, renderStatic]
  );

  const pointerRef = usePointer(stageRef, { onFrame, disabled: reducedMotion });

  return (
    <section ref={stageRef} className="stage" aria-label={display} data-mode={mode}>
      <p
        ref={wordRef}
        className="word"
        aria-hidden="true"
        style={{ '--wght': weight, '--ls': `${spacing * SPACING_UNIT_EM}em` }}
      >
        {chars.map((char, i) => (
          <Letter
            key={i}
            char={char}
            letterRef={(el) => {
              letterRefs.current[i] = el;
            }}
          />
        ))}
      </p>
      <Blobs blobs={blobs} blobRefs={blobRefs} />
    </section>
  );
}

export default Stage;
