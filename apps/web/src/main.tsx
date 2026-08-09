import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import AppRouter from './app/router';
import { AdminAuthProvider } from './features/admin/context/AdminAuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminAuthProvider>
      <AppRouter />
    </AdminAuthProvider>
  </React.StrictMode>
);
