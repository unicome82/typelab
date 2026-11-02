import { useId } from 'react';
import { MODES, WEIGHT_RANGE, SPACING_RANGE, INTENSITY_RANGE } from '../../constants/settings.js';
import TextField from './TextField.jsx';
import ModeButtons from './ModeButtons.jsx';
import RangeField from './RangeField.jsx';

// 첫 줄은 텍스트 입력과 모드 버튼, 아래로 슬라이더를 한 줄씩 쌓음
function ControlBar({ settings, onChange }) {
  const uid = useId();
  const ids = {
    weight: `${uid}-weight`,
    spacing: `${uid}-spacing`,
    intensity: `${uid}-intensity`,
  };

  return (
    <div className="control-bar" role="group" aria-label="타이포그래피 설정">
      <div className="field is-head">
        <TextField value={settings.text} ariaLabel="Text" onChange={(text) => onChange({ text })} />
        <ModeButtons value={settings.mode} options={MODES} ariaLabel="Mode" onChange={(mode) => onChange({ mode })} />
      </div>
      <div className="field">
        <label className="label" htmlFor={ids.weight}>
          Weight
        </label>
        <RangeField id={ids.weight} value={settings.weight} range={WEIGHT_RANGE} onChange={(weight) => onChange({ weight })} />
      </div>
      <div className="field">
        <label className="label" htmlFor={ids.spacing}>
          Spacing
        </label>
        <RangeField
          id={ids.spacing}
          value={settings.spacing}
          range={SPACING_RANGE}
          onChange={(spacing) => onChange({ spacing })}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor={ids.intensity}>
          Intensity
        </label>
        <RangeField
          id={ids.intensity}
          value={settings.intensity}
          range={INTENSITY_RANGE}
          onChange={(intensity) => onChange({ intensity })}
        />
      </div>
    </div>
  );
}

export default ControlBar;
