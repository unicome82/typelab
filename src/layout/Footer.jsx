import { useId, useState } from 'react';

function Footer({ children }) {
  const panelId = useId();
  // 접으면 무대가 남은 높이를 모두 차지해 글자를 더 크게 볼 수 있음
  const [open, setOpen] = useState(true);

  return (
    <footer className="footer">
      <div id={panelId} className="inner panel" hidden={!open}>
        <p className="hint">Move your cursor to play.</p>
        {children}
      </div>
      <div className="inner bottom">
        <p className="copy">Copyright ⓒ 2026 UNI</p>
        <button
          type="button"
          className="toggle"
          aria-controls={panelId}
          aria-expanded={open}
          aria-label={open ? '조절 영역 접기' : '조절 영역 펼치기'}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {open ? 'keyboard_arrow_down' : 'tune'}
          </span>
        </button>
      </div>
    </footer>
  );
}

export default Footer;
