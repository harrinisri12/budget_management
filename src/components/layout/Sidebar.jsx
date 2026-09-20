import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  GitPullRequest,
  Receipt,
  ArrowRightLeft,
  Tags,
  Users,
  UserPlus,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Code2,
  Trophy,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [budgetOpen, setBudgetOpen] = useState(true);
  const [facultyOpen, setFacultyOpen] = useState(true);
  const [activitiesOpen, setActivitiesOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isBudgetPath = location.pathname.startsWith('/budget');
  const isFacultyPath = location.pathname.startsWith('/faculty');
  const isActivitiesPath = location.pathname === '/csea' || location.pathname === '/ccc';

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
              style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
              className="md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div style={{ padding: '16px 14px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Dashboard */}
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
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none'
              })}
            >
              <LayoutDashboard size={19} />
              <span>Dashboard</span>
            </NavLink>

            {/* Budget Accordion */}
            <div>
              <button
                onClick={() => setBudgetOpen(!budgetOpen)}
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
                  background: isBudgetPath ? 'var(--primary-light)' : 'transparent',
                  color: isBudgetPath ? 'var(--primary)' : 'var(--dark-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Wallet size={19} />
                  <span>Budget</span>
                </div>
                {budgetOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {budgetOpen && (
                <div style={{ paddingLeft: 34, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <NavLink
                    to="/budget/overview"
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
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    })}
                  >
                    <PieChart size={15} />
                    <span>Budget Overview</span>
                  </NavLink>
                  <NavLink
                    to="/budget/allocations"
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
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    })}
                  >
                    <span>Allocations</span>
                  </NavLink>
                  <NavLink
                    to="/budget/requests"
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
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    })}
                  >
                    <GitPullRequest size={15} />
                    <span>Requests</span>
                  </NavLink>
                  <NavLink
                    to="/budget/expenses"
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
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    })}
                  >
                    <Receipt size={15} />
                    <span>Expenses</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Transactions */}
            <NavLink
              to="/transactions"
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
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none'
              })}
            >
              <ArrowRightLeft size={19} />
              <span>Transactions</span>
            </NavLink>

            {/* Proposals */}
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
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none'
              })}
            >
              <FileSpreadsheet size={19} />
              <span>Proposals</span>
            </NavLink>

            {/* Categories */}
            <NavLink
              to="/categories"
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
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none'
              })}
            >
              <Tags size={19} />
              <span>Categories</span>
            </NavLink>

            {/* Faculty Accordion */}
            <div>
              <button
                onClick={() => setFacultyOpen(!facultyOpen)}
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
                  background: isFacultyPath ? 'var(--primary-light)' : 'transparent',
                  color: isFacultyPath ? 'var(--primary)' : 'var(--dark-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Users size={19} />
                  <span>Faculty</span>
                </div>
                {facultyOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {facultyOpen && (
                <div style={{ paddingLeft: 34, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <NavLink
                    to="/faculty"
                    end
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
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    })}
                  >
                    <Users size={15} />
                    <span>Faculty List</span>
                  </NavLink>

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
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    })}
                  >
                    <UserPlus size={15} />
                    <span>Add Faculty</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* CSE Activities Accordion */}
            <div>
              <button
                onClick={() => setActivitiesOpen(!activitiesOpen)}
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
                  background: isActivitiesPath ? 'var(--primary-light)' : 'transparent',
                  color: isActivitiesPath ? 'var(--primary)' : 'var(--dark-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Trophy size={19} />
                  <span>CSE Activities</span>
                </div>
                {activitiesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {activitiesOpen && (
                <div style={{ paddingLeft: 34, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <NavLink
                    to="/csea"
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
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    })}
                  >
                    <Trophy size={15} />
                    <span>CSEA Association</span>
                  </NavLink>

                  <NavLink
                    to="/ccc"
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
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    })}
                  >
                    <Code2 size={15} />
                    <span>CCC Coding Club</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Reports */}
            <NavLink
              to="/reports"
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
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none'
              })}
            >
              <FileSpreadsheet size={19} />
              <span>Reports</span>
            </NavLink>

            {/* Settings */}
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
                boxShadow: isActive ? '0 4px 12px rgba(68, 60, 222, 0.2)' : 'none'
              })}
            >
              <Settings size={19} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>

        {/* Sidebar Footer / Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
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
