import { MODES } from '../../constants/settings.js';
import TextField from './TextField.jsx';
import SelectField from './SelectField.jsx';

function ControlBar({ settings, onChange, panelOpen, onTogglePanel }) {
  return (
    <div className="control-bar">
      <TextField value={settings.text} onChange={(text) => onChange({ text })} ariaLabel="표시할 텍스트" />
      <SelectField
        value={settings.mode}
        options={MODES}
        onChange={(mode) => onChange({ mode })}
        ariaLabel="인터랙션 모드"
      />
      <button
        type="button"
        className="dot"
        aria-label={panelOpen ? '설정 닫기' : '설정 열기'}
        aria-expanded={panelOpen}
        aria-controls="control-panel"
        onClick={onTogglePanel}
      />
    </div>
  );
}

export default ControlBar;
