import { describe, it, expect } from 'vitest'
import {
  applyChanges,
  gameReducer,
  resolveRadiationChoice,
  getNextScreenAfterRadiation,
} from './gameLogic.js'
import { initialState, getInitialState } from './initialState.js'
import { SCREENS, RADIATION_CHOICES } from './constants.js'

const fullResources = { crewSafety: 100, power: 100, oxygen: 100, water: 100 }

describe('applyChanges', () => {
  it('adds positive and negative changes', () => {
    const result = applyChanges(
      { crewSafety: 50, power: 50, oxygen: 50, water: 50 },
      { power: -10, water: 20 },
    )
    expect(result).toEqual({ crewSafety: 50, power: 40, oxygen: 50, water: 70 })
  })

  it('clamps values at 0', () => {
    const result = applyChanges({ ...fullResources, oxygen: 5 }, { oxygen: -20 })
    expect(result.oxygen).toBe(0)
  })

  it('clamps values at 100', () => {
    const result = applyChanges({ ...fullResources, power: 90 }, { power: 25 })
    expect(result.power).toBe(100)
  })

  it('does not mutate the original resources object', () => {
    const resources = { ...fullResources }
    const result = applyChanges(resources, { power: -10 })
    expect(resources).toEqual(fullResources)
    expect(result).not.toBe(resources)
  })

  it('ignores unknown resource keys', () => {
    const result = applyChanges(fullResources, { fuel: -50, power: -10 })
    expect(result).toEqual({ ...fullResources, power: 90 })
    expect(result).not.toHaveProperty('fuel')
  })
})

describe('gameReducer', () => {
  it('START_MISSION moves from start to briefing', () => {
    const state = gameReducer(getInitialState(), { type: 'START_MISSION' })
    expect(state.screen).toBe(SCREENS.BRIEFING)
  })

  it('BEGIN_CROSSING moves from briefing to radiation', () => {
    const briefing = { ...getInitialState(), screen: SCREENS.BRIEFING }
    const state = gameReducer(briefing, { type: 'BEGIN_CROSSING' })
    expect(state.screen).toBe(SCREENS.RADIATION)
  })

  it('returns the same state for an action sent on the wrong screen', () => {
    const start = getInitialState()
    expect(gameReducer(start, { type: 'BEGIN_CROSSING' })).toBe(start)

    const briefing = { ...getInitialState(), screen: SCREENS.BRIEFING }
    expect(gameReducer(briefing, { type: 'START_MISSION' })).toBe(briefing)
  })

  it('returns the same state for an unknown or missing action', () => {
    const state = getInitialState()
    expect(gameReducer(state, { type: 'NOT_A_REAL_ACTION' })).toBe(state)
    expect(gameReducer(state, undefined)).toBe(state)
  })

  it('RESTART restores the initial state from any point', () => {
    const midGame = {
      ...getInitialState(),
      screen: SCREENS.RADIATION,
      resources: { crewSafety: 40, power: 30, oxygen: 20, water: 10 },
      flags: { earlyWarning: true, reinforcedShield: false, crewExposed: false },
      log: [{ step: 'radiation', choiceId: 'inspectMonitors', changes: { power: -10 } }],
    }
    const state = gameReducer(midGame, { type: 'RESTART' })
    expect(state).toEqual(initialState)
    expect(state).not.toBe(initialState)
  })
})

// A fresh state sitting on the radiation decision screen.
function radiationState() {
  return { ...getInitialState(), screen: SCREENS.RADIATION }
}

