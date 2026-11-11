import { useState } from 'react';
import MissionControl from '../components/MissionControl.jsx';
import CockpitScene from '../components/CockpitScene.jsx';
import ResourcePanel from '../components/ResourcePanel.jsx';
import DecisionCard from '../components/DecisionCard.jsx';
import ChangeChips from '../components/ChangeChips.jsx';
// TEMPORARY: pending Dev A's real src/game/missionData.js (see src/dev/placeholderMissionData.js).
import { briefingText, radiationChoices } from '../dev/placeholderMissionData.js';

function Briefing({ state, dispatch }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <MissionControl message={briefingText} resources={state.resources} />
      <button type="button" className="pixel-btn pixel-btn--primary" onClick={() => dispatch({ type: 'BEGIN_CROSSING' })}>
        Begin crossing
      </button>
    </div>
  );
}

function Radiation({ state, dispatch }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (choiceId) => {
    if (selected) return;
    setSelected(choiceId);
    dispatch({ type: 'CHOOSE_RADIATION', choiceId });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24 }}>
      <CockpitScene stage="approach" />
      <ResourcePanel resources={state.resources} show={['crewSafety', 'power']} />
      <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 440 }}>
        {radiationChoices.map((choice, i) => (
          <DecisionCard
            key={choice.id}
            id={choice.id}
            index={i}
            title={choice.title}
            description={choice.description}
            onSelect={handleSelect}
            disabled={Boolean(selected)}
            selected={selected === choice.id}
          />
        ))}
      </div>
    </div>
  );
}

function RadiationOutcome({ state, dispatch }) {
  const outcome = state.lastOutcome;
  const crewDrop = outcome?.changes?.crewSafety ?? 0;
  const stage = crewDrop <= -20 ? 'damaged' : 'safe';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24 }}>
      <CockpitScene stage={stage} />
      <div className="dialog-box" style={{ maxWidth: 440 }}>
        {outcome ? (
          <>
            <h3 style={{ marginTop: 0, color: 'var(--yellow)' }}>{outcome.title}</h3>
            <p style={{ margin: 0 }}>
              {outcome.message}
              <span className="dialog-box__cursor" aria-hidden="true" />
            </p>
          </>
        ) : (
          <p style={{ margin: 0 }} className="text-muted">
            Signal unclear &mdash; no outcome recorded.
            <span className="dialog-box__cursor" aria-hidden="true" />
          </p>
        )}
      </div>
      {outcome && <ChangeChips changes={outcome.changes} />}
      <button type="button" className="pixel-btn pixel-btn--primary" onClick={() => dispatch({ type: 'CONTINUE' })}>
        Continue
      </button>
    </div>
  );
}

function HealthEventPlaceholder({ dispatch }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="pixel-panel" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div className="pixel-panel__tab">MEDICAL ALERT</div>
        <p className="text-muted">Health event screen builds here (section 8.3).</p>
        <button type="button" className="pixel-btn pixel-btn--secondary" onClick={() => dispatch({ type: 'RESTART' })}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default function RadiationMission({ state, dispatch }) {
  switch (state.screen) {
    case 'briefing':
      return <Briefing state={state} dispatch={dispatch} />;
    case 'radiation':
      return <Radiation state={state} dispatch={dispatch} />;
    case 'radiationOutcome':
      return <RadiationOutcome state={state} dispatch={dispatch} />;
    case 'healthEvent':
      return <HealthEventPlaceholder state={state} dispatch={dispatch} />;
    default:
      return null;
  }
}
