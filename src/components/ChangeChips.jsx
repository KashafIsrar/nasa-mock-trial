const LABELS = {
  crewSafety: 'CREW',
  power: 'POWER',
  oxygen: 'OXYGEN',
  water: 'WATER',
};

export default function ChangeChips({ changes }) {
  const entries = Object.entries(changes ?? {}).filter(([, v]) => v !== 0 && v != null);
  if (!entries.length) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="list" aria-label="Resource changes">
      {entries.map(([key, value]) => {
        const positive = value > 0;
        const label = LABELS[key] ?? key.toUpperCase();
        return (
          <span
            key={key}
            role="listitem"
            aria-label={`${label} ${positive ? 'increased' : 'decreased'} by ${Math.abs(value)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              border: '4px solid var(--line)',
              boxShadow: '4px 4px 0 var(--shadow)',
              padding: '4px 8px',
              fontSize: 9,
              fontFamily: 'var(--font-head)',
              background: positive ? 'var(--green)' : 'var(--danger)',
              color: '#1a1030',
            }}
          >
            {label} {positive ? '+' : ''}{value}
          </span>
        );
      })}
    </div>
  );
}
