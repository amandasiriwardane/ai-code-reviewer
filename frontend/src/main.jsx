import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // This line is crucial!
import App from './App.jsx';
import "./styles/global.css";
import { AuthProvider } from './context/AuthProvider.jsx';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);