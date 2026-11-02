// 네이티브 select를 유지해 모바일 OS 피커와 키보드 접근성을 그대로 활용
function SelectField({ id, value, options, onChange, ariaLabel }) {
  return (
    <div className="select-wrap">
      <select id={id} className="select" value={value} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined ico" aria-hidden="true">
        expand_more
      </span>
    </div>
  );
}

export default SelectField;
