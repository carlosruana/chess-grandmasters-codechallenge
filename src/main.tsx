import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { GrandmasterProvider } from './contexts/GrandmasterContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GrandmasterProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GrandmasterProvider>
  </StrictMode>
);
