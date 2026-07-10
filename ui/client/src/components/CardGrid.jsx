import CardTile from './CardTile.jsx';

export default function CardGrid({ cards }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h2 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '14px',
      }}>
        Tracked Cards
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '14px',
      }}>
        {cards.map((card, i) => (
          <CardTile key={i} card={card} />
        ))}
      </div>
    </div>
  );
}
