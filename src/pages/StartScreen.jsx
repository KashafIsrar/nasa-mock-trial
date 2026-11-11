import { useState } from 'react';
import './startscreen.css';

/*
 * BACKGROUND ART
 * Drop your image in /public/assets/ and set the path below.
 * Leave it as null to show the built-in placeholder.
 * Recommended: draw at 480x270 (16:9), export PNG, it is scaled up crisply.
 */
const BACKGROUND_SRC = null; // e.g. '/assets/start-bg.png'

export default function StartScreen({ dispatch }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPlaceholder = !BACKGROUND_SRC || imgFailed;

  return (
    <main className="stage">
      {/* ---------- Layer 0: background art ---------- */}
      {showPlaceholder ? (
        <div className="stage__bg stage__placeholder" role="img" aria-label="Background art placeholder">
          <span className="stage__placeholder-tag">BACKGROUND ART HERE · 480×270 PNG</span>
        </div>
      ) : (
        <img
          className="stage__bg"
          src={BACKGROUND_SRC}
          alt=""
          onError={() => setImgFailed(true)}
        />
      )}

      {/* ---------- Layer 1: dark vignette so text stays readable ---------- */}
      <div className="stage__shade" aria-hidden="true" />

      {/* ---------- Layer 1.5: Mars (delete this line if your background art already has a planet) ---------- */}
      <div className="mars" aria-hidden="true" />

      {/* ---------- Layer 2: HUD ---------- */}
      <header className="hud-corner hud-corner--tl hud-panel">
        <span className="hud-tag">MARSBOUND</span>
        <span className="hud-readout">LEVEL 0 · LAUNCH BAY</span>
      </header>

      <aside className="hud-corner hud-corner--tr hud-panel" aria-label="Ship status">
        <div className="hud-readout">CREW 100 OK</div>
        <div className="hud-readout">POWER 100 OK</div>
      </aside>

      <section className="stage__center">
        <h1 className="stage__title">MARSBOUND</h1>
        <p className="stage__subtitle">THE NEXT FRONTIER</p>
      </section>

      <section className="hud-corner hud-corner--bl hud-panel hud-dialog" aria-label="Mission Control">
        <span className="hud-tag hud-tag--solid">MISSION CONTROL</span>
        <p>
          Humanity&apos;s next home is waiting. Are you ready to reach it?
          <span className="hud-cursor" aria-hidden="true" />
        </p>
      </section>

      <div className="hud-corner hud-corner--br">
        <button
          type="button"
          className="hud-btn"
          onClick={() => dispatch({ type: 'START_MISSION' })}
        >
          Start mission
        </button>
        <p className="hud-blink" aria-hidden="true">PRESS START</p>
      </div>
    </main>
  );
}