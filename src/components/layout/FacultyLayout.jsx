import React, { useState } from 'react';
import { FacultySidebar } from './FacultySidebar';
import { Header } from './Header';
import { Toast } from '../common/Toast';

export const FacultyLayout = ({ children, pageTitle = 'Faculty Dashboard' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Faculty Sidebar */}
      <FacultySidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header pageTitle={pageTitle} onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

        <main style={{ flex: 1, padding: '28px 32px' }} className="cbm-main-content">
          {children}
        </main>
      </div>

      {/* Global Toast */}
      <Toast />
    </div>
  );
};
