# MARSBOUND — Development Plan for Claude Code

Nov 11, 2026 · Two developers · React + Vite + Framer Motion

## 1. What the game is

MARSBOUND is a short, playable browser game in which you are a Junior Astronaut Commander guiding a crew from Earth orbit to a working habitat on Mars. You make a handful of decisions, see their consequences in crew safety and resources, and finish with a mission report that teaches what you just experienced. The whole game takes 5 to 8 minutes to play and is built in 180 minutes by two developers using Claude Code.

**Player goal:** reach Mars and keep the crew alive. Every choice moves four simplified game values: crew safety, power, oxygen and water.

**The game must be able to:**

- Start the game as a Junior Astronaut Commander.
- Show a mission briefing from Mission Control.
- Offer decisions during the mission (radiation crossing, then three Mars habitat rounds).
- Apply each decision to the game values and show the consequence immediately.
- Take the player to a different next step depending on the choice made (see section 5).
- Let the player reach Mars and manage oxygen, water and power.
- End with success, partial success or failure, a score, and a short educational debrief.
- Restart cleanly from the beginning.

**Out of scope for this trial (do not build):** 3D astronaut movement, multiplayer, NASA API integration, physics simulation, login, multiple levels, realistic radiation dose calculations, Phaser. All numbers are labeled "simplified game values", not real astronaut measurements.

## 2. Gameplay design

The game is a linear mission with two branching points. The player reads a briefing, makes one radiation decision, sees an outcome, lands on Mars, then makes three habitat decisions before the final report.

**Core loop:** read the situation, pick one of three choices, see resources change and a consequence message, continue to the next situation.

**Screens, in order**

| # | Screen | What the player sees and does |
| --- | --- | --- |
| 1 | Start | Title, tagline "Humanity's next home is waiting", **Start mission** button |
| 2 | Mission Control briefing | Message from Mission Control, crew status, power level, radiation monitor, **Begin crossing** button |
| 3 | Radiation decision | Three choice cards over a cockpit view with Earth, radiation belt rings and a moving spacecraft |
| 4 | Radiation outcome | Consequence text, resource changes shown as +/- chips, **Continue** (or an extra health event, see section 5) |
| 5 | Mars habitat | Three rounds (Sol 1, 2, 3), each with a situation and three choices; live oxygen, water and power cards with a habitat illustration |
| 6 | Mission report | Final crew condition, remaining resources, score, rank and an educational debrief, **Play again** button |

**Game values (simplified, 0 to 100)**

- `crewSafety` starts at 100. If it falls to 10 or below the mission fails.
- `power` starts at 100. Spent by checks and equipment, gained from solar panels.
- `oxygen` starts at 100. Drops every habitat round, raised by the oxygen generator.
- `water` starts at 100. Drops every habitat round, raised by ice drilling or repairs.
- Values are clamped between 0 and 100. Any value at or below the failure line (FAIL\_AT = 10) fails the mission.

**Upkeep rule:** after every habitat round, oxygen, water and power each drop by a fixed amount (tuned in one config file). This forces trade-offs: fixing one resource costs another.

**Ending tiers**

- Success: oxygen, water and power all at 30 or above and crew safety at 50 or above.
- Survived with damage: all values above the failure line but below the success thresholds.
- Failure: any value at 10 or below.

**Score (0 to 100):** crew safety counts 40%, and oxygen, water and power count 20% each. Ranks: 80 and above "Mission Commander", 60 to 79 "Flight Lead", 1 to 59 "Junior Commander", failure "Mission Lost".

**Tone and visuals:** dark space background, deep navy and warm Mars orange accents, a monospace font for readouts, subtle Framer Motion transitions between screens, SVG/CSS for Earth, rings, spacecraft and habitat. Mobile-friendly layout.

## 3. Functional features

Twelve features make up the playable prototype. Dev A owns logic, Dev B owns presentation; each feature has a single owner so nobody edits the same file.

| ID | Feature | Owner | Done when |
| --- | --- | --- | --- |
| F1 | Start screen and Start mission button | Dev B | Clicking Start moves to the briefing |
| F2 | Mission Control briefing with crew, power and radiation readouts | Dev B (UI), Dev A (text and data) | Briefing shows live values from state |
| F3 | Central game state (screen, resources, flags, log) | Dev A | One reducer or state object drives every screen |
| F4 | Radiation decision: three choice cards | Dev A (data), Dev B (cards) | Each card dispatches a choice id |
| F5 | Choice effects on crew safety and power, plus flags | Dev A | Values change exactly as in the choice table |
| F6 | Radiation outcome screen with change chips | Dev B | Shows message and +/- per value |
| F7 | Branch routing after each choice | Dev A | Next screen depends on the choice (section 5) |
| F8 | Cockpit visuals: Earth, belt rings, moving spacecraft | Dev B | SVG/CSS animated, no console errors |
| F9 | Mars habitat: three rounds, upkeep, live resource cards | Dev A (logic), Dev B (UI) | Oxygen, water, power visibly change |
| F10 | End conditions, score and rank | Dev A | Success, partial and failure all reachable |
| F11 | Mission report with educational debrief | Dev B (UI), Dev A (content) | Shows final values, score, lessons |
| F12 | Restart and error handling | Both | Play again resets all state; bad input never crashes |

## 4. Architecture and shared data contract

**Stack:** React 18 + Vite, JavaScript (no TypeScript), plain CSS or Tailwind, Framer Motion, SVG/CSS visuals. State is a single `useReducer` in `App.jsx`. No Redux, Zustand or Phaser.

**Folder structure**

