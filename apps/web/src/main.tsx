import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import AppRouter from './app/router';
import { AdminAuthProvider } from './features/admin/context/AdminAuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SiteSettingsProvider>
      <AdminAuthProvider>
        <AppRouter />
      </AdminAuthProvider>
    </SiteSettingsProvider>
  </React.StrictMode>
);
