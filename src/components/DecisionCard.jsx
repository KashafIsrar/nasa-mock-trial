const KEY_LABELS = ['A', 'B', 'C', 'D'];

export default function DecisionCard({ id, index = 0, title, description, onSelect, disabled, selected }) {
  return (
    <button
      type="button"
      className="pixel-panel"
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: selected ? 'var(--panel-2)' : 'var(--panel)',
        outlineOffset: selected ? 2 : undefined,
        opacity: disabled && !selected ? 0.5 : 1,
      }}
      onClick={() => onSelect?.(id)}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span
        className="pixel-panel__tab"
        aria-hidden="true"
        style={{ background: selected ? 'var(--panel-2)' : 'var(--panel)', color: 'var(--cyan)' }}
      >
        {KEY_LABELS[index] ?? index + 1}
      </span>
      <h3 style={{ margin: '4px 0 8px', color: 'var(--yellow)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 20, color: 'var(--text)' }}>{description}</p>
    </button>
  );
}
