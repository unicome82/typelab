// 한글 자모·음절 — 라틴 대문자 높이 기준 다듬기를 쓰면 위아래가 잘려 줄끼리 겹침
const HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

function Letter({ char, letterRef }) {
  return (
    <span ref={letterRef} className={`letter${HANGUL.test(char) ? ' is-hangul' : ''}`}>
      <span className="glyph">{char}</span>
    </span>
  );
}

export default Letter;
