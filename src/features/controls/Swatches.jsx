import { ACCENTS } from '../../constants/settings.js';

// data-accent를 달면 _common의 규칙이 --accent를 해당 색으로 바꿔 줌
function Swatches({ value, onChange }) {
  return (
    <div className="list" role="group" aria-label="강조 색상">
      {ACCENTS.map((id) => {
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            className="item"
            data-accent={id}
            aria-label={id}
            aria-pressed={selected}
            onClick={() => onChange(id)}
          >
            {selected && (
              <span className="material-symbols-outlined fill" aria-hidden="true">
                check
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Swatches;
