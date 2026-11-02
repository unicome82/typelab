import { useId } from 'react';
import { MODES, WEIGHT_RANGE, SPACING_RANGE, INTENSITY_RANGE } from '../../constants/settings.js';
import TextField from './TextField.jsx';
import SelectField from './SelectField.jsx';
import RangeField from './RangeField.jsx';

// 패널 없이 텍스트와 모든 조절 옵션을 한 줄에 노출
function ControlBar({ settings, onChange }) {
  const uid = useId();
  const ids = {
    text: `${uid}-text`,
    weight: `${uid}-weight`,
    spacing: `${uid}-spacing`,
    mode: `${uid}-mode`,
    intensity: `${uid}-intensity`,
  };

  return (
    <div className="control-bar" role="group" aria-label="타이포그래피 설정">
      <div className="field is-text">
        <label className="label" htmlFor={ids.text}>
          Text
        </label>
        <TextField id={ids.text} value={settings.text} onChange={(text) => onChange({ text })} />
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
        <label className="label" htmlFor={ids.mode}>
          Mode
        </label>
        <SelectField id={ids.mode} value={settings.mode} options={MODES} onChange={(mode) => onChange({ mode })} />
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
