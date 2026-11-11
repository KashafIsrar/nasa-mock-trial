# MARSBOUND — Visual Design Spec

## Theme

Retro pixel-art space adventure, in the spirit of Codedex (playful 8-bit game UI, chunky bordered panels, XP-bar style progress). Do not copy any Codedex assets, logos or text — build original pixel art.

## Fonts

Install via npm, no CDN.

- `@fontsource/press-start-2p` — headings, labels and buttons. Never below 10px. Keep this text short.
- `@fontsource/vt323` — body text and readouts. At least 20px.

## Colours (CSS variables)

```css
:root {
  --bg: #0b0b2b;
  --bg-2: #15104a;
  --panel: #1d1660;
  --panel-2: #2a2090;
  --line: #f4f1ff;
  --text: #f4f1ff;
  --muted: #a9a3d9;
  --yellow: #ffd23f;
  --mars: #ff7a3d;
  --cyan: #4de1ff;
  --green: #5dff8a;
  --pink: #ff5fa2;
  --danger: #ff4d6d;
  --shadow: #000;
}
```

## Shapes

- No rounded corners. No blur.
- Every panel and button has a 4px solid border and a hard offset shadow: `box-shadow: 4px 4px 0 var(--shadow);`
- The pixel-corner trick via `clip-path` or stacked `box-shadow`s is allowed for notched/stepped edges.
- `image-rendering: pixelated` on any raster image.
- Any SVG art is built from rects on a pixel grid and uses `shape-rendering="crispEdges"`.

## Buttons

- Primary: yellow fill, dark text, 4px border, hard offset shadow.
- Hover: lifts 2px (`transform: translate(-2px, -2px)`, shadow grows to match).
- Active/pressed: presses down — `transform: translate(4px, 4px)`, shadow removed.
- Focus-visible: 3px cyan outline with offset (`outline: 3px solid var(--cyan); outline-offset: 2px;`).
- Disabled: muted fill, no shadow, no hover/active transforms.

## Panels

- Dialog-box style, like an RPG text box, with a title tab sitting on the top border.
- Mission Control messages render inside a dialog box with a blinking block cursor at the end of the text.

## Progress bars

- Segmented into 10 blocks (not a smooth fill) — each block is either filled or empty.
- Colour: green by default, yellow below 30, red at 10 or less.
- Always show the numeric value and the label alongside the bar — status is never conveyed by colour alone.
- Header progress uses XP-style steps with pixel star icons.

## Background

- CSS-only pixel star field: box-shadow dots in two layers, with a slow, stepped twinkle (not a smooth fade).
- Dark gradient rendered in flat bands, no smooth gradients.

## Motion

- Stepped, 8-bit feel throughout.
- CSS transitions use `steps()` easing.
- Framer Motion uses a stepped easing function, e.g. `ease: t => Math.floor(t * 6) / 6`.
- Screen changes use a quick pixel wipe or a 4-step fade.
- Everything is disabled or reduced to a minimal cut under `prefers-reduced-motion`.

## Spacing

- 8px grid.
- Layout works from 360px wide up.
- Text stays readable on mobile.

## Tone of copy

Short, game-like microcopy (e.g. "PRESS START", "LEVEL 1: RADIATION BELTS", "MISSION CONTROL") — but keep all text required by the game contract.

## Accessibility

- Body text contrast at least 4.5:1.
- Real `<button>` elements, never divs styled as buttons.
- Visible focus state on every interactive element (see Buttons above).
- Icons have text labels (visible or `aria-label`).
- Status is never conveyed by colour alone — always pair colour with text/number/label.
