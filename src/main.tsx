import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Intercept and swallow benign ResizeObserver warning events
if (typeof window !== 'undefined') {
  const resizeObserverErrors = [
    'ResizeObserver loop completed with undelivered notifications',
    'ResizeObserver loop limit exceeded'
  ];

  window.addEventListener('error', (e) => {
    if (e.message && resizeObserverErrors.some(msg => e.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && e.reason.message && resizeObserverErrors.some(msg => e.reason.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

