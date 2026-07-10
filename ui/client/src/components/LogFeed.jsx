import { useEffect, useRef } from 'react';

const typeStyle = {
  info:    { color: 'var(--text-dim)',   prefix: '·' },
  log:     { color: '#475569',           prefix: '·' },
  success: { color: 'var(--green)',      prefix: '✓' },
  alert:   { color: 'var(--yellow)',     prefix: '⚡' },
  warn:    { color: 'var(--yellow)',     prefix: '⚠' },
  error:   { color: 'var(--red)',        prefix: '✕' },
};

export default function LogFeed({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div>
      <h2 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '14px',
      }}>
        Live Log
      </h2>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px',
        height: '280px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {logs.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No activity yet. Start the scraper to see live logs.
          </span>
        )}
        {logs.map((log, i) => {
          const { color, prefix } = typeStyle[log.type] || typeStyle.info;
          const time = new Date(log.ts).toLocaleTimeString();
          return (
            <div key={i} style={{ display: 'flex', gap: '8px', color }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{time}</span>
              <span style={{ flexShrink: 0 }}>{prefix}</span>
              <span style={{ wordBreak: 'break-word' }}>{log.message}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
