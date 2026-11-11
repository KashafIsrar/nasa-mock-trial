import { SCREENS, RESOURCE_KEYS, MIN_VALUE, MAX_VALUE, RADIATION_CHOICES } from './constants.js'
import { getInitialState } from './initialState.js'
import { missionData } from './missionData.js'

// Keeps a number inside the allowed range (0 to 100).
function clamp(value) {
  return Math.min(MAX_VALUE, Math.max(MIN_VALUE, value))
}

// Adds each change to the matching resource and returns a NEW resources object.
// Example: applyChanges({ power: 100, ... }, { power: -10 }) -> { power: 90, ... }
// - Only the four known resource keys are changed; other keys are ignored.
// - Results are kept between 0 and 100.
// - The original resources object is never modified.
export function applyChanges(resources, changes) {
  const newResources = { ...resources }
  if (!changes) return newResources

  for (const key of RESOURCE_KEYS) {
    const delta = changes[key]
    if (Number.isFinite(delta)) {
      newResources[key] = clamp(newResources[key] + delta)
    }
  }
  return newResources
}

// Applies the player's radiation choice and moves to the outcome screen.
// Returns the state unchanged if the choice id is invalid, if we are not on
// the radiation screen, or if a radiation choice was already made.
export function resolveRadiationChoice(state, choiceId) {
  if (state.screen !== SCREENS.RADIATION) return state
  if (state.radiationChoice !== null) return state

  const choice = missionData.radiationChoices.find((c) => c.id === choiceId)
  if (!choice) return state

  const changes = { ...choice.effects }

  return {
    ...state,
    screen: SCREENS.RADIATION_OUTCOME,
    resources: applyChanges(state.resources, changes),
    flags: { ...state.flags, [choice.flag]: true },
    radiationChoice: choice.id,
    lastOutcome: {
      title: choice.outcome.title,
      message: choice.outcome.message,
      changes,
      choiceChanges: changes,
      upkeepChanges: null, // no upkeep during the radiation crossing
      flagNote: null, // the new flag only affects later habitat choices
    },
    log: [...state.log, { step: SCREENS.RADIATION, choiceId: choice.id, changes }],
  }
}

// Decides where CONTINUE goes after the radiation outcome.
// Only skipChecks has the extra health event; the others go to the habitat.
// Failure is not checked here: it is evaluated after the habitat rounds.
export function getNextScreenAfterRadiation(state) {
  if (state.radiationChoice === RADIATION_CHOICES.SKIP_CHECKS) {
    return SCREENS.HEALTH_EVENT
  }
  return SCREENS.HABITAT
}

// Receives the current state and an action, and returns the next state.
// Actions that are unknown or sent from the wrong screen return the state
// unchanged, so the reducer never throws.
export function gameReducer(state, action) {
  switch (action?.type) {
    case 'START_MISSION':
      if (state.screen !== SCREENS.START) return state
      return { ...state, screen: SCREENS.BRIEFING }

    case 'BEGIN_CROSSING':
      if (state.screen !== SCREENS.BRIEFING) return state
      return { ...state, screen: SCREENS.RADIATION }

    case 'CHOOSE_RADIATION':
      return resolveRadiationChoice(state, action.choiceId)

    case 'CONTINUE':
      if (state.screen === SCREENS.RADIATION_OUTCOME) {
        return { ...state, screen: getNextScreenAfterRadiation(state) }
      }
      return state

    case 'RESTART':
      return getInitialState()

    default:
      return state
  }
}
