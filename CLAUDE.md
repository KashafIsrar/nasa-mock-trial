# MARSBOUND — Project Context for Claude Code

## Project overview

MARSBOUND is a short (5–8 minute) browser game built for a NASA hackathon mock trial. The player is a Junior Astronaut Commander guiding a crew from Earth orbit to a working habitat on Mars:

Start → Mission Control briefing → radiation decision → outcome → (health event, only after `skipChecks`) → Mars habitat Sol 1–3 → mission report → Play again.

Every choice changes four simplified game values (0–100): `crewSafety`, `power`, `oxygen`, `water`. Flags set by the radiation choice (`earlyWarning`, `reinforcedShield`, `crewExposed`) modify later habitat choices. The game ends in success, survived-with-damage or failure, with a score, a rank and an educational debrief.

**Primary specification:** [docs/MARSBOUND — Development Plan for Claude Code.md](docs/MARSBOUND%20—%20Development%20Plan%20for%20Claude%20Code.md). Follow its game mechanics, resource rules, flags, choices, upkeep, endings, scoring and lessons. Where this file and the plan disagree, **this file wins** (see "Finalized decisions" and "Deviations from the plan" below).

The plan's prompts refer to `docs/contract.md` and `docs/choices.md`. These do not exist yet; until they do, use plan sections 4 (contract) and 5 (choice tables) together with the finalized decisions in this file.

## Technology stack

- React 19 + Vite, JavaScript only (no TypeScript). **Keep React 19 — never downgrade.**
- Plain CSS (no Tailwind, no CSS frameworks).
- Framer Motion — UI animations and screen transitions (installed).
- Vitest — unit tests for game logic and the reducer (installed).
- oxlint — linting (`npm run lint`).
- State and navigation: a single `useReducer`; `state.screen` decides which page is shown. **No React Router.** No Redux, Zustand, Phaser or other state/game libraries.
- No backend, no database. Do not add other libraries without asking first.

> Note: `react-router-dom` is still installed and used in the initial scaffold (`src/main.jsx`, `src/App.jsx`, `src/pages/Home.jsx`, `src/pages/Game.jsx`). It is to be removed when `App.jsx` is switched to `useReducer` — a shared change both developers coordinate. Do not build new code on React Router.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint with oxlint |
| `npm test` | Run Vitest once (`vitest run --passWithNoTests`) |

Run `npm run lint`, `npm run build` and `npm test` before saying a task is done.

## Team responsibilities and branches

| Developer | Role | Branch | Owns |
| --- | --- | --- | --- |
| **Developer A — Kashaf** | Game logic | `feature/ui` | `src/game/` |
| **Developer B — teammate** | Frontend / UI | their own branch | `src/components/`, `src/pages/`, styling (`src/index.css` and other CSS) |

- **Never infer responsibilities from branch names.** Kashaf's branch is named `feature/ui` on purpose but contains GAME LOGIC work. Do not rename it.
- Developer A (Kashaf) works on: the reducer, game state, game mechanics, resource calculations, flag modifiers, scripted mission events, mission outcomes, branching, ending evaluation and unit tests.
- Developer B works on: pages, components, SVG/CSS visuals, Framer Motion animations, responsive styling and accessibility.
- In the development plan, "Dev A" = logic and "Dev B" = UI, which matches this team. But the plan's branch names (`feature/game-logic`, `feature/game-ui`) are NOT ours — substitute the real branches when using its prompts.

## Folder ownership

```text
src/
  game/          Developer A (Kashaf) only — logic, state, reducer, data, tests
  components/    Developer B only
  pages/         Developer B only
  index.css      Developer B (styling)
  App.jsx        SHARED — both developers, coordinate before editing
  main.jsx       SHARED — coordinate before editing
package.json     SHARED — coordinate before editing
```

- When working for Kashaf, edit only `src/game/` unless explicitly given permission. UI files may be read and imported, never edited.
- If a change is needed in the other developer's folder, do not make it: write a short message the user can send them (file, function, expected behaviour).

## Shared-file coordination rules

- `App.jsx`, `main.jsx`, `package.json` and the state/action contract (plan section 4 + finalized decisions below) are shared.
- Both developers own `App.jsx` and **coordinate before changing it**. Before editing any shared file, stop, tell the user it needs coordination and describe the intended change.
- A contract change (state shape, action types, function signatures, component props) needs agreement from both developers before anyone codes against it.
- If a real contradiction or missing specification remains, explain it and ask before guessing. Do not reopen the finalized decisions below.

