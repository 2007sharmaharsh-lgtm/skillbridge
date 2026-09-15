import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BackgroundEffects from './BackgroundEffects';

export default function DashboardLayout() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--bg-cosmos)' }}>
      <BackgroundEffects />
      <Navbar />
      <div className="layout-container">
        <Sidebar />
        <main className="main-content">
          <div className="page-body">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
