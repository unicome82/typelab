function Footer({ children }) {
  return (
    <footer className="footer">
      <div className="inner">
        <p className="hint">Move your cursor to play.</p>
        {children}
      </div>
    </footer>
  );
}

export default Footer;
