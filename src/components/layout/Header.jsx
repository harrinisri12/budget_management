import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, ChevronDown, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({ pageTitle = 'Dashboard', onMenuToggle }) => {
  const { user, logout, isFaculty } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
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
    { id: 1, title: 'CSEA Budget Approved', time: '10m ago', text: '₹45,000 approved for CSEA Symposium 2026.' },
    { id: 2, title: 'CCC Coding Contest Request', time: '1h ago', text: 'CCC Hackathon request of ₹12,500 requires review.' },
    { id: 3, title: 'CSE Lab Equipment Audit', time: '1d ago', text: 'Q3 CSE hardware maintenance audit due on Sep 30.' }
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (isFaculty ? 'F' : 'A');
  const userName = user?.name || (isFaculty ? 'Faculty Member' : 'Admin User');
  const userRole = isFaculty ? (user?.designation || 'Faculty Member') : 'CSE Budget Officer';
  const userEmail = user?.email || (isFaculty ? 'faculty@kongu.edu' : 'admin@kongu.edu');

  return (
    <header
      style={{
        height: 72,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      {/* Left side: Hamburger & Titles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--dark-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark)', lineHeight: 1.2 }}>
            {pageTitle}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 500 }}>
            Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{userName}</span> • <span style={{ color: 'var(--dark-muted)' }}>CSE Department</span>
          </p>
        </div>
      </div>

      {/* Right side: Search, Notifications & Profile dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Quick Search */}
        <div style={{ position: 'relative', width: 240 }} className="hidden sm:block">
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
          <input
            type="text"
            placeholder="Search CSE budgets..."
            style={{
              width: '100%',
              height: 38,
              paddingLeft: 38,
              paddingRight: 14,
              fontSize: 13.5,
              borderRadius: 20,
              border: '1px solid var(--border)',
              backgroundColor: '#F8F7FF',
              outline: 'none'
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
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#F1EFFD',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--dark-muted)',
              position: 'relative'
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                border: '2px solid #FFFFFF'
              }}
            />
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                width: 320,
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                padding: 16,
                zIndex: 100
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700 }}>CSE Notifications</h4>
                <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>3 New</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: 10, borderRadius: 10, backgroundColor: '#F8F7FF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                      <span>{n.title}</span>
                      <span style={{ color: 'var(--secondary)', fontSize: 11 }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--dark-muted)', marginTop: 2 }}>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin / User Profile Pill & Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifications(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 24,
              transition: 'background-color 0.15s'
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(68, 60, 222, 0.25)'
              }}
            >
              {userInitial}
            </div>
            <div style={{ textAlign: 'left' }} className="hidden sm:block">
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{userName}</div>
              <div style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 500 }}>{userRole}</div>
            </div>
            <ChevronDown size={16} style={{ color: 'var(--secondary)' }} />
          </button>

          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                width: 220,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px 0',
                zIndex: 100
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)' }}>{userName}</p>
                <p style={{ fontSize: 12, color: 'var(--secondary)' }}>{userEmail}</p>
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
                  gap: 10,
                  padding: '10px 16px',
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: 'var(--dark)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <SettingsIcon size={16} />
                <span>Account Settings</span>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: 'var(--danger-text)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
