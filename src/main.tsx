import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for Progressive Web App (PWA) offline support and installability
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Auto-update or notify user
    },
    onOfflineReady() {
      // Offline cache primed
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
