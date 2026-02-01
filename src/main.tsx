import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 main.tsx loaded');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ Global error caught:', event.error);
  console.error('Error stack:', event.error?.stack);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise rejection:', event.reason);
  console.error('Promise:', event.promise);
});

const rootEl = document.getElementById('root');

if (!rootEl) {
  console.error('❌ Root element not found');
  throw new Error('Root element not found');
}

console.log('✅ Root element found, rendering App...');

try {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
  throw error;
}