## Finalized decisions (agreed by both developers — do not reopen)

1. **Navigation:** `useReducer` + `state.screen`. No React Router.
2. **Shield rounding:** for choices with `evaCrew === true`, when `flags.reinforcedShield === true` and the `crewSafety` change is negative, apply `-Math.floor(Math.abs(change) / 2)`. Positive changes are never halved. (Example: −5 → −2, −15 → −7.)
3. **Contract additions** (on top of plan section 4):
   - `lastOutcome = { title, message, changes, choiceChanges, upkeepChanges, flagNote }`
   - `habitatPhase = 'choose' | 'outcome'`, default `'choose'`
   - `result = { tier, score, rank, reason, lessons, endedOnRound }`
4. **Sol progression:**
   - `resolveHabitatChoice` applies the choice effects (with flag modifiers), applies `UPKEEP`, logs the changes, sets `lastOutcome`, and sets `habitatPhase` to `'outcome'`. It does **not** increment `habitatRound`.
   - `CONTINUE` on the habitat screen with `habitatPhase === 'outcome'`: if any resource is at or below `FAIL_AT`, or `habitatRound === 2`, call `evaluateEnding` and set `screen` to `'report'`. Otherwise increment `habitatRound` by 1 and reset `habitatPhase` to `'choose'`.
5. **No random events.** Gameplay is fully deterministic. The Sol 2 dust storm and Sol 3 water recycler fault are scripted events as in the plan.
6. Everything else (choices, effects, flags, upkeep, endings, scoring, ranks, lessons) follows the development plan.

## Working style

Kashaf is learning JavaScript, React, reducers and Git, and wants to understand every change.

- Work in **small, incremental tasks — one clearly defined task at a time**. Never implement multiple plan phases in one prompt, and do not continue to the next task automatically.
- Before editing, briefly explain the intended change. Make the smallest necessary change.
- After editing, list the changed files and explain important functions and concepts in beginner-friendly language.
- Run the relevant tests after each meaningful implementation. If a test fails, explain the cause before fixing it.
- Never silently change agreed mechanics or the contract. If something needs Developer B's agreement, stop and say so.
- If something is unclear, ask instead of guessing. Wait for review before moving on.

## Git safety rules

- The user handles ALL Git operations. **Never commit, push, merge or switch branches without explicit permission.** Also do not run `git checkout`, `git switch`, `git branch` (create/rename/delete), `git pull`, `git rebase`, `git reset`, `git stash` or anything that changes history or branches.
- Read-only Git commands (`git status`, `git diff`, `git log`, `git branch --show-current`) are fine unless the user says otherwise.
- Never resolve a merge conflict by deleting the other developer's code; propose a resolution and wait for approval.

## Implementation constraints

- **UI renders only from state** and changes state **only by dispatching actions**. Components never compute or change resources.
- **The reducer never throws.** Unknown actions, actions from the wrong screen, repeated clicks and invalid choice ids return the state unchanged.
- Reducer and `resolve*` functions are pure: no mutation, no randomness, no side effects. Every resource change goes through `applyChanges` (clamps 0–100).
- Shared names and numbers (screens, choice ids, thresholds, upkeep) live in `src/game/constants.js`; import them instead of retyping strings or numbers.
- Pages never crash on missing data (`lastOutcome`, `result`, `log`, unknown screen): show a neutral fallback with a Restart button.
- All numbers are **simplified game values**, not real astronaut or radiation measurements — label them as such in the UI.
- Educational debrief text should be checked against nasa.gov before showing the game to others.
- Out of scope: 3D movement, multiplayer, NASA API integration, physics simulation, login, multiple levels, realistic radiation dose calculations, random events, Phaser, backend, database.
- Keep code beginner-friendly: small files, plain functions, no unnecessary abstractions.

## Deviations from the plan (team decisions, these override the plan)

- React 19 (plan says 18).
- Plain CSS only (plan allows Tailwind).
- Project name/folder is `nasa-mock-trial` (plan says `marsbound`).
- Branches: Kashaf = `feature/ui` (logic). Developer B uses their own branch.
- `App.jsx` is owned by both developers and edited only after coordination.
- Contract additions, shield rounding and Sol progression as listed in "Finalized decisions".
