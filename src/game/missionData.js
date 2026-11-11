import { RADIATION_CHOICES } from './constants.js'

// Mission text and choice data. Data only, no logic.
// Values come from the development plan (Phase 1 step 3 and section 5).
// Text marked "proposed wording" is not in the plan; it was agreed by the team.
export const missionData = {
  briefing:
    "Commander, your crew is approaching Earth's radiation belts. Choose how to prepare for the crossing.",

  radiationChoices: [
    {
      id: RADIATION_CHOICES.INSPECT_MONITORS,
      title: 'Inspect radiation monitoring equipment',
      // proposed wording, not from the plan
      description:
        'Spend some power checking the monitors so the crew gets warning of a particle surge.',
      effects: { power: -10, crewSafety: -5 },
      flag: 'earlyWarning',
      outcome: {
        title: 'Early warning', // proposed wording, not from the plan
        message:
          'Monitors caught a particle surge early. The crew sheltered in time, with minor exposure.',
      },
    },
    {
      id: RADIATION_CHOICES.CHECK_SHIELDING,
      title: 'Check spacecraft shielding',
      // proposed wording, not from the plan
      description: 'Use extra power to reinforce the hull before entering the belts.',
      effects: { power: -20 },
      flag: 'reinforcedShield',
      outcome: {
        title: 'Hull reinforced', // proposed wording, not from the plan
        message:
          'Shielding is reinforced. The crew crosses safely, but the power reserve is lower.',
      },
    },
    {
      id: RADIATION_CHOICES.SKIP_CHECKS,
      title: 'Continue without additional checks',
      // proposed wording, not from the plan
      description:
        'Head straight through the radiation belts without preparing the crew or the ship.',
      effects: { crewSafety: -40, oxygen: -10 },
      flag: 'crewExposed',
      outcome: {
        title: 'Exposure', // proposed wording, not from the plan
        message: 'The crew crossed unprepared and several members feel unwell.',
      },
    },
  ],
}
