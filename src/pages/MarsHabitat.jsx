import ResourcePanel from '../components/ResourcePanel.jsx';

export default function MarsHabitat({ state, dispatch }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24 }}>
      <div className="pixel-panel" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div className="pixel-panel__tab">MARS HABITAT</div>
        <h3>SOL {state.habitatRound + 1} OF 3</h3>
        <p className="text-muted">Habitat scene and decision cards build here in Phase 4.</p>
      </div>
      <ResourcePanel resources={state.resources} show={['oxygen', 'water', 'power']} />
      <button type="button" className="pixel-btn pixel-btn--secondary" onClick={() => dispatch({ type: 'RESTART' })}>
        Restart
      </button>
    </div>
  );
}
