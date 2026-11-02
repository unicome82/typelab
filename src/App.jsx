import { useCallback, useState } from 'react';
import Header from './layout/Header.jsx';
import Footer from './layout/Footer.jsx';
import Stage from './features/stage/Stage.jsx';
import ControlBar from './features/controls/ControlBar.jsx';
import { DEFAULT_SETTINGS } from './constants/settings.js';

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <div className="app" data-accent={settings.accent}>
      <Header />
      <main className="main">
        <Stage settings={settings} />
      </main>
      <Footer>
        <ControlBar settings={settings} onChange={updateSettings} />
      </Footer>
    </div>
  );
}

export default App;
