import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, ChevronDown, LogOut, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LegalModal } from '../common/LegalModal';

export const Header = ({ pageTitle = 'Dashboard', onMenuToggle }) => {
  const { user, logout, isFaculty } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate(isFaculty ? '/faculty/login' : '/login');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const notifications = [
    { id: 1, title: 'CSEA Budget Approved', time: '10m ago', text: '₹45,000 allocated for National Technical Symposium 2026.' },
    { id: 2, title: 'CCC Coding Contest Proposal', time: '1h ago', text: 'Proposal of ₹12,500 submitted for algorithmic coding competition.' },
    { id: 3, title: 'CSE Lab Equipment Audit', time: '1d ago', text: 'Annual academic hardware maintenance audit due on Sep 30.' }
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (isFaculty ? 'F' : 'A');
  const userName = user?.name || (isFaculty ? 'Faculty Member' : 'Admin User');
  const userEmail = user?.email || (isFaculty ? 'faculty@kongu.edu' : 'admin@kongu.edu');
  const userDesignation = isFaculty ? (user?.designation || 'Faculty Member') : 'CSE Budget Officer';

  return (
    <>
      <header className="cbm-header">
        {/* Left side: Hamburger & Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button
            onClick={onMenuToggle}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-heading)',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
            className="lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>

          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pageTitle}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span>{userName}</span> • <span style={{ color: 'var(--text-subtle)' }}>{userDesignation}</span>
            </p>
          </div>
        </div>

        {/* Right side: Search, Notifications & Profile dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Quick Search */}
          <div style={{ position: 'relative', width: 200 }} className="hidden sm:block">
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search budgets..."
              style={{
                width: '100%',
                height: 34,
                paddingLeft: 30,
                paddingRight: 10,
                fontSize: 12.5,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-page)',
                outline: 'none',
                color: 'var(--text-heading)'
              }}
            />
          </div>

          {/* Notification Bell Icon */}
          <div style={{ position: 'relative' }} ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserDropdown(false);
              }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-heading)',
                position: 'relative',
                transition: 'background-color 0.15s ease'
              }}
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  border: '1px solid var(--bg-surface)'
                }}
              />
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 40,
                  width: 'min(320px, calc(100vw - 32px))',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-dropdown)',
                  padding: 14,
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>Department Notifications</h4>
                  <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, backgroundColor: 'var(--primary-subtle)', padding: '2px 6px', borderRadius: 4 }}>3 Updates</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-heading)' }}>{n.title}</span>
                        <span style={{ color: 'var(--text-subtle)', fontSize: 11 }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifications(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                padding: '3px 8px 3px 3px',
                borderRadius: 'var(--radius-md)',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12.5
                }}
              >
                {userInitial}
              </div>
              <div style={{ textAlign: 'left' }} className="hidden sm:block">
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>{userName}</div>
              </div>
              <ChevronDown size={13} style={{ color: 'var(--slate-400)' }} />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 40,
                  width: 'min(230px, calc(100vw - 32px))',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-dropdown)',
                  padding: '4px 0',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)' }}>{userName}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{userEmail}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (isFaculty || user?.role === 'faculty') {
                      navigate('/faculty/profile');
                    } else {
                      navigate('/settings');
                    }
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: 'var(--text-body)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-page)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <SettingsIcon size={14} style={{ color: 'var(--slate-400)' }} />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setShowLegalModal(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: 'var(--text-body)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-page)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <ShieldCheck size={14} style={{ color: 'var(--slate-400)' }} />
                  <span>Institutional Policies</span>
                </button>

                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--danger)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger-bg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Institutional Legal & Policy Modal */}
      {showLegalModal && (
        <LegalModal
          isOpen={showLegalModal}
          onClose={() => setShowLegalModal(false)}
        />
      )}
    </>
  );
};
