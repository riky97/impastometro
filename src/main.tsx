import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { startPersistence } from './state/session';

// Offline use: the worker is built by vite.config.ts and only exists in a production build.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('./sw.js');
  });
}

startPersistence(); // restore the saved calculation before the first render

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
