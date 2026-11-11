import PixelIcon from './PixelIcon.jsx';

const SEGMENTS = 10;

function statusFor(value) {
  if (value <= 10) return { word: 'CRITICAL', tier: 'critical' };
  if (value < 30) return { word: 'LOW', tier: 'low' };
  return { word: 'OK', tier: 'ok' };
}

export default function MissionControl({ message, resources }) {
  const power = resources?.power ?? 0;
  const crewSafety = resources?.crewSafety ?? 0;
  const powerStatus = statusFor(power);
  const filled = Math.round((Math.max(0, Math.min(100, power)) / 100) * SEGMENTS);

  return (
    <div className="pixel-panel" style={{ maxWidth: 440 }}>
      <div className="pixel-panel__tab">MISSION CONTROL</div>

      <div className="dialog-box" style={{ marginBottom: 16 }}>
        <p style={{ margin: 0 }}>
          {message}
          <span className="dialog-box__cursor" aria-hidden="true" />
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, marginBottom: 6 }}>
        <PixelIcon name="crew" color="var(--line)" size={16} />
        CREW STATUS: {statusFor(crewSafety).word} ({Math.round(crewSafety)})
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, marginBottom: 10 }}>
        <PixelIcon name="bolt" color="var(--line)" size={16} />
        POWER LEVEL: {Math.round(power)} {powerStatus.word}
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, marginBottom: 4 }}>
          <PixelIcon name="star" color="var(--pink)" size={14} />
          RADIATION MONITOR <span className="text-muted">(simplified game value)</span>
        </div>
        <div className="pixel-bar" aria-label={`Radiation monitor: ${Math.round(power)}, ${powerStatus.word}`}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className={`pixel-bar__seg ${i < filled ? `pixel-bar__seg--filled pixel-bar__seg--${powerStatus.tier}` : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
