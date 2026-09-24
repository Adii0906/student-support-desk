import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ServerStatusProvider } from './lib/server';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ServerStatusProvider>
        <App />
      </ServerStatusProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
