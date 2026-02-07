import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 [main.tsx] Starting app initialization...');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ [Global] Error caught:', event.error);
  console.error('[Global] Error stack:', event.error?.stack);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [Global] Unhandled Promise rejection:', event.reason);
  console.error('[Global] Promise:', event.promise);
});

console.log('✓ [main.tsx] Global handlers registered');

const rootEl = document.getElementById('root');

if (!rootEl) {
  console.error('❌ [main.tsx] Root element NOT found in DOM!');
  console.error('[main.tsx] Document.body:', document.body);
  console.error('[main.tsx] Document.html:', document.documentElement);
  throw new Error('Root element not found - cannot mount React app');
}

console.log('✓ [main.tsx] Root element found:', rootEl);

try {
  console.log('🎯 [main.tsx] Creating React root...');
  const root = ReactDOM.createRoot(rootEl);
  console.log('✓ [main.tsx] React root created successfully');
  
  console.log('🎯 [main.tsx] Rendering App component...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✓ [main.tsx] App rendered successfully!');
} catch (error) {
  console.error('❌ [main.tsx] Error rendering app:', error);
  if (error instanceof Error) {
    console.error('[main.tsx] Error message:', error.message);
    console.error('[main.tsx] Error stack:', error.stack);
  }
  throw error;
}

console.log('✓ [main.tsx] App initialization complete!');
