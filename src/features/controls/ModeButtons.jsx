// 모드가 5개뿐이라 드롭다운 대신 버튼으로 모두 노출해 한 번에 비교·전환
function ModeButtons({ value, options, onChange, ariaLabel }) {
  return (
    <div className="modes" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`mode${option.id === value ? ' is-active' : ''}`}
          aria-pressed={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default ModeButtons;
