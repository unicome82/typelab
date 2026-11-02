import { TEXT_MAX_LENGTH } from '../../constants/settings.js';

// 빈 문자열도 그대로 전달: 입력 중 지우는 상태를 허용하고 대체 텍스트는 Stage가 처리
function TextField({ id, value, onChange, ariaLabel }) {
  return (
    <input
      id={id}
      className="input"
      type="text"
      value={value}
      maxLength={TEXT_MAX_LENGTH}
      size={TEXT_MAX_LENGTH}
      spellCheck={false}
      autoComplete="off"
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default TextField;
