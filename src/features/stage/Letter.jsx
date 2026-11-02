// ghost는 rotate 모드의 잔상용 복제 — 표시 여부는 CSS(data-mode)가 결정
function Letter({ char, letterRef }) {
  return (
    <span ref={letterRef} className="letter">
      <span className="ghost">{char}</span>
      <span className="glyph">{char}</span>
    </span>
  );
}

export default Letter;
