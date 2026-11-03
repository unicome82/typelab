import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import usePointer from '../../hooks/usePointer.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import { TEXT_FALLBACK, TEXT_MAX_LINES, INTENSITY_BASE, FONT_AXES as AXIS, LATIN_WEIGHT } from '../../constants/settings.js';
import { REST, getEffect } from './effects.js';
import useFitText from './useFitText.js';
import Letter, { HANGUL } from './Letter.jsx';

const MS_PER_SECOND = 1000;
// 자간 설정 단위: 1/100em
const SPACING_UNIT_EM = 0.01;
const NBSP = ' ';
// 커서 활성도·글자 변형을 각각 한 번 더 보간해 모드 전환과 진입/이탈이 튀지 않게
const ENERGY_EASE = 0.06;
// 터치는 짧게 닿았다 떨어지므로 빠르게 켜고, 뗀 뒤엔 여운을 길게 남겨 효과를 볼 시간을 줌
const ENERGY_RISE_TOUCH = 0.3;
const ENERGY_FALL_TOUCH = 0.025;
const OUTPUT_EASE = 0.18;
// 한 프레임 변화가 이보다 작으면 멈춘 것으로 봄
const SETTLE_EPS = 0.001;
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

// 슬라이더 굵기(축 전체 범위)를 영문 전용 범위로 비례 변환
function toLatinWeight(wght) {
  const t = (wght - AXIS.wghtMin) / (AXIS.wghtMax - AXIS.wghtMin);
  return LATIN_WEIGHT.min + t * (LATIN_WEIGHT.max - LATIN_WEIGHT.min);
}

function writeLetter({ el, hangul }, v, baseWght) {
  const s = el.style;
  s.setProperty('--tx', `${v.tx}px`);
  s.setProperty('--ty', `${v.ty}px`);
  s.setProperty('--rot', `${v.rot}deg`);
  s.setProperty('--skew', `${v.skew}deg`);
  s.setProperty('--sx', v.sx);
  s.setProperty('--sy', v.sy);
  const wght = clamp(baseWght + v.wght, AXIS.wghtMin, AXIS.wghtMax);
  s.setProperty('--wght', hangul ? wght : toLatinWeight(wght));
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
  const motion = useRef({ energy: 0, values: [], pointer: {}, moving: false });

  // 레이아웃 효과(맞춤 계산)보다 먼저 갱신돼야 첫 배치에 최신 값이 쓰임
  useLayoutEffect(() => {
    live.current = { mode, weight, intensity, reducedMotion };
  }, [mode, weight, intensity, reducedMotion]);

  const renderStatic = useCallback((layout) => {
    const { weight: baseWght } = live.current;
    motion.current.values = layout.letters.map(() => ({ ...REST }));
    layout.letters.forEach((l) => writeLetter(l, REST, baseWght));
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
        return false;
      }
      const { mode: currentMode, weight: baseWght, intensity: currentIntensity } = live.current;
      const strength = currentIntensity / INTENSITY_BASE;
      const m = motion.current;
      const touchEase = p.active ? ENERGY_RISE_TOUCH : ENERGY_FALL_TOUCH;
      const energyStep = ((p.active ? 1 : 0) - m.energy) * (p.touch ? touchEase : ENERGY_EASE);
      m.energy += energyStep;
      let moving = Math.abs(energyStep) > SETTLE_EPS;
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
          const step = (goal - v[key]) * OUTPUT_EASE;
          v[key] += step;
          if (Math.abs(step) > SETTLE_EPS) moving = true;
        });
        writeLetter(letter, v, baseWght);
      });
      // 움직이는 동안만 글자를 합성 레이어로 올려, 멈춰 있을 땐 큰 글자 레이어 메모리를 돌려줌
      if (m.moving !== moving) {
        stageRef.current?.classList.toggle('is-moving', moving);
        m.moving = moving;
      }
      // false면 usePointer가 루프를 쉼 — 모든 글자가 목표에 닿아 더 그릴 게 없을 때
      return moving;
    },
    [layoutRef, renderStatic]
  );

  const { wake } = usePointer(stageRef, { onFrame, disabled: reducedMotion });

  // 커서가 멈춰 루프가 쉬는 중에도 설정이 바뀌면 새 값으로 다시 그림
  useEffect(() => {
    wake();
  }, [wake, display, mode, weight, spacing, intensity]);

  return (
    <section ref={stageRef} className="stage" aria-label={display}>
      <p
        ref={wordRef}
        className="word"
        aria-hidden="true"
        style={{ '--wght': toLatinWeight(weight), '--wght-ko': weight, '--ls': `${spacing * SPACING_UNIT_EM}em` }}
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
