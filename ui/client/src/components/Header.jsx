function IconCards() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="16" height="13" rx="2" />
      <path d="M6 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconStop() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

export default function Header({ connected, scraperRunning, onStart, onStop }) {
  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <IconCards />
        <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px' }}>
          TCG Price Tracker
        </span>
        <span style={{
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '999px',
          background: connected ? 'var(--green-glow)' : 'rgba(100,116,139,0.2)',
          color: connected ? 'var(--green)' : 'var(--text-muted)',
          fontWeight: 500,
          border: `1px solid ${connected ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
        }}>
          {connected ? '● LIVE' : '○ OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: scraperRunning ? 'var(--green)' : 'var(--text-muted)',
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: scraperRunning ? 'var(--green)' : 'var(--text-muted)',
            boxShadow: scraperRunning ? '0 0 6px var(--green)' : 'none',
            display: 'inline-block',
            animation: scraperRunning ? 'pulse 2s infinite' : 'none',
          }} />
          {scraperRunning ? 'Scraper running' : 'Scraper idle'}
        </div>

        {!scraperRunning ? (
          <button onClick={onStart} style={{ ...btnStyle('var(--accent)'), display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconPlay /> Start Scraper
          </button>
        ) : (
          <button onClick={onStop} style={{ ...btnStyle('var(--red)'), display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconStop /> Stop Scraper
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}

function btnStyle(bg) {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    transition: 'opacity 0.15s',
  };
}
