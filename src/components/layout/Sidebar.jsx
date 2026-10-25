import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  CalendarRange,
  FileText,
  Settings,
  LogOut,
  X,
  Building2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LegalModal } from '../common/LegalModal';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLegalModal, setShowLegalModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 40
          }}
        />
      )}

      <aside className={`cbm-sidebar ${isMobileOpen ? 'mobile-show' : ''}`}>
        {/* Sidebar Brand Header */}
        <div
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0
              }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.2 }}>
                Budget Management
              </h2>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
                KEC CSE DEPARTMENT
              </p>
            </div>
          </div>
          {setIsMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', padding: 4 }}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="cbm-sidebar-nav" style={{ padding: '16px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* 1. Dashboard */}
            <NavLink
              to="/dashboard"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--gold-text)' : 'var(--text-body)',
                backgroundColor: isActive ? 'var(--gold-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--slate-500)' }} />
                  <span>Dashboard</span>
                </>
              )}
            </NavLink>

            {/* 2. Proposals */}
            <NavLink
              to="/proposals"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--gold-text)' : 'var(--text-body)',
                backgroundColor: isActive ? 'var(--gold-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <FileSpreadsheet size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--slate-500)' }} />
                  <span>Proposals</span>
                </>
              )}
            </NavLink>

            {/* 3. Faculty Directory */}
            <NavLink
              to="/faculty"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--gold-text)' : 'var(--text-body)',
                backgroundColor: isActive ? 'var(--gold-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <Users size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--slate-500)' }} />
                  <span>Faculty Directory</span>
                </>
              )}
            </NavLink>

            {/* 4. Academic Year */}
            <NavLink
              to="/academic-years"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--gold-text)' : 'var(--text-body)',
                backgroundColor: isActive ? 'var(--gold-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <CalendarRange size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--slate-500)' }} />
                  <span>Academic Year</span>
                </>
              )}
            </NavLink>

            {/* 5. Reports */}
            <NavLink
              to="/reports"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--gold-text)' : 'var(--text-body)',
                backgroundColor: isActive ? 'var(--gold-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <FileText size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--slate-500)' }} />
                  <span>Reports</span>
                </>
              )}
            </NavLink>

            {/* 6. Settings */}
            <NavLink
              to="/settings"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--gold-text)' : 'var(--text-body)',
                backgroundColor: isActive ? 'var(--gold-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <Settings size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--slate-500)' }} />
                  <span>Settings</span>
                </>
              )}
            </NavLink>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => setShowLegalModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Lock size={12} />
            <span>Privacy Policy & Terms</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--danger)',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Institutional Legal Modal */}
      {showLegalModal && (
        <LegalModal
          isOpen={showLegalModal}
          onClose={() => setShowLegalModal(false)}
        />
      )}
    </>
  );
};
