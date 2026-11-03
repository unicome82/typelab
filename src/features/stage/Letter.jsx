// 한글 자모·음절 — 대문자 높이보다 위아래로 넘치므로 줄 단위로 여백을 더함
export const HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

function Letter({ char, letterRef }) {
  return (
    <span ref={letterRef} className="letter">
      <span className="glyph">{char}</span>
    </span>
  );
}

export default Letter;
