import { TEXT_MAX_LENGTH, TEXT_MAX_LINES } from '../../constants/settings.js';

// 무대는 단어마다 줄을 바꾸므로 줄 수를 넘는 띄어쓰기는 입력 단계에서 막음 (붙여넣기는 앞 단어만 남김)
function limitWords(value) {
  const words = value.trimStart().split(/\s+/);
  return words.length > TEXT_MAX_LINES ? words.slice(0, TEXT_MAX_LINES).join(' ') : value;
}

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
      onChange={(e) => onChange(limitWords(e.target.value))}
    />
  );
}

export default TextField;
