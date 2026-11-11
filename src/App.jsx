import { useReducer } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import StartScreen from './pages/StartScreen.jsx';
import RadiationMission from './pages/RadiationMission.jsx';
import MarsHabitat from './pages/MarsHabitat.jsx';
import MissionReport from './pages/MissionReport.jsx';
import { radiationChoices } from './dev/placeholderMissionData.js';

function clamp(v) {
  return Math.max(0, Math.min(100, v));
}

function applyChanges(resources, changes = {}) {
  const next = { ...resources };
  for (const key of Object.keys(changes)) {
    if (key in next) next[key] = clamp(next[key] + changes[key]);
  }
  return next;
}

// TEMPORARY scaffold reducer, pending Dev A's real src/game/gameLogic.js and initialState.js.
// Only handles screen routing well enough for UI work; swap for the real import once merged.
const initialState = {
  screen: 'start',
  resources: { crewSafety: 100, power: 100, oxygen: 100, water: 100 },
  flags: { earlyWarning: false, reinforcedShield: false, crewExposed: false },
  radiationChoice: null,
  healthChoice: null,
  habitatRound: 0,
  lastOutcome: null,
  log: [],
  result: null,
};

function tempReducer(state, action) {
  switch (action.type) {
    case 'START_MISSION':
      return { ...state, screen: 'briefing' };
    case 'BEGIN_CROSSING':
      return { ...state, screen: 'radiation' };
    case 'CHOOSE_RADIATION': {
      if (state.screen !== 'radiation' || state.radiationChoice) return state;
      const choice = radiationChoices.find((c) => c.id === action.choiceId);
      if (!choice) return state;
      return {
        ...state,
        screen: 'radiationOutcome',
        radiationChoice: choice.id,
        resources: applyChanges(state.resources, choice.effects),
        flags: { ...state.flags, [choice.flag]: true },
        lastOutcome: { ...choice.outcome, changes: choice.effects },
      };
    }
    case 'CONTINUE': {
      if (state.screen !== 'radiationOutcome') return state;
      return {
        ...state,
        screen: state.radiationChoice === 'skipChecks' ? 'healthEvent' : 'habitat',
      };
    }
    case 'RESTART':
      return { ...initialState, resources: { ...initialState.resources }, flags: { ...initialState.flags } };
    default:
      return state;
  }
}

export function getPageForScreen(screen) {
  switch (screen) {
    case 'start':
      return StartScreen;
    case 'briefing':
    case 'radiation':
    case 'radiationOutcome':
    case 'healthEvent':
      return RadiationMission;
    case 'habitat':
      return MarsHabitat;
    case 'report':
      return MissionReport;
    default:
      return null;
  }
}

const pixelWipe = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.32, ease: (t) => Math.floor(t * 4) / 4 } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: (t) => Math.floor(t * 4) / 4 } },
};

export function SignalLost({ dispatch }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="pixel-panel" style={{ textAlign: 'center' }}>
        <div className="pixel-panel__tab">ERROR</div>
        <h2 style={{ color: 'var(--danger)' }}>SIGNAL LOST</h2>
        <button type="button" className="pixel-btn pixel-btn--primary" onClick={() => dispatch({ type: 'RESTART' })}>
          Restart
        </button>
      </div>
    </div>
  );
}

function App() {
  const [state, dispatch] = useReducer(tempReducer, initialState);
  const Page = getPageForScreen(state.screen);

  return (
    <>
      <div className="pixel-stars" aria-hidden="true" />
      <Header screen={state.screen} />
      <AnimatePresence mode="wait">
        <motion.div
          key={state.screen}
          initial={pixelWipe.initial}
          animate={pixelWipe.animate}
          exit={pixelWipe.exit}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {Page ? <Page state={state} dispatch={dispatch} /> : <SignalLost dispatch={dispatch} />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default App;
