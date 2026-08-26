import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useApp } from '../context/AppContext';

/**
 * AppLayout wraps every authenticated page with:
 *  - Fixed left Sidebar (240px collapsible)
 *  - Fixed top Navbar
 *  - Scrollable main content area via <Outlet />
 */
export default function AppLayout() {
  const { user, onLogout, websocketConnected } = useApp();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Right column: Navbar + page content */}
      <div style={{
        marginLeft: '240px',    /* matches sidebar width */
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)'
      }}>
        {/* Top Navbar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '12px 20px 0 20px' }}>
          <Navbar
            user={user}
            onOpenAuth={() => {}}
            onLogout={onLogout}
            websocketConnected={websocketConnected}
          />
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: '20px 24px 32px 24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
