import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

// Client ID de Google
// Obtener desde variable de entorno o usar placeholder
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '736289459205-5q5j5j5j5j5j5j5j5j5j5j5j5j5j5j5.apps.googleusercontent.com';

if (GOOGLE_CLIENT_ID.includes('placeholder')) {
  console.warn('Google Client ID no configurado. El inicio de sesión con Google no funcionará.');
}

import { ThemeProvider } from './components/theme-provider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
