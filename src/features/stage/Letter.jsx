// 한글 자모·음절 — 영문 대문자보다 커 보이므로 크기·기준선을 따로 맞춤
export const HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

function Letter({ char, letterRef }) {
  return (
    <span ref={letterRef} className={`letter${HANGUL.test(char) ? ' is-hangul' : ''}`}>
      <span className="glyph">{char}</span>
    </span>
  );
}

export default Letter;
