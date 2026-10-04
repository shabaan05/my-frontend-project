import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import Dashboard from './pages/Dashboard';

const container = document.getElementById('app');
if (!container) throw new Error('Root element #app not found');

createRoot(container).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
