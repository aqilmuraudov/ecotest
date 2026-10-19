import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App.tsx';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/space-grotesk';
import './index.css';
import { DataProvider } from './context/DataContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Honour prefers-reduced-motion: transforms are disabled, opacity still fades */}
    <MotionConfig reducedMotion="user">
      <DataProvider>
        <App />
      </DataProvider>
    </MotionConfig>
  </StrictMode>,
);
