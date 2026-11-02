function Header({ panelOpen, onTogglePanel }) {
  return (
    <header className="header">
      <div className="inner">
        <h1 className="logo">TYPE LAB.</h1>
        <p className="tagline">Kinetic Typography Playground — 2026</p>
        <button
          type="button"
          className="icon-btn"
          aria-label={panelOpen ? '설정 닫기' : '설정 열기'}
          aria-expanded={panelOpen}
          aria-controls="control-panel"
          onClick={onTogglePanel}
        >
          <span className="material-symbols-outlined">{panelOpen ? 'close' : 'menu'}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
