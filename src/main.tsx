import { createRoot } from 'react-dom/client'

console.log('[main.tsx] Application starting...');

// Global error/Promise rejection logging to surface issues after refresh
window.addEventListener('error', (event) => {
  // eslint-disable-next-line no-console
  console.error('[window.error]', event.message, event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  // eslint-disable-next-line no-console
  console.error('[window.unhandledrejection]', event.reason);
});
import App from './App.tsx'
import './index.css'

console.log('[main.tsx] About to render App component');
createRoot(document.getElementById("root")!).render(<App />);
console.log('[main.tsx] App component rendered');
