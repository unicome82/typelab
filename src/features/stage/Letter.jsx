function Letter({ char, letterRef }) {
  return (
    <span ref={letterRef} className="letter">
      <span className="glyph">{char}</span>
    </span>
  );
}

export default Letter;
