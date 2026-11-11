import { useState } from 'react';
import Header from '../components/Header.jsx';
import { getPageForScreen, SignalLost } from '../App.jsx';
import { mockStates } from './mockStates.js';

// Dev-only screen switcher: click through every mock state without the real reducer.
// Not imported by App.jsx / main.jsx — open it manually during development.
export default function Preview() {
  const [key, setKey] = useState('start');
  const state = mockStates[key];
  const Page = getPageForScreen(state.screen);
  const noopDispatch = (action) => console.log('[Preview] dispatch', action);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <div className="pixel-stars" aria-hidden="true" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 12, justifyContent: 'center' }}>
        {Object.keys(mockStates).map((name) => (
          <button
            key={name}
            type="button"
            className="pixel-btn pixel-btn--secondary"
            style={{ padding: '6px 10px', fontSize: 9 }}
            onClick={() => setKey(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <Header screen={state.screen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {Page ? <Page state={state} dispatch={noopDispatch} /> : <SignalLost dispatch={noopDispatch} />}
      </div>
    </div>
  );
}
