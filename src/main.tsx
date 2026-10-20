import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App.tsx';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/space-grotesk';
import './index.css';
import { DataProvider } from './context/DataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { reloadOnce } from './utils/lazyRetry';

// Vite fires this when a preloaded chunk of an older build is gone: load the new build instead of a blank page
window.addEventListener('vite:preloadError', (e) => { e.preventDefault(); reloadOnce(); });
// A page restored from the browser's back/forward cache can carry an outdated bundle: refresh it
window.addEventListener('pageshow', (e) => { if ((e as PageTransitionEvent).persisted) window.location.reload(); });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Honour prefers-reduced-motion: transforms are disabled, opacity still fades */}
    <MotionConfig reducedMotion="user">
      <ErrorBoundary fullScreen>
        <DataProvider>
          <App />
        </DataProvider>
      </ErrorBoundary>
    </MotionConfig>
  </StrictMode>,
);
