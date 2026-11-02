const PERCENT = 100;

function RangeField({ id, value, range, onChange }) {
  // 채워진 트랙 길이를 CSS가 그리도록 비율만 변수로 넘김
  const fill = ((value - range.min) / (range.max - range.min)) * PERCENT;

  return (
    <div className="range-wrap">
      <input
        id={id}
        className="range"
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        style={{ '--fill': `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <output className="value" htmlFor={id}>
        {value}
      </output>
    </div>
  );
}

export default RangeField;
