import { useEffect, useRef } from 'react';

const DEFAULT_EASE = 0.12;
const CENTER = 0.5;

/**
 * 대상 요소 기준 포인터 좌표를 rAF + lerp로 보간해 ref로 제공.
 * 매 프레임 React 리렌더를 피하려고 state 대신 ref를 쓰고, 소비자는 onFrame에서 DOM을 직접 갱신한다.
 *
 * pointer.current: { x, y (px), nx, ny (0~1), vx, vy (프레임당 이동량), width, height, active }
 */
function usePointer(targetRef, { ease = DEFAULT_EASE, disabled = false, onFrame } = {}) {
  const pointer = useRef({ x: 0, y: 0, nx: CENTER, ny: CENTER, vx: 0, vy: 0, width: 0, height: 0, active: false });
  const onFrameRef = useRef(onFrame);

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

    const observer = new ResizeObserver(syncSize);
    observer.observe(el);

    if (disabled) {
      onFrameRef.current?.(p);
      return () => observer.disconnect();
    }

    const onMove = (e) => {
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      target.active = true;
    };

    const onLeave = () => {
      target.active = false;
      centerTarget();
    };

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
      onFrameRef.current?.(p);
      frame = requestAnimationFrame(tick);
    };

    const root = document.documentElement;
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    window.addEventListener('pointerup', onLeave);
    window.addEventListener('pointercancel', onLeave);
    window.addEventListener('blur', onLeave);
    root.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      window.removeEventListener('pointerup', onLeave);
      window.removeEventListener('pointercancel', onLeave);
      window.removeEventListener('blur', onLeave);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [targetRef, ease, disabled]);

  return pointer;
}

export default usePointer;
