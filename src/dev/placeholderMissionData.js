// TEMPORARY placeholder, pending Dev A's real src/game/missionData.js.
// Same shape the contract describes, copied from docs/choices.md's radiation table,
// so swapping the import later is a one-line change.

export const briefingText =
  "Commander, your crew is approaching Earth's radiation belts. Choose how to prepare for the crossing.";

export const radiationChoices = [
  {
    id: 'inspectMonitors',
    title: 'Inspect radiation monitoring equipment',
    description: 'Check the sensors for an early warning before the crossing.',
    effects: { power: -10, crewSafety: -5 },
    flag: 'earlyWarning',
    outcome: {
      title: 'Early warning',
      message: 'Monitors caught a particle surge early. The crew sheltered in time, with minor exposure.',
    },
  },
  {
    id: 'checkShielding',
    title: 'Check spacecraft shielding',
    description: 'Reinforce the hull before the belts, at the cost of power.',
    effects: { power: -20 },
    flag: 'reinforcedShield',
    outcome: {
      title: 'Hull reinforced',
      message: 'Shielding is reinforced. The crew crosses safely, but the power reserve is lower.',
    },
  },
  {
    id: 'skipChecks',
    title: 'Continue without additional checks',
    description: 'Press on and save time, accepting the risk.',
    effects: { crewSafety: -40, oxygen: -10 },
    flag: 'crewExposed',
    outcome: {
      title: 'Exposure',
      message: 'The crew crossed unprepared and several members feel unwell.',
    },
  },
];
