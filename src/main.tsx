import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign platform WebSocket closure errors when HMR is disabled in container iframe
if (typeof window !== 'undefined') {
  const isWs = (str: any) =>
    typeof str === 'string' && (str.includes('WebSocket') || str.includes('websocket'));

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const msg = event?.reason?.message || String(event?.reason || '');
      if (isWs(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'error',
    (event) => {
      const msg = event?.message || String(event?.error?.message || '');
      if (isWs(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
