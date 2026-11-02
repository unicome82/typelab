import { useEffect, useId, useRef } from 'react';
import { MODES, COLOR_MODES, WEIGHT_RANGE, SPACING_RANGE } from '../../constants/settings.js';
import TextField from './TextField.jsx';
import SelectField from './SelectField.jsx';
import RangeField from './RangeField.jsx';
import Swatches from './Swatches.jsx';

// 토글 버튼(헤더 메뉴·컬러 도트) 클릭은 바깥 클릭으로 보지 않아야 열자마자 다시 닫히지 않음
const TOGGLE_SELECTOR = '[aria-controls="control-panel"]';
const FOCUSABLE_SELECTOR = 'input, select, button';

function usePanelDismiss(open, panelRef, onClose) {
  useEffect(() => {
    if (!open) return undefined;

    const returnTarget = document.activeElement;
    panelRef.current?.querySelector(FOCUSABLE_SELECTOR)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handlePointerDown = (e) => {
      const panel = panelRef.current;
      if (!panel || panel.contains(e.target) || e.target.closest?.(TOGGLE_SELECTOR)) return;
      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      // 패널이 사라지며 포커스를 잃은 경우에만 되돌려, 사용자가 다른 곳을 클릭해 옮긴 포커스는 빼앗지 않음
      const active = document.activeElement;
      const focusLost = !active || active === document.body;
      if (focusLost && returnTarget instanceof HTMLElement && returnTarget.isConnected) {
        returnTarget.focus({ preventScroll: true });
      }
    };
  }, [open, panelRef, onClose]);
}

function Panel({ open, settings, onChange, onClose }) {
  const panelRef = useRef(null);
  const uid = useId();
  const ids = {
    text: `${uid}-text`,
    weight: `${uid}-weight`,
    spacing: `${uid}-spacing`,
    mode: `${uid}-mode`,
    colorMode: `${uid}-color-mode`,
  };

  usePanelDismiss(open, panelRef, onClose);

  // 닫힌 상태는 렌더하지 않아 탭 순서에서도 완전히 빠지게 함
  if (!open) return null;

  return (
    <section id="control-panel" ref={panelRef} className="panel" role="dialog" aria-label="타이포그래피 설정">
      <div className="row is-stack">
        <label className="label" htmlFor={ids.text}>
          Text
        </label>
        <TextField id={ids.text} value={settings.text} onChange={(text) => onChange({ text })} />
      </div>
      <div className="row">
        <label className="label" htmlFor={ids.weight}>
          Weight
        </label>
        <RangeField id={ids.weight} value={settings.weight} range={WEIGHT_RANGE} onChange={(weight) => onChange({ weight })} />
      </div>
      <div className="row">
        <label className="label" htmlFor={ids.spacing}>
          Letter spacing
        </label>
        <RangeField
          id={ids.spacing}
          value={settings.spacing}
          range={SPACING_RANGE}
          onChange={(spacing) => onChange({ spacing })}
        />
      </div>
      <div className="row">
        <label className="label" htmlFor={ids.mode}>
          Interaction
        </label>
        <SelectField id={ids.mode} value={settings.mode} options={MODES} onChange={(mode) => onChange({ mode })} />
      </div>
      <div className="row">
        <label className="label" htmlFor={ids.colorMode}>
          Color mode
        </label>
        <SelectField
          id={ids.colorMode}
          value={settings.colorMode}
          options={COLOR_MODES}
          onChange={(colorMode) => onChange({ colorMode })}
        />
      </div>
      <Swatches value={settings.accent} onChange={(accent) => onChange({ accent })} />
    </section>
  );
}

export default Panel;
