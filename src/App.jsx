import { useCallback, useState } from 'react';
import Header from './layout/Header.jsx';
import Footer from './layout/Footer.jsx';
import Stage from './features/stage/Stage.jsx';
import ControlBar from './features/controls/ControlBar.jsx';
import { DEFAULT_SETTINGS, INTRO_WORDS } from './constants/settings.js';

// 들어올 때마다 다른 단어로 시작해 매번 새로운 첫인상을 줌
function createInitialSettings() {
  const text = INTRO_WORDS[Math.floor(Math.random() * INTRO_WORDS.length)];
  return { ...DEFAULT_SETTINGS, text };
}

function App() {
  const [settings, setSettings] = useState(createInitialSettings);

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
