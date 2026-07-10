import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import CardGrid from './components/CardGrid.jsx';
import LogFeed from './components/LogFeed.jsx';

const API = 'http://localhost:3001';

export default function App() {
  const [cards, setCards] = useState([]);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const [totalRuns, setTotalRuns] = useState(0);
  const [alerts, setAlerts] = useState(0);
  const eventSourceRef = useRef(null);

  const appendLog = useCallback((message, type = 'info') => {
    setLogs(prev => {
      const next = [...prev, { message, type, ts: new Date().toISOString() }];
      return next.slice(-200);
    });
  }, []);

  useEffect(() => {
    fetch(`${API}/api/scraper/status`)
      .then(r => r.json())
      .then(d => setScraperRunning(d.running))
      .catch(() => {});

    const es = new EventSource(`${API}/api/events`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'connected') {
        setCards(data.cards);
        setConnected(true);
        if (data.totalRuns != null) setTotalRuns(data.totalRuns);
        if (data.totalAlerts != null) setAlerts(data.totalAlerts);
      }

      if (data.type === 'run') {
        setCards(prev => prev.map((c, i) => i === data.index ? { ...c, ...data.card } : c));
        if (data.totalRuns != null) setTotalRuns(data.totalRuns);
        appendLog(`Checked: ${data.card.cardName}`, 'info');
      }

      if (data.type === 'alert') {
        if (data.totalAlerts != null) setAlerts(data.totalAlerts);
        appendLog(data.message, 'alert');
      }

      if (data.type === 'emailSent') {
        setCards(prev => prev.map((c, i) => i === data.index ? { ...c, emailSent: true, status: 'alerted' } : c));
        appendLog(`Email sent for: ${data.card.cardName}`, 'success');
      }

      if (data.type === 'log') {
        appendLog(data.message, 'log');
      }

      if (data.type === 'error') {
        appendLog(data.message, 'error');
      }

      if (data.type === 'scraperStarted') {
        setScraperRunning(true);
        appendLog('Scraper started', 'success');
      }

      if (data.type === 'scraperStopped') {
        setScraperRunning(false);
        appendLog(`Scraper stopped (exit code ${data.code ?? 0})`, 'warn');
      }
    };

    return () => es.close();
  }, [appendLog]);

  const handleStart = async () => {
    const res = await fetch(`${API}/api/scraper/start`, { method: 'POST' });
    const data = await res.json();
    if (!data.started) appendLog(data.message, 'warn');
  };

  const handleStop = async () => {
    const res = await fetch(`${API}/api/scraper/stop`, { method: 'POST' });
    const data = await res.json();
    if (!data.stopped) appendLog(data.message, 'warn');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        connected={connected}
        scraperRunning={scraperRunning}
        onStart={handleStart}
        onStop={handleStop}
      />
      <main style={{ padding: '24px 32px', flex: 1 }}>
        <StatsBar
          totalCards={cards.length}
          totalRuns={totalRuns}
          alerts={alerts}
          emailsSent={cards.filter(c => c.emailSent).length}
        />
        <CardGrid cards={cards} />
        <LogFeed logs={logs} />
      </main>
    </div>
  );
}
