import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';

import { LoginPage } from './pages/LoginPage';
import { FacultyLoginPage } from './pages/FacultyLoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FacultyDashboardPage } from './pages/FacultyDashboardPage';
import { FacultyProposalsPage } from './pages/FacultyProposalsPage';
import { NewProposalPage } from './pages/NewProposalPage';
import { FacultyProfilePage } from './pages/FacultyProfilePage';
import { AdminProposalsPage } from './pages/AdminProposalsPage';
import { FacultyPage } from './pages/FacultyPage';
import { AddFacultyPage } from './pages/AddFacultyPage';
import { CSEAPage } from './pages/CSEAPage';
import { CCCPage } from './pages/CCCPage';
import { BudgetOverviewPage } from './pages/BudgetOverviewPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isFaculty } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isFaculty) {
    return <Navigate to="/faculty/dashboard" replace />;
  }
  return children;
};

// Faculty Route Guard
const FacultyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/faculty/login" replace />;
  }
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Public Route Guard (Redirects to relevant dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isFaculty } = useAuth();
  if (isAuthenticated) {
    return isFaculty ? <Navigate to="/faculty/dashboard" replace /> : <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <BrowserRouter>
          <Routes>
            {/* Login Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/faculty/login"
              element={
                <PublicRoute>
                  <FacultyLoginPage />
                </PublicRoute>
              }
            />

            {/* Admin Dashboard & Management Routes */}
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/faculty"
              element={
                <AdminRoute>
                  <FacultyPage />
                </AdminRoute>
              }
            />
            <Route
              path="/faculty/add"
              element={
                <AdminRoute>
                  <AddFacultyPage />
                </AdminRoute>
              }
            />
            <Route
              path="/proposals"
              element={
                <AdminRoute>
                  <AdminProposalsPage />
                </AdminRoute>
              }
            />

            {/* Faculty Portal Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <FacultyRoute>
                  <FacultyDashboardPage />
                </FacultyRoute>
              }
            />
            <Route
              path="/faculty/proposals"
              element={
                <FacultyRoute>
                  <FacultyProposalsPage />
                </FacultyRoute>
              }
            />
            <Route
              path="/faculty/proposal/new"
              element={
                <FacultyRoute>
                  <NewProposalPage />
                </FacultyRoute>
              }
            />
            <Route
              path="/faculty/profile"
              element={
                <FacultyRoute>
                  <FacultyProfilePage />
                </FacultyRoute>
              }
            />

            {/* CSE Activities Routes */}
            <Route
              path="/csea"
              element={
                <AdminRoute>
                  <CSEAPage />
                </AdminRoute>
              }
            />
            <Route
              path="/ccc"
              element={
                <AdminRoute>
                  <CCCPage />
                </AdminRoute>
              }
            />

            {/* Budget Routes */}
            <Route
              path="/budget/overview"
              element={
                <AdminRoute>
                  <BudgetOverviewPage />
                </AdminRoute>
              }
            />
            <Route
              path="/budget/allocations"
              element={
                <AdminRoute>
                  <BudgetOverviewPage />
                </AdminRoute>
              }
            />
            <Route
              path="/budget/requests"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/budget/expenses"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />

            {/* Transactions, Categories, Reports, Settings */}
            <Route
              path="/transactions"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <AdminRoute>
                  <BudgetOverviewPage />
                </AdminRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <AdminRoute>
                  <ReportsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AdminRoute>
                  <SettingsPage />
                </AdminRoute>
              }
            />

            {/* Default root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </BudgetProvider>
    </AuthProvider>
  );
}

