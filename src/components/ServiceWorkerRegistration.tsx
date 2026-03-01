'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[App] SW registered:', registration.scope);

            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated') {
                    console.log('[App] New SW activated, refreshing...');
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.log('[App] SW registration failed:', err);
          });

        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SYNC_COMPLETE') {
            console.log('[App] Background sync complete');
            window.dispatchEvent(new CustomEvent('sw-sync-complete'));
          }
        });
      });
    }
  }, []);

  return null;
}