```text
marsbound/
  src/
    game/                  <- Dev A only
      constants.js         screen names, choice ids, thresholds, upkeep
      initialState.js      initial state + resetState()
      missionData.js       briefing text, radiation choices, branch event, habitat rounds, debrief copy
      gameLogic.js         pure functions + reducer
      gameLogic.test.js    unit tests (Vitest)
    components/            <- Dev B only
      Header.jsx
      ResourcePanel.jsx
      MissionControl.jsx
      DecisionCard.jsx
      ChangeChips.jsx
      CockpitScene.jsx     SVG Earth, rings, spacecraft
      HabitatScene.jsx     SVG habitat
    pages/                 <- Dev B only
      StartScreen.jsx
      RadiationMission.jsx
      MarsHabitat.jsx
      MissionReport.jsx
    App.jsx                owns useReducer, routes by state.screen (shared, edited only at integration)
    main.jsx
    index.css
```

**Rule:** Dev A never edits `components/` or `pages/`. Dev B never edits `game/`. If one needs a change from the other, they ask and the owner makes it.

**Shared state shape (the contract)**

```js
const initialState = {
  screen: 'start', // 'start' | 'briefing' | 'radiation' | 'radiationOutcome' | 'healthEvent' | 'habitat' | 'report'
  resources: { crewSafety: 100, power: 100, oxygen: 100, water: 100 },
  flags: { earlyWarning: false, reinforcedShield: false, crewExposed: false },
  radiationChoice: null, // 'inspectMonitors' | 'checkShielding' | 'skipChecks'
  healthChoice: null, // 'treatCrew' | 'restAndContinue' | null
  habitatRound: 0, // 0, 1, 2 -> Sol 1, 2, 3
  lastOutcome: null, // { title, message, changes: { power: -10, ... } }
  log: [], // [{ step, choiceId, changes }]
  result: null, // { tier, score, rank, reason, lessons: [] }
};
```

