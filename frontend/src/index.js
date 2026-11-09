import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import SharePage from './components/SharePage';
import reportWebVitals from './reportWebVitals';

// Routing minimal sans lib : on lit le pathname pour détecter /share/:fileId
const path = window.location.pathname;
const shareMatch = path.match(/^\/share\/([^/]+)$/);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {shareMatch ? <SharePage fileId={shareMatch[1]} /> : <App />}
  </React.StrictMode>
);

reportWebVitals();
