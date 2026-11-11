// Shared names and numbers for the game logic.
// All numbers are simplified game values, not real astronaut measurements.

// Every screen the game can show. state.screen is always one of these.
export const SCREENS = Object.freeze({
  START: 'start',
  BRIEFING: 'briefing',
  RADIATION: 'radiation',
  RADIATION_OUTCOME: 'radiationOutcome',
  HEALTH_EVENT: 'healthEvent',
  HABITAT: 'habitat',
  REPORT: 'report',
})

// The two steps inside each habitat round (Sol).
export const HABITAT_PHASES = Object.freeze({
  CHOOSE: 'choose',
  OUTCOME: 'outcome',
})

// Choice ids for the radiation decision (screen 3).
export const RADIATION_CHOICES = Object.freeze({
  INSPECT_MONITORS: 'inspectMonitors',
  CHECK_SHIELDING: 'checkShielding',
  SKIP_CHECKS: 'skipChecks',
})

// Choice ids for the health event (only after skipChecks).
export const HEALTH_CHOICES = Object.freeze({
  TREAT_CREW: 'treatCrew',
  REST_AND_CONTINUE: 'restAndContinue',
})

// Choice ids for the three Mars habitat rounds.
export const HABITAT_CHOICES = Object.freeze({
  // Sol 1: Set up life support
  DEPLOY_OXYGEN_GENERATOR: 'deployOxygenGenerator',
  DRILL_FOR_ICE: 'drillForIce',
  DEPLOY_SOLAR_PANELS: 'deploySolarPanels',
  // Sol 2: Dust storm approaching
  RUN_ON_RESERVES: 'runOnReserves',
  ESSENTIAL_SYSTEMS_ONLY: 'essentialSystemsOnly',
  CLEAN_PANELS_EVA: 'cleanPanelsEVA',
  // Sol 3: Water recycler fault
  REPAIR_RECYCLER: 'repairRecycler',
  RATION_WATER: 'rationWater',
  IGNORE_FAULT: 'ignoreFault',
})

// The four game values the player manages.
export const RESOURCE_KEYS = Object.freeze(['crewSafety', 'power', 'oxygen', 'water'])

// Every game value is kept between these limits.
export const MIN_VALUE = 0
export const MAX_VALUE = 100

// Any value at or below this line fails the mission.
export const FAIL_AT = 10

// Minimum final values needed for a full success.
export const SUCCESS_THRESHOLDS = Object.freeze({
  oxygen: 30,
  water: 30,
  power: 30,
  crewSafety: 50,
})

// Applied after every habitat round choice.
export const UPKEEP = Object.freeze({
  oxygen: -15,
  water: -10,
  power: -10,
})
