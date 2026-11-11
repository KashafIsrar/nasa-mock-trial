import PixelIcon from './PixelIcon.jsx';

const STEPS = [
  { key: 'briefing', label: 'BRIEFING', screens: ['briefing'] },
  { key: 'radiation', label: 'RADIATION', screens: ['radiation', 'radiationOutcome', 'healthEvent'] },
  { key: 'mars', label: 'MARS', screens: ['habitat'] },
  { key: 'report', label: 'REPORT', screens: ['report'] },
];

export default function Header({ screen }) {
  const activeIndex = STEPS.findIndex((step) => step.screens.includes(screen));

  return (
    <header style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <h1 className="pixel-wordmark">MARSBOUND</h1>
      <nav aria-label="Mission progress" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {STEPS.map((step, i) => {
          const done = activeIndex > i;
          const current = activeIndex === i;
          const color = done || current ? 'var(--yellow)' : 'var(--muted)';
          return (
            <span
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 9,
                color,
                opacity: current ? 1 : undefined,
                animation: current ? 'blink 1s steps(1) infinite' : 'none',
              }}
            >
              <PixelIcon name="star" color={color} size={14} />
              {step.label}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
