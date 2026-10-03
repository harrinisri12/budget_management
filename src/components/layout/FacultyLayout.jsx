import React, { useState } from 'react';
import { FacultySidebar } from './FacultySidebar';
import { Header } from './Header';
import { Toast } from '../common/Toast';

export const FacultyLayout = ({ children, pageTitle = 'Faculty Dashboard' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="cbm-admin-layout">
      {/* Subtle College Campus Watermark */}
      <div className="cbm-bg-canvas" aria-hidden="true">
        <div className="cbm-bg-image" />
        <div className="cbm-bg-overlay" />
      </div>

      {/* Faculty Sidebar */}
      <FacultySidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

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
