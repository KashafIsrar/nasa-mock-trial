export default function MissionReport({ state, dispatch }) {
  const result = state.result;

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="pixel-panel" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div className="pixel-panel__tab">MISSION REPORT</div>
        {result ? (
          <>
            <h3 style={{ color: 'var(--yellow)' }}>{result.rank}</h3>
            <p>Score: {result.score}</p>
          </>
        ) : (
          <p className="text-muted">No result yet. Scoring builds here in Phase 5.</p>
        )}
        <button type="button" className="pixel-btn pixel-btn--primary" onClick={() => dispatch({ type: 'RESTART' })}>
          Play again
        </button>
      </div>
    </div>
  );
}
