import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../common/Toast';

export const DashboardLayout = ({ children, pageTitle = 'Dashboard' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="cbm-admin-layout">
      {/* Subtle College Campus Watermark */}
      <div className="cbm-bg-canvas" aria-hidden="true">
        <div className="cbm-bg-image" />
        <div className="cbm-bg-overlay" />
      </div>

      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="cbm-main-area">
        <Header pageTitle={pageTitle} onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

        <main className="cbm-main-content">
          {children}
        </main>
      </div>

      {/* Global Toast */}
      <Toast />
    </div>
  );
};
