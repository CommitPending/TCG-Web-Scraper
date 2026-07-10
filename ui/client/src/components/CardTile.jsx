function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function CardTile({ card }) {
  const statusColor = {
    idle: 'var(--text-muted)',
    checked: '#38bdf8',
    alerted: 'var(--green)',
  }[card.status] || 'var(--text-muted)';

  const statusLabel = {
    idle: 'Idle',
    checked: 'Checked',
    alerted: 'Alert Sent',
  }[card.status] || 'Idle';

  const formattedPrice = card.desiredPrice != null
    ? `$${Number(card.desiredPrice).toFixed(2)}`
    : '—';

  const lastChecked = card.lastChecked
    ? new Date(card.lastChecked).toLocaleTimeString()
    : 'Never';

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${card.emailSent ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'border-color 0.3s',
      boxShadow: card.emailSent ? '0 0 16px rgba(34,197,94,0.08)' : 'none',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {card.imageUrl && (
          <img
            src={card.imageUrl}
            alt={card.cardName}
            width={90}
            height={126}
            style={{
              borderRadius: '8px',
              objectFit: 'cover',
              flexShrink: 0,
              background: 'var(--surface2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.4 }}>
              {card.cardName}
            </div>
            <span style={{
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: '999px',
              background: 'var(--surface2)',
              color: statusColor,
              border: `1px solid ${statusColor}44`,
              whiteSpace: 'nowrap',
              fontWeight: 500,
              flexShrink: 0,
            }}>
              {statusLabel}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Tag label={card.cardCondition} />
            <Tag label={card.lanuage || 'English'} />
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
      }}>
        <Metric label="Target Price" value={formattedPrice} highlight="var(--accent)" />
        <Metric label="Runs" value={card.runCount ?? 0} highlight="#38bdf8" />
        <Metric label="Last Checked" value={lastChecked} small />
      </div>

      <div style={{
        fontSize: '12px',
        color: card.emailSent ? 'var(--green)' : 'var(--text-muted)',
        background: card.emailSent ? 'var(--green-glow)' : 'var(--surface2)',
        border: `1px solid ${card.emailSent ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
        borderRadius: '6px',
        padding: '8px 12px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconCheck />
          {card.emailSent ? 'Email alert sent' : 'Email alert pending'}
        </span>
        {card.emailSent && (
          <span style={{ fontSize: '11px', opacity: 0.7 }}>Notified</span>
        )}
      </div>

      <a
        href={card.url}
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: '12px',
          color: 'var(--accent)',
          textDecoration: 'none',
          opacity: 0.8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <IconLink /> View on TCGPlayer
      </a>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span style={{
      fontSize: '11px',
      padding: '2px 8px',
      borderRadius: '4px',
      background: 'var(--surface2)',
      color: 'var(--text-dim)',
      border: '1px solid var(--border)',
    }}>
      {label}
    </span>
  );
}

function Metric({ label, value, highlight, small }) {
  return (
    <div style={{
      background: 'var(--surface2)',
      borderRadius: '8px',
      padding: '10px 12px',
    }}>
      <div style={{
        fontSize: small ? '12px' : '20px',
        fontWeight: small ? 400 : 700,
        color: highlight || 'var(--text)',
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
        {label}
      </div>
    </div>
  );
}
