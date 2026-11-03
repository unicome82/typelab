import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import usePointer from '../../hooks/usePointer.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import { TEXT_FALLBACK, TEXT_MAX_LINES, INTENSITY_BASE, FONT_AXES as AXIS } from '../../constants/settings.js';
import { REST, getEffect } from './effects.js';
import useFitText from './useFitText.js';
import Letter, { HANGUL } from './Letter.jsx';

const MS_PER_SECOND = 1000;
// 자간 설정 단위: 1/100em
const SPACING_UNIT_EM = 0.01;
const NBSP = ' ';
// 커서 활성도·글자 변형을 각각 한 번 더 보간해 모드 전환과 진입/이탈이 튀지 않게
const ENERGY_EASE = 0.06;
const OUTPUT_EASE = 0.18;
const REST_KEYS = Object.keys(REST);

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const toChars = (str) => Array.from(str).map((c) => (c === ' ' ? NBSP : c));

// 단어마다 한 줄, 줄 수를 넘는 단어는 마지막 줄에 이어 붙임
function toLines(text) {
  const display = (text.trim() || TEXT_FALLBACK).toUpperCase();
  const words = display.split(/\s+/);
  const lastStart = TEXT_MAX_LINES - 1;
  const lines = [...words.slice(0, lastStart), words.slice(lastStart).join(' ')].filter(Boolean);
  let offset = 0;
  return {
    display,
    lines: lines.map((line) => {
      const chars = toChars(line);
      const start = offset;
      offset += chars.length;
      return { chars, start, hangul: HANGUL.test(line) };
    }),
  };
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
}

function Stage({ settings }) {
  const { text, mode, weight, spacing, intensity } = settings;
  const { display, lines } = useMemo(() => toLines(text), [text]);
  const reducedMotion = useReducedMotion();

  const stageRef = useRef(null);
  const wordRef = useRef(null);
  const letterRefs = useRef([]);
  // 프레임 루프는 리렌더 없이 돌기 때문에 최신 값을 ref로 읽음
  const live = useRef({ mode, weight, intensity, reducedMotion });
  const motion = useRef({ energy: 0, values: [], pointer: {} });

  // 레이아웃 효과(맞춤 계산)보다 먼저 갱신돼야 첫 배치에 최신 값이 쓰임
  useLayoutEffect(() => {
    live.current = { mode, weight, intensity, reducedMotion };
  }, [mode, weight, intensity, reducedMotion]);

  const renderStatic = useCallback((layout) => {
    const { weight: baseWght } = live.current;
    motion.current.values = layout.letters.map(() => ({ ...REST }));
    layout.letters.forEach((l) => writeLetter(l.el, REST, baseWght));
  }, []);

  const layoutRef = useFitText({
    stageRef,
    wordRef,
    letterRefs,
    deps: [display, weight, spacing],
    onLayout: (layout) => {
      if (live.current.reducedMotion) renderStatic(layout);
    },
  });

  const onFrame = useCallback(
    (p) => {
      const layout = layoutRef.current;
      if (live.current.reducedMotion) {
        renderStatic(layout);
        return;
      }
      const { mode: currentMode, weight: baseWght, intensity: currentIntensity } = live.current;
      const strength = currentIntensity / INTENSITY_BASE;
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
          // 강도는 기본 상태(REST)로부터의 변형량에만 곱해 0이면 정지, 200이면 두 배
          const goal = REST[key] + ((target[key] ?? REST[key]) - REST[key]) * strength;
          v[key] += (goal - v[key]) * OUTPUT_EASE;
        });
        writeLetter(letter.el, v, baseWght);
      });
    },
    [layoutRef, renderStatic]
  );

  usePointer(stageRef, { onFrame, disabled: reducedMotion });

  return (
    <section ref={stageRef} className="stage" aria-label={display}>
      <p
        ref={wordRef}
        className="word"
        aria-hidden="true"
        style={{ '--wght': weight, '--ls': `${spacing * SPACING_UNIT_EM}em` }}
      >
        {lines.map((line) => (
          <span key={line.start} className={`line${line.hangul ? ' has-hangul' : ''}`}>
            {line.chars.map((char, ci) => {
              const i = line.start + ci;
              return (
                <Letter
                  key={i}
                  char={char}
                  letterRef={(el) => {
                    letterRefs.current[i] = el;
                  }}
                />
              );
            })}
          </span>
        ))}
      </p>
    </section>
  );
}

export default Stage;
