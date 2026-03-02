import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Error handler for debugging
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
