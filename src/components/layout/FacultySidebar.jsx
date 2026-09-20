import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FilePlus,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FacultySidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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
      icon: FilePlus
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
            backgroundColor: 'rgba(19, 20, 29, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}

      <aside
        style={{
          width: 280,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 45,
          transition: 'transform 0.3s ease',
          flexShrink: 0
        }}
        className={`cbm-sidebar ${isMobileOpen ? 'mobile-show' : ''}`}
      >
        {/* Sidebar Brand Header */}
        <div
          style={{
            padding: '24px 24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                padding: 4
              }}
            >
              <img src="/favicon.svg" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--dark)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                CSE Budget
              </h1>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', letterSpacing: '0.04em' }}>
                FACULTY PORTAL
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: '#FAF9FE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(68, 60, 222, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14
              }}
            >
              {user?.name ? user.name.charAt(0) : 'F'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Faculty Member'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.designation || 'CSE Department'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ padding: '0 12px 8px', fontSize: 11, fontWeight: 700, color: '#A09CB8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Faculty Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => `cbm-nav-item ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? 'var(--primary)' : 'var(--dark-muted)',
                  backgroundColor: isActive ? 'rgba(68, 60, 222, 0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                })}
              >
                <Icon size={20} style={{ opacity: 0.9 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '16px 20px 24px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              color: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
