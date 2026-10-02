import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  UserPlus,
  ShieldCheck,
  CalendarRange,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [addMemberOpen, setAddMemberOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAddMemberPath = location.pathname.startsWith('/admin/add') || location.pathname.startsWith('/faculty/add');

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
          maxHeight: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 45,
          transition: 'transform 0.3s ease',
          flexShrink: 0,
          overflow: 'hidden',
          overscrollBehavior: 'contain'
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
            borderBottom: '1px solid var(--border)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: 22,
                boxShadow: '0 4px 12px rgba(68, 60, 222, 0.25)',
                letterSpacing: '-0.02em'
              }}
            >
              K
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--dark)', lineHeight: 1.2 }}>
                CSE Budget Mgmt
              </h2>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', letterSpacing: '0.04em' }}>
                KONGU CSE DEPT
              </p>
            </div>
          </div>
          {setIsMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', padding: 4 }}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div
          className="cbm-sidebar-nav"
          style={{
            padding: '16px 14px',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* 1. Dashboard */}
            <NavLink
              to="/dashboard"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? '#FFFFFF' : 'var(--dark-muted)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <LayoutDashboard size={19} />
              <span>Dashboard</span>
            </NavLink>

            {/* 2. Proposals */}
            <NavLink
              to="/proposals"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? '#FFFFFF' : 'var(--dark-muted)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <FileSpreadsheet size={19} />
              <span>Proposals</span>
            </NavLink>

            {/* 3. Add Member (Expandable/Collapsible Menu) */}
            <div>
              <button
                type="button"
                onClick={() => setAddMemberOpen(!addMemberOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  background: isAddMemberPath ? 'var(--primary-light)' : 'transparent',
                  color: isAddMemberPath ? 'var(--primary)' : 'var(--dark-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <UserPlus size={19} />
                  <span>Add Member</span>
                </div>
                {addMemberOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {addMemberOpen && (
                <div style={{ paddingLeft: 34, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Add Member > Add Admin */}
                  <NavLink
                    to="/admin/add"
                    onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 500,
                      textDecoration: 'none',
                      color: isActive ? 'var(--primary)' : 'var(--dark-muted)',
                      backgroundColor: isActive ? '#F1EFFD' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    })}
                  >
                    <ShieldCheck size={15} />
                    <span>Add Admin</span>
                  </NavLink>

                  {/* Add Member > Add Faculty */}
                  <NavLink
                    to="/faculty/add"
                    onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 500,
                      textDecoration: 'none',
                      color: isActive ? 'var(--primary)' : 'var(--dark-muted)',
                      backgroundColor: isActive ? '#F1EFFD' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    })}
                  >
                    <UserPlus size={15} />
                    <span>Add Faculty</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 4. Academic Year */}
            <NavLink
              to="/academic-years"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? '#FFFFFF' : 'var(--dark-muted)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <CalendarRange size={19} />
              <span>Academic Year</span>
            </NavLink>

            {/* 5. Settings */}
            <NavLink
              to="/settings"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? '#FFFFFF' : 'var(--dark-muted)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <Settings size={19} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>

        {/* 6. Logout / Sidebar Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--danger-text)',
              backgroundColor: 'var(--danger-bg)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
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
