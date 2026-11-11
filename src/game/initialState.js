import { SCREENS, HABITAT_PHASES, MAX_VALUE } from './constants.js'

// The game state at the very start of a mission.
// Shape follows the contract in the development plan (section 4) plus the
// finalized team decisions in CLAUDE.md.
export const initialState = {
  // Which screen is shown. Navigation is driven by this field.
  screen: SCREENS.START,

  // The four simplified game values. Every one starts full.
  resources: {
    crewSafety: MAX_VALUE,
    power: MAX_VALUE,
    oxygen: MAX_VALUE,
    water: MAX_VALUE,
  },

  // Set by the radiation choice; they change some later habitat choices.
  flags: {
    earlyWarning: false,
    reinforcedShield: false,
    crewExposed: false,
  },

  // Choices made so far (null until the player chooses).
  radiationChoice: null, // 'inspectMonitors' | 'checkShielding' | 'skipChecks'
  healthChoice: null, // 'treatCrew' | 'restAndContinue' | null

  // Mars habitat progress.
  habitatRound: 0, // 0, 1, 2 -> Sol 1, 2, 3
  habitatPhase: HABITAT_PHASES.CHOOSE, // 'choose' | 'outcome'

  // What happened after the most recent choice:
  // { title, message, changes, choiceChanges, upkeepChanges, flagNote }
  lastOutcome: null,

  // Every choice made, in order: [{ step, choiceId, changes }]
  log: [],

  // Set when the mission ends:
  // { tier, score, rank, reason, lessons, endedOnRound }
  result: null,
}

// Returns a brand-new copy of the initial state, including fresh nested
// objects and arrays, so a new game never shares data with an old one.
export function getInitialState() {
  return structuredClone(initialState)
}
