import PixelIcon from './PixelIcon.jsx';

const RESOURCE_META = {
  crewSafety: { label: 'CREW', icon: 'crew' },
  power: { label: 'POWER', icon: 'bolt' },
  oxygen: { label: 'OXYGEN', icon: 'oxygen' },
  water: { label: 'WATER', icon: 'water' },
};

const SEGMENTS = 10;

function statusFor(value) {
  if (value <= 10) return { word: 'CRITICAL', tier: 'critical' };
  if (value < 30) return { word: 'LOW', tier: 'low' };
  return { word: 'OK', tier: 'ok' };
}

function Bar({ value }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * SEGMENTS);
  const { tier } = statusFor(value);
  return (
    <div className="pixel-bar" role="presentation">
      {Array.from({ length: SEGMENTS }).map((_, i) => (
        <div
          key={i}
          className={`pixel-bar__seg ${i < filled ? `pixel-bar__seg--filled pixel-bar__seg--${tier}` : ''}`}
          style={{ transitionDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  );
}

export default function ResourcePanel({ resources, show }) {
  const keys = show && show.length ? show : Object.keys(resources);

  return (
    <div className="pixel-panel" role="group" aria-label="Resource status">
      <div className="pixel-panel__tab">STATUS</div>
      <div style={{ display: 'grid', gap: 12 }}>
        {keys.map((key) => {
          const value = resources[key] ?? 0;
          const meta = RESOURCE_META[key] ?? { label: key.toUpperCase(), icon: 'star' };
          const { word, tier } = statusFor(value);
          const color = tier === 'ok' ? 'var(--green)' : tier === 'low' ? 'var(--yellow)' : 'var(--danger)';
          return (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                  <PixelIcon name={meta.icon} color="var(--line)" size={16} />
                  {meta.label}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 20 }}>
                  {Math.round(value)} <span style={{ color, fontFamily: 'var(--font-head)', fontSize: 9 }}>{word}</span>
                </span>
              </div>
              <Bar value={value} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