**Actions (dispatched by the UI, handled by Dev A's reducer)**

```js
{ type: 'START_MISSION' }          // start -> briefing
{ type: 'BEGIN_CROSSING' }         // briefing -> radiation
{ type: 'CHOOSE_RADIATION', choiceId }
{ type: 'CONTINUE' }               // outcome -> next screen chosen by logic
{ type: 'CHOOSE_HEALTH', choiceId }
{ type: 'CHOOSE_HABITAT', choiceId }
{ type: 'RESTART' }
```

**Pure functions exported from `gameLogic.js`**

```js
applyChanges(resources, changes) -> newResources    // adds deltas, clamps 0..100
resolveRadiationChoice(state, choiceId) -> state
resolveHealthChoice(state, choiceId) -> state
resolveHabitatChoice(state, choiceId) -> state       // applies choice, upkeep, advances round or ends
evaluateEnding(state) -> { tier, score, rank, reason, lessons }
gameReducer(state, action) -> state
```

**Component props (Dev B builds exactly these)**

```js
<ResourcePanel resources={state.resources} show={['crewSafety','power']} />
<DecisionCard id title description onSelect={(id) => ...} disabled />
<MissionControl message={string} resources={...} />
<ChangeChips changes={{ power: -10, crewSafety: -5 }} />
<CockpitScene stage='approach' | 'crossing' | 'safe' | 'damaged' />
<HabitatScene resources={...} />
```

Each page receives `{ state, dispatch }` and renders only from `state`. UI never changes resources itself.

## 5. Choice and consequence map

Every choice changes the game values, sets a flag that echoes later, and decides the next screen. All three radiation choices lead to the Mars habitat, but they arrive with different resources and flags. Only skipping the checks adds a health event on the way.

&#91;embedded content: choice map · 3 radiation branches, 1 extra event\]

Read top to bottom; the highlighted branch is the only one with an extra step. Dev A encodes this routing in `gameLogic.js`; Dev B only renders whatever `state.screen` says.

**Radiation decision (screen 3)**

| Choice id | Card text | Effects | Flag set | What happens next |
| --- | --- | --- | --- | --- |
| `inspectMonitors` | Inspect radiation monitoring equipment | power -10, crewSafety -5 | `earlyWarning` | Outcome screen, then habitat Sol 1 |
| `checkShielding` | Check spacecraft shielding | power -20 | `reinforcedShield` | Outcome screen, then habitat Sol 1 |
| `skipChecks` | Continue without additional checks | crewSafety -40, oxygen -10 | `crewExposed` | Outcome screen, then health event, then habitat Sol 1 |

Outcome messages: early warning ("Monitors caught a particle surge early. The crew sheltered in time, with minor exposure."), hull reinforced ("Shielding is reinforced. The crew crosses safely, but the power reserve is lower."), exposure ("The crew crossed unprepared and several members feel unwell.").

**Health event (only after `skipChecks`)**

| Choice id | Card text | Effects | Next |
| --- | --- | --- | --- |
| `treatCrew` | Treat the crew with medical supplies | crewSafety +15, water -10, power -5 | Habitat Sol 1 |
| `restAndContinue` | Rest and continue | crewSafety -10 | Habitat Sol 1 |

**Mars habitat rounds (screen 5)** — after every round, upkeep applies: oxygen -15, water -10, power -10 (all values clamp at 0 to 100).

| Round | Situation | Choice id | Effects | Next |
| --- | --- | --- | --- | --- |
| Sol 1 | Set up life support | `deployOxygenGenerator` | oxygen +20, power -15 | Sol 2 |
| Sol 1 | Set up life support | `drillForIce` | water +20, power -15 | Sol 2 |
| Sol 1 | Set up life support | `deploySolarPanels` | power +25, crewSafety -5 | Sol 2 |
| Sol 2 | Dust storm approaching | `runOnReserves` | power -25 | Sol 3 |
| Sol 2 | Dust storm approaching | `essentialSystemsOnly` | power -5, oxygen -5, water -5 | Sol 3 |
| Sol 2 | Dust storm approaching | `cleanPanelsEVA` | power +10, crewSafety -15 | Sol 3 |
| Sol 3 | Water recycler fault | `repairRecycler` | water +15, power -10, crewSafety -5 | Mission report |
| Sol 3 | Water recycler fault | `rationWater` | water -5, crewSafety -10 | Mission report |
| Sol 3 | Water recycler fault | `ignoreFault` | water -35 | Mission report |

**Flags change later choices (this is how the first decision echoes)**

| Flag | Where it applies | Effect |
| --- | --- | --- |
| `earlyWarning` | Sol 2 `runOnReserves` | Power cost is -15 instead of -25, and the screen shows "Mission Control warned you in time" |
| `reinforcedShield` | EVA choices: `deploySolarPanels`, `cleanPanelsEVA`, `repairRecycler` | crewSafety loss is halved (rounded down) |
| `crewExposed` | Sol 3 `rationWater` | crewSafety loss doubles to -20 because the crew is already weakened |

**After Sol 3:** `evaluateEnding` runs and the screen becomes `report`. Failure is any value at or below the failure line (`FAIL_AT = 10`); success needs oxygen, water, power at 30 or above and crewSafety at 50 or above; anything between is "survived with damage". All numbers are starting values, tuned later with the balance prompt in section 9.

## 6. Team split and Git workflow

**Dev A: gameplay and logic.** Owns `src/game/`: constants, initial state, mission data, reducer, branching, resource math, ending evaluation, unit tests. Works on branch `feature/game-logic`.

**Dev B: UI and visuals.** Owns `src/components/`, `src/pages/`, `index.css`: all screens, SVG scenes, animations, responsive styling. Works on branch `feature/game-ui`.

**Shared, touched only at integration:** `App.jsx`, `main.jsx`, `package.json`, and the contract in section 4. A contract change needs both developers to agree, then a message in chat before anyone codes against it.

**Rules**

- Nobody commits directly to `main`.
- Pull the latest `main` before starting a new task: `git pull origin main`, then `git merge main` into your branch.
- Commit small, working changes. Push at least every 20 minutes.
- Merge early through pull requests (first merge at minute 75, not at the end).
- The other developer reviews each pull request before merging (use the review prompts in section 9).
- Never resolve a conflict by overwriting a teammate's lines without discussing it.
- Claude Code commits only when you ask. Use these messages:

```text
Create initial game structure
Add radiation mission logic
Build cockpit dashboard
Add branch routing and health event
Add Mars habitat resource system
Build Mars habitat screen
Add mission completion and scoring
Build mission report screen
Fix integration bugs
```

**Merge points**

| Minute | Merge | Who | Check |
| --- | --- | --- | --- |
| 15 | Scaffold to `main` | Dev A | Both branches start from the same `main` |
| 75 | First integration: radiation mission | Both | Player can choose and see a result |
| 125 | Habitat integration | Both | Oxygen, water, power change on screen |
| 150 | Completion integration | Both | Full journey start to report works |
| 165 | Final fix pass | Both | Fresh clone runs |

One Claude Code session per developer, opened in their own clone, with each developer's prompt restricted to their folder.

## 7. Phased build plan and Claude Code prompts

Eight phases, 180 minutes. Each phase lists the goal, the checkpoint, and the exact prompt for each developer. Run each prompt in your own Claude Code session, inside your own clone and branch. When the time block ends, move on even if the feature is not perfect.

**How to use the prompts:** paste the prompt as is. Prompts refer to three files created in Phase 0: `CLAUDE.md` (rules), `docs/contract.md` (section 4 of this plan) and `docs/choices.md` (section 5 tables). That way nobody has to paste long tables again.

### Phase 0: Setup and Git (00:00 to 00:15), both developers

**Goal:** one repository, one running React app, one shared contract, two branches.

**Dev A: run first in an empty folder**

```text
Create a React + Vite JavaScript project named marsbound in the current folder (npm create vite@latest with the react template). Install framer-motion, and vitest as a dev dependency. Add npm scripts: dev, build, test (vitest run).

Create this structure with minimal valid placeholder files:
src/game/constants.js, initialState.js, missionData.js, gameLogic.js, gameLogic.test.js
src/components/Header.jsx, ResourcePanel.jsx, MissionControl.jsx, DecisionCard.jsx, ChangeChips.jsx, CockpitScene.jsx, HabitatScene.jsx
src/pages/StartScreen.jsx, RadiationMission.jsx, MarsHabitat.jsx, MissionReport.jsx
src/dev/mockStates.js
docs/contract.md, docs/choices.md

src/game/initialState.js exports initialState and getInitialState() (fresh deep copy) using exactly the state shape I paste below. src/game/gameLogic.js exports a stub gameReducer(state, action) that returns state, and stub applyChanges. src/App.jsx uses useReducer(gameReducer, getInitialState()), renders the page for state.screen (placeholder pages that show the screen name and a button), and passes { state, dispatch } to every page.

Create CLAUDE.md containing: one-paragraph game summary (MARSBOUND, a short Mars mission game for a Junior Astronaut Commander); folder ownership (Dev A owns src/game only; Dev B owns src/components, src/pages, src/App.jsx, src/index.css, src/dev; never edit the other developer's folders; ask me instead); the rule that the UI renders only from state and only changes state by dispatching actions; the rule that all numbers are simplified game values, not real astronaut radiation measurements; the rule that React state only, no Redux/Zustand/Phaser; and the rule: run npm run build and npm test before saying a task is done, and never commit unless I ask.

Save the text I paste below verbatim as docs/contract.md (state shape, actions, function signatures, component props) and docs/choices.md (choice tables).

Run npm run build to confirm it compiles. Do not commit.

[PASTE section 4 here]
[PASTE the tables from section 5 here]
```

**Then both developers, in the terminal (not Claude Code):**

```text
git init && git add . && git commit -m "Create initial game structure"
git branch -M main && git remote add origin <repo-url> && git push -u origin main
# Dev B: git clone <repo-url> && cd marsbound && npm install
git checkout -b feature/game-logic   # Dev A
git checkout -b feature/game-ui      # Dev B
```

**Checkpoint:** both can run `npm run dev`; the placeholder app loads; two branches exist.

### Phase 1: Foundation (00:15 to 00:35)

**Goal:** Dev A has constants, state and a safe reducer. Dev B has layout, theme, navigation and the base components.

**Dev A: foundation logic**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. You are Dev A: edit only files in src/game/.

1. constants.js: SCREENS (start, briefing, radiation, radiationOutcome, healthEvent, habitat, report), choice id constants for radiation, health and habitat choices, RESOURCE_KEYS, MIN_VALUE 0, MAX_VALUE 100, FAIL_AT 10, SUCCESS_THRESHOLDS {oxygen:30, water:30, power:30, crewSafety:50}, UPKEEP {oxygen:-15, water:-10, power:-10}.
2. initialState.js: keep the exact shape from docs/contract.md.
3. missionData.js: export the Mission Control briefing text ("Commander, your crew is approaching Earth's radiation belts. Choose how to prepare for the crossing."), and the three radiation choices (id, title, description, effects, flag, outcome title and message) copied from docs/choices.md. Data only, no logic.
4. gameLogic.js: applyChanges(resources, changes) returns a new object, adds deltas, clamps each value to 0..100, ignores unknown keys, never mutates. gameReducer handles START_MISSION (start -> briefing), BEGIN_CROSSING (briefing -> radiation) and RESTART (returns getInitialState()). Any unknown action or an action sent from the wrong screen returns the state unchanged and never throws.
5. gameLogic.test.js (Vitest): clamping at 0 and 100, no mutation, unknown keys, each action, wrong-screen action, RESTART.

Run npm test and npm run build and fix failures. Do not commit.
```

**Dev B: foundation UI**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. You are Dev B: edit only src/components, src/pages, src/App.jsx, src/index.css and src/dev. Do not edit src/game (you may import from it, read-only).

1. index.css: a space theme with CSS variables (--space: #050b1f, --panel: #0d1b3d, --mars: #e2693b, --text: #e8eefc, --ok: #4ade80, --warn: #facc15, --danger: #f87171). Monospace font for readouts, clean sans-serif for text, a subtle CSS-only star background, layout that works from 360px wide up. Visible focus rings.
2. App.jsx: keep the useReducer. Wrap the current page in Framer Motion AnimatePresence keyed by state.screen with a short fade/slide. Map screens to pages: start -> StartScreen; briefing, radiation, radiationOutcome, healthEvent -> RadiationMission; habitat -> MarsHabitat; report -> MissionReport. Unknown screen renders a friendly "Signal lost" panel with a Restart button that dispatches RESTART.
3. Header.jsx: MARSBOUND wordmark plus a 4-step progress indicator (Briefing, Radiation, Mars, Report) derived from state.screen.
4. StartScreen: heading "MARSBOUND: THE NEXT FRONTIER", text "Humanity's next home is waiting. Are you ready to reach it?", a primary Start mission button dispatching START_MISSION.
5. ResourcePanel (props: resources, show): labelled animated bars, colour turns warning below 30 and danger at 10 or less, text value visible (not colour only).
6. DecisionCard (props: id, title, description, onSelect, disabled): a real button, hover and focus states.
7. src/dev/mockStates.js: one valid sample state per screen so pages can be previewed before the logic is merged.

Run npm run build. Do not commit.
```

**Checkpoint:** the app runs, themes correctly, and both developers can work independently.

### Phase 2: Radiation mission (00:35 to 01:15)

**Goal:** the player can make a radiation choice and see a result.

**Dev A: radiation decision logic**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. You are Dev A: edit only src/game.

Implement the radiation mission exactly as in docs/choices.md:
- resolveRadiationChoice(state, choiceId): validate the id; apply the effects with applyChanges; set the flag (earlyWarning, reinforcedShield or crewExposed); store radiationChoice; set lastOutcome {title, message, changes}; append to log; set screen to radiationOutcome. An invalid id, a missing choice, or a second choice after the first returns the state unchanged and does not throw.
- gameReducer: CHOOSE_RADIATION calls it. CONTINUE on radiationOutcome calls getNextScreenAfterRadiation(state): healthEvent if radiationChoice is skipChecks, otherwise habitat.
- If any resource is at or below FAIL_AT after the choice, the next screen is still the next screen (failure is evaluated only at the end of the habitat rounds).

Vitest tests: exact resulting resources and flags for all three choices, invalid id, double choice, wrong screen, and the routing function for each choice.

Run npm test and npm run build. Do not commit.
```

**Dev B: cockpit, briefing, choice cards, outcome**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. You are Dev B: edit only src/components, src/pages, src/index.css, src/dev. Use src/dev/mockStates.js to preview until Dev A's logic is merged.

1. CockpitScene.jsx (prop stage: approach | crossing | safe | damaged): an SVG scene with a starfield, an Earth (blue circle with simple land shapes), three concentric radiation belt rings that slowly pulse, and a simple spacecraft that moves with Framer Motion. approach = ship far from Earth; crossing = ship inside the rings; safe = rings tinted green; damaged = rings tinted red with a short flicker. Respect prefers-reduced-motion.
2. MissionControl.jsx (props: message, resources): a "MISSION CONTROL" panel with the message, crew status, power level and a radiation monitor gauge (label it "simplified game value").
3. ChangeChips.jsx (prop changes): +/- pills per resource, green for positive and red for negative, with aria-labels.
4. RadiationMission.jsx: screen briefing -> MissionControl with the briefing text from src/game/missionData.js and a Begin crossing button dispatching BEGIN_CROSSING. Screen radiation -> CockpitScene stage approach, plus ResourcePanel (crewSafety, power) and three DecisionCards built from the radiation choices in missionData; on select dispatch { type: 'CHOOSE_RADIATION', choiceId } and disable all cards after one click. Screen radiationOutcome -> lastOutcome title and message, ChangeChips, CockpitScene stage safe or damaged (damaged when crewSafety dropped by 20 or more), and a Continue button dispatching CONTINUE. Handle missing lastOutcome gracefully (show a neutral message, never crash). Leave the healthEvent screen as a placeholder for now.

Do not edit src/game. Run npm run build. Do not commit.
```

**Checkpoint:** with both branches merged, the player can start, read the briefing, pick a choice, and see a result. Merge in Phase 3 before building more.

### Phase 3: First Git integration (01:15 to 01:25), both developers

**Goal:** both branches merged into `main` through pull requests, and the app runs after the merge.

**Each developer, in the terminal:**

```text
git add . && git commit -m "Add radiation mission logic"   # Dev A
git add . && git commit -m "Build cockpit dashboard"       # Dev B
git push -u origin <your-branch>
# open a pull request into main on GitHub
```

**Dev B (second to merge): integration prompt**

```text
We are integrating two branches. Run git fetch and show git status and git log --oneline --graph --all -20. Then merge origin/main into my current branch.

If there are conflicts: list each conflicted file, show both sides, and tell me whose folder it belongs to (Dev A owns src/game; Dev B owns src/components, src/pages, src/App.jsx, src/index.css, src/dev). Do NOT resolve any conflict by deleting the other developer's code. Propose a resolution for each conflict and wait for my approval before applying it.

After the merge: run npm install, npm test and npm run build. Then start npm run dev and give me the exact click path to verify: Start -> Begin crossing -> choose each of the three radiation cards (restart between them) -> outcome screen. Check the browser console for errors and report them. Do not commit.
```

**Checkpoint:** a full play of start, briefing, choice, outcome works on `main`. Both developers pull `main` into their branches before Phase 4.

### Phase 4: Mars habitat (01:25 to 02:05)

**Goal:** the player manages oxygen, water and power over three Sols and sees them change.

**First 10 minutes:** run the health event prompts from section 8.3 (Dev A logic, Dev B screen), because the `skipChecks` branch needs them before the habitat.

**Dev A: habitat logic**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. You are Dev A: edit only src/game.

Implement the Mars habitat as in docs/choices.md:
- missionData.habitatRounds: three rounds (Sol 1 Set up life support, Sol 2 Dust storm approaching, Sol 3 Water recycler fault), each with a situation text and three choices (id, title, description, effects, evaCrew true for deploySolarPanels, cleanPanelsEVA and repairRecycler).
- resolveHabitatChoice(state, choiceId): confirm the choice belongs to the current round (state.habitatRound); start from the choice effects; apply flag modifiers (earlyWarning makes runOnReserves cost -15 power instead of -25; reinforcedShield halves negative crewSafety changes on evaCrew choices, rounded toward zero; crewExposed makes rationWater cost -20 crewSafety); apply the choice with applyChanges; then apply UPKEEP; append to state.log; set lastOutcome with choiceChanges, upkeepChanges, a message, and a flagNote when a modifier applied.
- If any resource is at or below FAIL_AT, go straight to evaluateEnding and the report screen. Otherwise advance habitatRound; after round index 2, call evaluateEnding (stub that returns tier 'survived' for now) and go to report.
- gameReducer: CHOOSE_HABITAT and a CONTINUE from the habitat outcome. Invalid id, wrong round, wrong screen: return the state unchanged.

Vitest tests: every choice's resulting values, each flag modifier, upkeep, clamping, wrong round, early failure, advancing rounds.

Run npm test and npm run build. Do not commit.
```

**Dev B: habitat screen**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. You are Dev B: edit only src/components, src/pages, src/index.css, src/dev.

1. HabitatScene.jsx (prop resources): an SVG Mars surface with a red-orange horizon, a simple dome habitat, solar panels, and a small oxygen generator. Visual state: dome glow fades as power drops; panels dim below 30 power; an oxygen/water icon turns warning colour below 30. Subtle Framer Motion drift for dust particles; respect prefers-reduced-motion.
2. ResourcePanel: add a variant with cards for oxygen, water, power (and optionally crewSafety), big readout number, animated bar, and a +/- delta badge that appears for 2 seconds after a change (use the lastOutcome changes).
3. MarsHabitat.jsx: show the current round title and situation from missionData.habitatRounds[state.habitatRound], HabitatScene, ResourcePanel, and three DecisionCards; on select dispatch { type: 'CHOOSE_HABITAT', choiceId }. After a choice show the consequence message, choice changes and upkeep changes as separate ChangeChips, and a Continue button dispatching CONTINUE. If lastOutcome.flagNote exists, show it as a highlighted note. Guard against missing round data with a friendly fallback.
4. Update src/dev/mockStates.js with a habitat state per round and one with resources near failure.

Do not edit src/game. Run npm run build. Do not commit.
```

**Checkpoint:** the player can play all three Sols and watch oxygen, water and power change. Integrate again (commit and merge, about 10 minutes) before Phase 5.

### Phase 5: Mission completion (02:05 to 02:30)

**Goal:** success, partial and failure endings, a score, a debrief and a restart.

**Dev A: endings, score and debrief**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. You are Dev A: edit only src/game.

Replace the evaluateEnding stub:
- tier: 'failed' if any resource is at or below FAIL_AT (reason names the resource, e.g. "Oxygen ran out"); 'success' if oxygen, water and power are all at or above 30 and crewSafety is at or above 50; otherwise 'survived'.
- score 0..100 = round(crewSafety * 0.4 + oxygen * 0.2 + water * 0.2 + power * 0.2); if failed, score is capped at 25.
- rank: Mission Commander at 80 or more, Flight Lead 60 to 79, Junior Commander 1 to 59 (survived or success), Mission Lost when failed.
- lessons: an array of 3 to 4 short educational strings chosen from state.radiationChoice and the habitat choices actually made (see the lesson copy below). Always include the radiation lesson, the Mars resources lesson, and one lesson tied to the weakest final resource.
- result = { tier, score, rank, reason, lessons } stored in state.result, screen set to 'report'. evaluateEnding must be pure and never throw, even if log or choices are missing.

Lesson copy (keep wording simple; add the footnote that numbers are simplified game values):
- Radiation: Spacecraft leaving Earth pass through regions of trapped charged particles, and crews on a Mars trip need radiation monitoring, shielding and a plan for solar storms. In this game, checks cost power but protect the crew.
- Oxygen: Mars air is mostly carbon dioxide, which people cannot breathe. NASA's MOXIE experiment on the Perseverance rover showed that oxygen can be made from Martian carbon dioxide.
- Water: Using local resources, such as water ice below the Martian surface, is called in-situ resource utilization. Recycling matters too: the International Space Station recovers much of its water.
- Power: Mars dust storms can block sunlight and cut solar power; a global dust storm in 2018 ended the Opportunity rover mission.

Tests: every tier, score boundaries, rank boundaries, missing data, lesson selection per radiation choice. Run npm test and npm run build. Do not commit.
```

**Dev B: report screen, polish, restart**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. You are Dev B: edit only src/components, src/pages, src/index.css, src/dev.

1. MissionReport.jsx: read state.result and state.resources. Show a headline by tier (success: "Mission complete"; survived: "Mission complete, with damage"; failed: "Mission lost") with a tier colour, the rank, a big animated score count-up, final crew condition and remaining oxygen, water and power, the failure reason if any, a "What you learned" list of state.result.lessons, a short "Your decisions" list from state.log, a footnote "Values are simplified game values, not real astronaut measurements", and a Play again button dispatching RESTART. If state.result is null, show a neutral message and the Play again button instead of crashing.
2. Polish: consistent spacing, button hover and pressed states, a staggered entrance animation for cards, loading-free transitions, mobile layout check at 360px, readable colour contrast.
3. Add mock states for success, survived and failed to src/dev/mockStates.js and verify all three render.

Do not edit src/game. Run npm run build. Do not commit.
```

**Checkpoint:** the game can be completed from the start to a report, and Play again restarts cleanly.

### Phase 6: Integration and testing (02:30 to 02:45)

**Both developers:** merge remaining branches into `main` (commit message "Fix integration bugs" for fixes). Then run the full-game review and error-handling prompts from section 9 (9.1 integration check, 9.4 bug-fix, 9.6 fresh-clone test). Fix broken buttons, state bugs and layout problems; do not add features.

### Phase 7: Mock trial review (02:45 to 03:00)

One person plays all three radiation paths while the other observes and writes down bugs and confusing moments. Check the 10-item checklist and the teamwork questions in section 10. Use the balance prompt (9.5) only if endings feel unreachable.

## 8. After each choice: next phase and prompts

These prompts build what the player sees and what the game does after a specific choice. Run them during the phases shown. Each assumes `CLAUDE.md`, `docs/contract.md` and `docs/choices.md` exist.

| If the player chooses | Next screen | Prompts | Run during |
| --- | --- | --- | --- |
| `inspectMonitors` | Outcome (early warning), then habitat Sol 1 | 8.1 | Phase 2 end or Phase 4 |
| `checkShielding` | Outcome (hull reinforced), then habitat Sol 1 | 8.2 | Phase 2 end or Phase 4 |
| `skipChecks` | Outcome (exposure), then health event, then habitat Sol 1 | 8.3 | First 10 minutes of Phase 4 |
| Any habitat choice | Consequence, then next Sol (or report after Sol 3) | 8.4 | Phase 4 |
| Any value at or below 10 | Report immediately, mission lost | 8.5 | Phase 5 |

### 8.1 After `inspectMonitors` (early warning)

**Dev A**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev A, src/game only. Verify and complete the inspectMonitors branch: choosing it sets flags.earlyWarning, power -10, crewSafety -5, and the outcome message from docs/choices.md. Confirm routing goes outcome -> habitat (not healthEvent). Make sure the Sol 2 runOnReserves cost uses -15 power when earlyWarning is true and add flagNote text "Mission Control warned you in time" to lastOutcome in that case. Add or update tests for this exact path from START_MISSION to the Sol 2 result. Run npm test and npm run build. Do not commit.
```

**Dev B**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev B, UI folders only. When state.flags.earlyWarning is true: on the radiation outcome screen show an amber "Early warning" badge and a brief shelter animation on the spacecraft (stage safe); on the Sol 2 habitat screen show a calm banner "Mission Control warned you in time" above the choices. Everything must come from state.flags, no new state. Add a mock state in src/dev/mockStates.js to preview it. Run npm run build. Do not commit.
```

### 8.2 After `checkShielding` (hull reinforced)

**Dev A**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev A, src/game only. Verify the checkShielding branch: power -20, flags.reinforcedShield true, outcome message from docs/choices.md, routing outcome -> habitat. Confirm that reinforcedShield halves negative crewSafety on deploySolarPanels, cleanPanelsEVA and repairRecycler (round toward zero) and that the lastOutcome flagNote says "Reinforced shielding reduced the damage". Add tests for each of the three EVA choices with and without the flag. Run npm test and npm run build. Do not commit.
```

**Dev B**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev B, UI folders only. When state.flags.reinforcedShield is true: show a green "Shielded" badge on the radiation outcome screen and a small "Shielded: crew damage halved" tag on any DecisionCard whose choice has evaCrew true (read the evaCrew field from missionData). No new state. Add a mock state to preview. Run npm run build. Do not commit.
```

### 8.3 After `skipChecks` (exposure, then health event)

This branch adds one screen, `healthEvent`, between the radiation outcome and Sol 1.

**Dev A**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev A, src/game only.

1. missionData.healthEvent: a title ("Medical alert"), a situation text ("Several crew members report nausea and fatigue after the crossing.") and two choices from docs/choices.md: treatCrew (crewSafety +15, water -10, power -5) and restAndContinue (crewSafety -10).
2. resolveHealthChoice(state, choiceId): only valid when state.screen is healthEvent and radiationChoice is skipChecks; apply effects with applyChanges; store healthChoice; set lastOutcome with a message; append to log; set screen to habitat and habitatRound 0. Invalid id, wrong screen, or a second submission returns the state unchanged.
3. Reducer: CHOOSE_HEALTH calls it. CONTINUE on radiationOutcome routes to healthEvent only for skipChecks.
4. Tests: both health choices, routing for all three radiation choices (only skipChecks sees healthEvent), invalid id, double submit, and the full path START_MISSION -> skipChecks -> treatCrew -> habitat.

Run npm test and npm run build. Do not commit.
```

**Dev B**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev B, UI folders only. In RadiationMission.jsx handle state.screen === 'healthEvent': a "Medical alert" panel with the situation text from src/game/missionData.js, ResourcePanel (crewSafety, water, power), CockpitScene stage damaged, and two DecisionCards built from missionData.healthEvent. On select dispatch { type: 'CHOOSE_HEALTH', choiceId } and disable the cards after one click. After the dispatch the state moves to habitat, so no extra screen is needed. Add a mock state for it. Run npm run build. Do not commit.
```

### 8.4 After each habitat choice (next Sol)

**Dev B** (Dev A's logic is already in the Phase 4 prompt)

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev B, UI folders only. Make the habitat rounds feel different:
- Add a Sol progress indicator (Sol 1 of 3, Sol 2 of 3, Sol 3 of 3) driven by state.habitatRound.
- Sol 2 (dust storm): HabitatScene shows a drifting dust overlay and dimming sun; solar panels flicker.
- Sol 3 (water recycler fault): HabitatScene shows a small animated leak near the recycler.
- After each choice, the consequence panel shows: the message, the choice ChangeChips, the upkeep ChangeChips labelled "Daily upkeep", and a Continue button. After Sol 3 the Continue button is labelled "See mission report".
Only render from state; never compute resources in the UI. Run npm run build. Do not commit.
```

### 8.5 Failure branch: a value drops to the failure line

**Dev A**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev A, src/game only. In resolveHabitatChoice, after applying the choice and upkeep, if any resource is at or below FAIL_AT, call evaluateEnding immediately and set screen report even if rounds remain. Add result.endedOnRound (0, 1 or 2) and result.reason naming the resource and Sol (for example "Power ran out on Sol 2"). Add tests: an early failure on Sol 2 and Sol 3, and a path that survives to the end. Run npm test and npm run build. Do not commit.
```

**Dev B**

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Dev B, UI folders only. In MissionReport.jsx, when result.tier is failed, show "Mission ended on Sol N" using result.endedOnRound + 1, the failure reason in a prominent panel, and the same lessons list and Play again button. Add a mock state for an early failure. Run npm run build. Do not commit.
```

## 9. Review and error-handling prompts

Run these at the end of every phase (9.2 and 9.3), before every pull request, and during Phase 6. Reviews are read-only: tell Claude Code not to edit files, then fix findings in a separate prompt. That keeps the reviewer honest and keeps ownership clear.

### 9.1 Full-journey integration check (Phase 6)

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. Do not edit any files. Review the whole app on the current branch against the contract and the choice tables.

1. List every action the UI dispatches and confirm each is handled in gameReducer. List every state field the UI reads and confirm it exists in initialState.
2. Trace each full path from START_MISSION to the report: inspectMonitors, checkShielding, skipChecks with treatCrew, and skipChecks with restAndContinue, each with several Sol 1 to Sol 3 combinations. For each path write the expected resources after every step from docs/choices.md and compare with what the code produces.
3. Check the routing: only skipChecks reaches healthEvent; failure at or below FAIL_AT ends early; RESTART resets everything including flags, log and result.
4. Report findings as a table: severity (blocker, major, minor), file and line, what is wrong, suggested fix. Do not fix anything.
```

### 9.2 Logic review (Dev B reviews Dev A's pull request)

```text
Read CLAUDE.md and docs/contract.md. Do not edit files. Review the diff between main and feature/game-logic. Check: (a) the reducer and every resolve function are pure (no mutation of state, no randomness, no side effects); (b) every resource change goes through applyChanges and is clamped 0..100; (c) invalid input (unknown choice id, wrong screen, repeated action, missing lastOutcome or log) returns the state unchanged and never throws; (d) numbers match docs/choices.md exactly; (e) tests cover each branch and edge case and actually assert exact values; (f) nothing outside src/game was changed. List findings by severity with file and line. Do not fix anything.
```

### 9.3 UI review (Dev A reviews Dev B's pull request)

```text
Read CLAUDE.md and docs/contract.md. Do not edit files. Review the diff between main and feature/game-ui. Check: (a) no component changes game values or computes resources, everything renders from state and dispatches actions; (b) every page tolerates missing or null fields (lastOutcome, result, log, an unexpected screen) without crashing; (c) buttons are disabled after one click where a double submit would break the game; (d) accessibility: buttons are real buttons, visible focus, labels on icons and chips, status is not shown by colour alone, animations respect prefers-reduced-motion; (e) layout holds at 360px width; (f) nothing outside the UI folders was changed. List findings by severity with file and line. Do not fix anything.
```

### 9.4 Bug-fix prompt (use for any bug found)

```text
Read CLAUDE.md, docs/contract.md and docs/choices.md. I am Dev <A or B>, so I may edit only <my folders>.

Bug: <what I did, what I expected, what happened. Include the console error text and the screen name if any.>

First reproduce it: write the smallest steps or a failing test. Then find the root cause and explain it in two sentences before changing anything. If the root cause is in the other developer's folder, do not edit it: write a short message I can send them with the exact file, function and expected behaviour. Otherwise make the smallest fix, add a regression test (or a mock state if it is a UI bug), run npm test and npm run build, and tell me what changed. Do not refactor unrelated code. Do not commit.
```

### 9.5 Balance simulator (only if endings feel unreachable)

```text
Read CLAUDE.md and docs/choices.md. Dev A, src/game only. Write scripts/simulate.test.js (a Vitest test is fine) that plays every possible path through the game using the real reducer: 3 radiation choices x (2 health choices for skipChecks) x 3 x 3 x 3 habitat choices. For each path record the final tier and score. Print a summary: number of paths per tier, best score, worst score, and example paths for success, survived and failed. Success, survived and failed must each be reachable by at least one path, and no single choice may be best in every round. If a tier is unreachable or one choice dominates, propose small changes to the numbers in constants.js or missionData.js (not the logic), apply them, and rerun. Keep docs/choices.md in sync with any number you change and list the changes. Do not commit.
```

### 9.6 Fresh-clone reproducibility test

```text
Run this in a new empty folder, not in the working copy. Clone the repository: git clone <repo-url> fresh-check && cd fresh-check. Run npm install, npm test and npm run build, then npm run dev. Report any missing files, missing dependencies, undocumented steps or warnings. Then play three complete games using the click path for each radiation choice and report exactly where anything breaks. Check that README or CLAUDE.md tells a new developer how to run the game. Do not edit files; list what to fix.
```

### 9.7 Merge-conflict prompt

```text
I have merge conflicts. Run git status and list every conflicted file. For each file, show both versions of each conflict and explain what each side was trying to do. Tell me which developer owns the file (Dev A owns src/game; Dev B owns src/components, src/pages, src/App.jsx, src/index.css, src/dev). Do not edit any file yet. Propose a resolution that keeps both developers' intent, and wait for my approval before applying. After applying, run npm test and npm run build, and tell me the commands to finish the merge. Do not commit.
```

### Error-handling rules every prompt relies on

- The reducer never throws: unknown action, wrong screen, repeated click, invalid choice id all return the state unchanged.
- Pages never crash on missing data: they show a neutral fallback and a Restart button.
- Unknown `state.screen` shows the "Signal lost" panel with Restart.
- A React error boundary around the app shows "Mission Control lost signal" with a Restart button (add this in Phase 6 if time allows: Dev B).
- Every bug found becomes a test or a mock state, so it cannot return.

## 10. Definition of done and trial review

The prototype is done when all ten checks below pass on a fresh clone of `main`.

- [ ] The app starts without errors (`npm run dev`, `npm run build`, `npm test` all pass).
- [ ] The player can start a mission.
- [ ] Mission Control displays a briefing.
- [ ] The player can select a preparation choice.
- [ ] The choice changes game resources or crew safety.
- [ ] The game displays the outcome of the choice.
- [ ] The player can reach the Mars habitat (from all three radiation choices).
- [ ] Oxygen, water and power can change.
- [ ] The player can complete the game and see a mission report (success, survived and failed endings all reachable).
- [ ] Both developers merged their work into `main` through pull requests.

**Teamwork review (after 180 minutes)**

1. Did both developers have enough independent work?
2. Did you understand each other's component interfaces?
3. How much time did Git conflicts and integration take?
4. Which feature took longer than expected?
5. Could you reproduce the whole game from a fresh Git clone?

**Content note:** the educational lessons are written in simple, general terms. Before showing the game to others, check each lesson against nasa.gov, and keep the label that all numbers are simplified game values.
