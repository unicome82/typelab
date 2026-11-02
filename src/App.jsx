function App() {
  return (
    <>
      <header className="header">
        <div className="inner">
          <h1 className="logo">TYPE LAB</h1>
          <span className="material-symbols-outlined">text_fields</span>
        </div>
      </header>

      {/* 섹션은 단계 ③~⑥에서 채움 */}
      <main className="main">
        <section className="intro">
          <div className="inner">
            <p className="eyebrow">Kinetic Typography Lab</p>
            <h2 className="tit">TYPE LAB</h2>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="inner">
          <p className="txt">Set in Roboto Flex · Google Fonts</p>
        </div>
      </footer>
    </>
  );
}

export default App;
