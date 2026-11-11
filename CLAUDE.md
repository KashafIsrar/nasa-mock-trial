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
  game/           Developer A (Kashaf) only — logic, state, reducer, data, tests
  components/     Developer B only
  pages/          Developer B only
  index.css       Developer B (styling)
  App.jsx         SHARED — both developers, coordinate before editing
  main.jsx        SHARED — coordinate before editing
package.json      SHARED — coordinate before editing