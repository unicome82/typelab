import { useEffect, useLayoutEffect, useRef } from 'react';

// 측정용 기준 크기 — 이 크기에서 잰 비율로 실제 글자 크기를 역산
const MEASURE_FONT_SIZE = 100;
// 무대를 꽉 채우되, 변형(늘이기·흩뿌리기) 여유를 남김
const FIT_WIDTH = 0.9;
const FIT_HEIGHT = 0.82;
// 세로로 긴 화면(모바일)은 폭에 맞추면 글자가 납작해지므로 세로로 늘려 채움 — 과한 왜곡은 상한으로 막음
const FIT_STRETCH_HEIGHT = 0.7;
const MAX_FIT_STRETCH = 1.8;

function measureBox(el) {
  const { width, height } = el.getBoundingClientRect();
  return { width, height };
}

/**
 * 글자 수·무대 크기에 맞춰 --fs를 계산하고, 글자별 폭을 고정(--lw)한 뒤 중심 좌표를 캐시.
 * 폭을 고정해야 프레임마다 wght/wdth가 바뀌어도 이웃 글자가 밀리지 않고 캐시도 유효함.
 */
function useFitText({ stageRef, wordRef, letterRefs, deps, onLayout }) {
  const layoutRef = useRef({ letters: [], fontSize: 0 });
  const onLayoutRef = useRef(onLayout);

  useEffect(() => {
    onLayoutRef.current = onLayout;
  }, [onLayout]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const word = wordRef.current;
    if (!stage || !word) return undefined;

    const fit = () => {
      const els = letterRefs.current.filter(Boolean);
      // 프레임 루프가 덮어쓴 축 값이 남아 있으면 기본 굵기 기준 측정이 틀어짐
      els.forEach((el) => ['--lw', '--wght', '--wdth'].forEach((name) => el.style.removeProperty(name)));
      word.style.removeProperty('--line-pad');

      word.style.setProperty('--fs', `${MEASURE_FONT_SIZE}px`);
      const ref = measureBox(word);
      if (!ref.width || !ref.height) return;
      // 세로 늘림은 글자 높이에만 붙고 줄 간격엔 붙지 않으므로 줄 높이 합을 따로 잼
      const lineHeights = Array.from(word.children).map((line) => measureBox(line).height);
      // 한 줄 배치(가로)면 가장 큰 줄 높이만, 줄바꿈 배치(세로)면 줄 높이 합이 늘어남
      const stacked = getComputedStyle(word).flexDirection === 'column';
      const capSum = (stacked ? lineHeights.reduce((sum, h) => sum + h, 0) : Math.max(0, ...lineHeights)) || ref.height;

      const style = getComputedStyle(stage);
      const availW = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const availH = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const fontSize = Math.min(
        (availW * FIT_WIDTH * MEASURE_FONT_SIZE) / ref.width,
        (availH * FIT_HEIGHT * MEASURE_FONT_SIZE) / ref.height
      );
      const scale = fontSize / MEASURE_FONT_SIZE;
      const fitStretch = Math.min(
        Math.max(1 + (availH * FIT_STRETCH_HEIGHT - ref.height * scale) / (capSum * scale), 1),
        MAX_FIT_STRETCH
      );
      word.style.setProperty('--fs', `${fontSize}px`);
      word.style.setProperty('--fit-sy', fitStretch);
      // 늘어난 글자가 윗줄·아랫줄과 겹치지 않도록 늘어난 만큼 줄 위아래를 벌림
      const linePad = ((lineHeights[0] ?? 0) * scale * (fitStretch - 1)) / 2;
      word.style.setProperty('--line-pad', `${linePad}px`);

      const widths = els.map((el) => measureBox(el).width);
      els.forEach((el, i) => el.style.setProperty('--lw', `${widths[i]}px`));

      // .letter 자체엔 transform이 없으므로 rect가 휴지 상태 위치와 같음
      const stageRect = stage.getBoundingClientRect();
      const letters = els.map((el, index) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          index,
          count: els.length,
          cx: r.left - stageRect.left + r.width / 2,
          cy: r.top - stageRect.top + r.height / 2,
          width: r.width,
          // 세로 늘림은 글리프 transform이라 rect에 안 잡히므로 직접 반영
          height: r.height * fitStretch,
        };
      });

      layoutRef.current = { letters, fontSize };
      onLayoutRef.current?.(layoutRef.current);
    };

    fit();

    let alive = true;
    // 웹폰트가 늦게 오면 대체 글꼴 기준 측정값이 틀어지므로 재측정
    document.fonts?.ready.then(() => alive && fit()).catch(() => {});
    // 한글 폰트는 쓰인 글자 묶음만 나중에 받으므로 새 묶음이 도착할 때마다 재측정
    document.fonts?.addEventListener('loadingdone', fit);

    const observer = new ResizeObserver(fit);
    observer.observe(stage);

    return () => {
      alive = false;
      observer.disconnect();
      document.fonts?.removeEventListener('loadingdone', fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageRef, wordRef, letterRefs, ...deps]);

  return layoutRef;
}

export default useFitText;
