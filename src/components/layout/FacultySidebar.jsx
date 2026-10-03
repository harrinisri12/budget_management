import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  User,
  LogOut,
  X,
  Building2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LegalModal } from '../common/LegalModal';

export const FacultySidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showLegalModal, setShowLegalModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/faculty/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/faculty/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'My Proposals',
      path: '/faculty/proposals',
      icon: FileSpreadsheet
    },
    {
      label: 'New Proposal',
      path: '/faculty/proposal/new',
      icon: PlusCircle
    },
    {
      label: 'Profile',
      path: '/faculty/profile',
      icon: User
    }
  ];

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
            padding: '16px 18px',
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
                Faculty Portal
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

        {/* User Card */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13
              }}
            >
              {user?.name ? user.name.charAt(0) : 'F'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Faculty Member'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.designation || 'CSE Department'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav
          className="cbm-sidebar-nav"
          style={{
            padding: '14px 10px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--gold-text)' : 'var(--text-body)',
                  backgroundColor: isActive ? 'var(--gold-subtle)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--slate-500)' }} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button & Policy */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setShowLegalModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11.5,
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
              padding: '8px 12px',
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
