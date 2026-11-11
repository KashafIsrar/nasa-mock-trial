import { motion, useReducedMotion } from 'framer-motion';

const W = 300;
const H = 160;
const CX = 90;
const CY = 80;

const STARS = [
  [20, 18], [60, 40], [140, 20], [200, 50], [250, 30], [270, 90],
  [30, 110], [80, 130], [230, 120], [10, 70], [180, 140], [260, 65],
];

const STAGE_RING_COLOR = {
  approach: 'var(--cyan)',
  crossing: 'var(--cyan)',
  safe: 'var(--green)',
  damaged: 'var(--danger)',
};

const STAGE_SHIP_X = {
  approach: 240,
  crossing: 110,
  safe: 150,
  damaged: 130,
};

const pulse = {
  animate: { opacity: [0.9, 0.4, 0.9] },
  transition: { duration: 1.8, ease: (t) => Math.floor(t * 4) / 4, repeat: Infinity },
};

const flicker = {
  animate: { opacity: [1, 0.2, 1, 0.3, 1] },
  transition: { duration: 0.6, ease: 'linear', repeat: 2 },
};

export default function CockpitScene({ stage = 'approach' }) {
  const ringColor = STAGE_RING_COLOR[stage] ?? STAGE_RING_COLOR.approach;
  const shipX = STAGE_SHIP_X[stage] ?? STAGE_SHIP_X.approach;
  const isDamaged = stage === 'damaged';
  const reduceMotion = useReducedMotion();

  const ringAnim = reduceMotion ? { animate: { opacity: 0.9 }, transition: { duration: 0 } } : isDamaged ? flicker : pulse;
  const shipTransition = reduceMotion ? { duration: 0 } : { duration: 1.2, ease: (t) => Math.floor(t * 5) / 5 };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      style={{ width: '100%', maxWidth: 420, border: '4px solid var(--line)', boxShadow: '4px 4px 0 var(--shadow)', background: 'var(--bg)' }}
      role="img"
      aria-label={`Cockpit view: ${stage}`}
    >
      {STARS.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={2} height={2} fill="var(--line)" />
      ))}

      {/* Earth, built from a pixel grid */}
      <g>
        {Array.from({ length: 16 }).flatMap((_, row) =>
          Array.from({ length: 16 }).map((_, col) => {
            const dx = col - 7.5;
            const dy = row - 7.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 7.5) return null;
            const isLand = (row * 3 + col * 5) % 7 === 0 && dist < 6;
            return (
              <rect
                key={`${row}-${col}`}
                x={CX - 32 + col * 4}
                y={CY - 32 + row * 4}
                width={4}
                height={4}
                fill={isLand ? 'var(--green)' : 'var(--cyan)'}
              />
            );
          })
        )}
      </g>

      {/* Radiation belt rings */}
      <motion.circle
        cx={CX}
        cy={CY}
        r={46}
        fill="none"
        stroke={ringColor}
        strokeWidth={3}
        strokeDasharray="4 3"
        {...ringAnim}
      />
      <motion.circle
        cx={CX}
        cy={CY}
        r={60}
        fill="none"
        stroke={ringColor}
        strokeWidth={3}
        strokeDasharray="4 3"
        {...ringAnim}
        transition={{ ...ringAnim.transition, delay: reduceMotion ? 0 : 0.3 }}
      />
      <motion.circle
        cx={CX}
        cy={CY}
        r={74}
        fill="none"
        stroke={ringColor}
        strokeWidth={3}
        strokeDasharray="4 3"
        {...ringAnim}
        transition={{ ...ringAnim.transition, delay: reduceMotion ? 0 : 0.6 }}
      />

      {/* Spacecraft */}
      <motion.g
        animate={{ x: shipX }}
        transition={shipTransition}
      >
        <rect y={CY - 6} width={14} height={4} fill="var(--line)" />
        <rect y={CY - 2} width={18} height={4} fill="var(--line)" />
        <rect y={CY + 2} width={14} height={4} fill="var(--line)" />
        <rect x={18} y={CY - 2} width={6} height={4} fill="var(--mars)" />
      </motion.g>
    </svg>
  );
}