describe('resolveRadiationChoice', () => {
  it('inspectMonitors: power -10, crewSafety -5, sets earlyWarning', () => {
    const state = resolveRadiationChoice(radiationState(), RADIATION_CHOICES.INSPECT_MONITORS)
    expect(state.resources).toEqual({ crewSafety: 95, power: 90, oxygen: 100, water: 100 })
    expect(state.flags).toEqual({ earlyWarning: true, reinforcedShield: false, crewExposed: false })
    expect(state.radiationChoice).toBe('inspectMonitors')
    expect(state.screen).toBe(SCREENS.RADIATION_OUTCOME)
  })

  it('checkShielding: power -20, sets reinforcedShield', () => {
    const state = resolveRadiationChoice(radiationState(), RADIATION_CHOICES.CHECK_SHIELDING)
    expect(state.resources).toEqual({ crewSafety: 100, power: 80, oxygen: 100, water: 100 })
    expect(state.flags).toEqual({ earlyWarning: false, reinforcedShield: true, crewExposed: false })
    expect(state.radiationChoice).toBe('checkShielding')
    expect(state.screen).toBe(SCREENS.RADIATION_OUTCOME)
  })

  it('skipChecks: crewSafety -40, oxygen -10, sets crewExposed', () => {
    const state = resolveRadiationChoice(radiationState(), RADIATION_CHOICES.SKIP_CHECKS)
    expect(state.resources).toEqual({ crewSafety: 60, power: 100, oxygen: 90, water: 100 })
    expect(state.flags).toEqual({ earlyWarning: false, reinforcedShield: false, crewExposed: true })
    expect(state.radiationChoice).toBe('skipChecks')
    expect(state.screen).toBe(SCREENS.RADIATION_OUTCOME)
  })

  it('fills lastOutcome and appends to log', () => {
    const state = resolveRadiationChoice(radiationState(), RADIATION_CHOICES.INSPECT_MONITORS)
    expect(state.lastOutcome).toEqual({
      title: 'Early warning',
      message:
        'Monitors caught a particle surge early. The crew sheltered in time, with minor exposure.',
      changes: { power: -10, crewSafety: -5 },
      choiceChanges: { power: -10, crewSafety: -5 },
      upkeepChanges: null,
      flagNote: null,
    })
    expect(state.log).toEqual([
      { step: 'radiation', choiceId: 'inspectMonitors', changes: { power: -10, crewSafety: -5 } },
    ])
  })

  it('does not mutate the original state', () => {
    const before = radiationState()
    resolveRadiationChoice(before, RADIATION_CHOICES.SKIP_CHECKS)
    expect(before).toEqual(radiationState())
  })

  it('returns the same state for an invalid or missing choice id', () => {
    const state = radiationState()
    expect(resolveRadiationChoice(state, 'notAChoice')).toBe(state)
    expect(resolveRadiationChoice(state, undefined)).toBe(state)
  })

  it('returns the same state for a second choice after the first', () => {
    const afterFirst = resolveRadiationChoice(radiationState(), RADIATION_CHOICES.CHECK_SHIELDING)
    expect(resolveRadiationChoice(afterFirst, RADIATION_CHOICES.SKIP_CHECKS)).toBe(afterFirst)

    // Even if somehow back on the radiation screen, a choice already made is kept.
    const backOnRadiation = { ...afterFirst, screen: SCREENS.RADIATION }
    expect(resolveRadiationChoice(backOnRadiation, RADIATION_CHOICES.SKIP_CHECKS)).toBe(
      backOnRadiation,
    )
  })

  it('returns the same state on the wrong screen', () => {
    const briefing = { ...getInitialState(), screen: SCREENS.BRIEFING }
    expect(resolveRadiationChoice(briefing, RADIATION_CHOICES.INSPECT_MONITORS)).toBe(briefing)
  })
})

describe('getNextScreenAfterRadiation', () => {
  it('routes inspectMonitors to habitat', () => {
    const state = { ...getInitialState(), radiationChoice: RADIATION_CHOICES.INSPECT_MONITORS }
    expect(getNextScreenAfterRadiation(state)).toBe(SCREENS.HABITAT)
  })

  it('routes checkShielding to habitat', () => {
    const state = { ...getInitialState(), radiationChoice: RADIATION_CHOICES.CHECK_SHIELDING }
    expect(getNextScreenAfterRadiation(state)).toBe(SCREENS.HABITAT)
  })

  it('routes skipChecks to healthEvent', () => {
    const state = { ...getInitialState(), radiationChoice: RADIATION_CHOICES.SKIP_CHECKS }
    expect(getNextScreenAfterRadiation(state)).toBe(SCREENS.HEALTH_EVENT)
  })
})

describe('gameReducer: radiation mission', () => {
  // Plays START_MISSION -> BEGIN_CROSSING -> CHOOSE_RADIATION -> CONTINUE.
  function playRadiation(choiceId) {
    let state = getInitialState()
    state = gameReducer(state, { type: 'START_MISSION' })
    state = gameReducer(state, { type: 'BEGIN_CROSSING' })
    state = gameReducer(state, { type: 'CHOOSE_RADIATION', choiceId })
    expect(state.screen).toBe(SCREENS.RADIATION_OUTCOME)
    return gameReducer(state, { type: 'CONTINUE' })
  }

  it('inspectMonitors continues to habitat', () => {
    expect(playRadiation(RADIATION_CHOICES.INSPECT_MONITORS).screen).toBe(SCREENS.HABITAT)
  })

  it('checkShielding continues to habitat', () => {
    expect(playRadiation(RADIATION_CHOICES.CHECK_SHIELDING).screen).toBe(SCREENS.HABITAT)
  })

  it('skipChecks continues to healthEvent', () => {
    expect(playRadiation(RADIATION_CHOICES.SKIP_CHECKS).screen).toBe(SCREENS.HEALTH_EVENT)
  })

  it('CHOOSE_RADIATION on the wrong screen returns the same state', () => {
    const start = getInitialState()
    expect(
      gameReducer(start, { type: 'CHOOSE_RADIATION', choiceId: RADIATION_CHOICES.SKIP_CHECKS }),
    ).toBe(start)
  })

  it('CONTINUE outside the radiation outcome returns the same state', () => {
    const radiation = radiationState()
    expect(gameReducer(radiation, { type: 'CONTINUE' })).toBe(radiation)
  })
})
