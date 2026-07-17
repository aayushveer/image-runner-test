import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const clearLegacyServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
};

clearLegacyServiceWorker().catch(() => {
  // Cache cleanup is best-effort; the app should still render if it fails.
});

const rootEl = document.getElementById('root')!;

// Detect theme before mount to pass to ErrorBoundary
const detectTheme = (): 'dark' | 'light' => {
  try {
    const stored = localStorage.getItem('imgrunner-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary theme={detectTheme()}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

