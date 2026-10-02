import React, { useState } from 'react';
import { FacultySidebar } from './FacultySidebar';
import { Header } from './Header';
import { Toast } from '../common/Toast';

export const FacultyLayout = ({ children, pageTitle = 'Faculty Dashboard' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div
      className="cbm-admin-layout"
      style={{
        display: 'flex',
        height: '100vh',
        height: '100dvh',
        maxHeight: '100vh',
        maxHeight: '100dvh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--background)'
      }}
    >
      {/* Faculty Sidebar - Independent Left Scroll Area */}
      <FacultySidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Area - Independent Right Scroll Area */}
      <div
        className="cbm-main-area"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: '100vh',
          height: '100dvh',
          maxHeight: '100vh',
          maxHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Header pageTitle={pageTitle} onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

        <main
          className="cbm-main-content"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            padding: '28px 32px'
          }}
        >
          {children}
        </main>
      </div>

      {/* Global Toast */}
      <Toast />
    </div>
  );
};
