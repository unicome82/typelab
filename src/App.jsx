import { useCallback, useState } from 'react';
import Header from './layout/Header.jsx';
import Footer from './layout/Footer.jsx';
import Stage from './features/stage/Stage.jsx';
import ControlBar from './features/controls/ControlBar.jsx';
import Panel from './features/controls/Panel.jsx';
import { DEFAULT_SETTINGS } from './constants/settings.js';

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [panelOpen, setPanelOpen] = useState(false);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const togglePanel = useCallback(() => setPanelOpen((open) => !open), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  return (
    <div className="app" data-accent={settings.accent}>
      <Header panelOpen={panelOpen} onTogglePanel={togglePanel} />
      <main className="main">
        <Stage settings={settings} />
      </main>
      <Footer>
        <ControlBar settings={settings} onChange={updateSettings} panelOpen={panelOpen} onTogglePanel={togglePanel} />
      </Footer>
      <Panel open={panelOpen} settings={settings} onChange={updateSettings} onClose={closePanel} />
    </div>
  );
}

export default App;
