import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_EASE = 0.12;
const CENTER = 0.5;
// 이보다 작게 움직이면 멈춘 것으로 보고 루프를 쉼(px)
const SETTLE_EPS = 0.01;

/**
 * 대상 요소 기준 포인터 좌표를 rAF + lerp로 보간해 ref로 제공.
 * 매 프레임 React 리렌더를 피하려고 state 대신 ref를 쓰고, 소비자는 onFrame에서 DOM을 직접 갱신한다.
 *
 * pointer.current: { x, y (px), nx, ny (0~1), vx, vy (프레임당 이동량), width, height, active, touch }
 *
 * 포인터도 멈추고 onFrame이 false(더 바뀔 것 없음)를 돌려주면 rAF를 멈춰 유휴 시 CPU·배터리를 아낌.
 * 다시 움직이거나 크기가 바뀌거나 wake()가 불리면 재개. 반환: { pointer, wake }
 */
function usePointer(targetRef, { ease = DEFAULT_EASE, disabled = false, onFrame } = {}) {
  const pointer = useRef({
    x: 0,
    y: 0,
    nx: CENTER,
    ny: CENTER,
    vx: 0,
    vy: 0,
    width: 0,
    height: 0,
    active: false,
    touch: false,
  });
  const onFrameRef = useRef(onFrame);
  const wakeRef = useRef(() => {});
  // 소비자 쪽 설정(모드·강도 등)이 바뀌면 멈춘 루프를 깨우기 위한 안정적인 함수
  const wake = useCallback(() => wakeRef.current(), []);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return undefined;

    const p = pointer.current;
    const target = { x: 0, y: 0, active: false };
    let rect = el.getBoundingClientRect();
    let frame = 0;

    const centerTarget = () => {
      target.x = rect.width * CENTER;
      target.y = rect.height * CENTER;
    };

    const syncSize = () => {
      rect = el.getBoundingClientRect();
      p.width = rect.width;
      p.height = rect.height;
      if (!target.active) centerTarget();
    };

    syncSize();
    Object.assign(p, { x: target.x, y: target.y, nx: CENTER, ny: CENTER, vx: 0, vy: 0, active: false });

    // 레이아웃이 바뀌면 글자 위치 캐시도 바뀌므로 멈춘 루프를 깨워 효과를 다시 계산
    const observer = new ResizeObserver(() => {
      syncSize();
      wakeRef.current();
    });
    observer.observe(el);

    if (disabled) {
      onFrameRef.current?.(p);
      return () => observer.disconnect();
    }

    const tick = () => {
      const dx = (target.x - p.x) * ease;
      const dy = (target.y - p.y) * ease;
      p.x += dx;
      p.y += dy;
      p.vx = dx;
      p.vy = dy;
      p.nx = rect.width ? p.x / rect.width : CENTER;
      p.ny = rect.height ? p.y / rect.height : CENTER;
      p.active = target.active;
      const busy = onFrameRef.current?.(p) !== false;
      const settled = Math.abs(dx) < SETTLE_EPS && Math.abs(dy) < SETTLE_EPS;
      frame = busy || !settled ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    wakeRef.current = start;

    const onMove = (e) => {
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      target.active = true;
      p.touch = e.pointerType !== 'mouse';
      start();
    };

    // 터치는 커서처럼 미리 와 있지 않으므로, 닿는 순간 보간 없이 손가락 위치로 바로 옮김
    const onDown = (e) => {
      onMove(e);
      if (p.touch) Object.assign(p, { x: target.x, y: target.y });
    };

    const onLeave = () => {
      target.active = false;
      centerTarget();
      start();
    };

    // 손을 떼도 마지막 터치 위치에 머물러 효과가 천천히 풀리게 함(가운데로 끌려가지 않음).
    // 마우스는 버튼을 떼도 커서가 화면에 남아 있으므로 비활성화하지 않음
    const onRelease = (e) => {
      if (e.pointerType === 'mouse') return;
      target.active = false;
      start();
    };

    const root = document.documentElement;
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onRelease);
    window.addEventListener('pointercancel', onRelease);
    window.addEventListener('blur', onLeave);
    root.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      wakeRef.current = () => {};
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onRelease);
      window.removeEventListener('blur', onLeave);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [targetRef, ease, disabled]);

  return { pointer, wake };
}

export default usePointer;
