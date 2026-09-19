import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FacultyPage } from './pages/FacultyPage';
import { AddFacultyPage } from './pages/AddFacultyPage';
import { CSEAPage } from './pages/CSEAPage';
import { CCCPage } from './pages/CCCPage';
import { BudgetOverviewPage } from './pages/BudgetOverviewPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Guard (Redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <BrowserRouter>
          <Routes>
            {/* Login Route */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Faculty Management Routes */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute>
                  <FacultyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/add"
              element={
                <ProtectedRoute>
                  <AddFacultyPage />
                </ProtectedRoute>
              }
            />

            {/* CSE Activities Routes */}
            <Route
              path="/csea"
              element={
                <ProtectedRoute>
                  <CSEAPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ccc"
              element={
                <ProtectedRoute>
                  <CCCPage />
                </ProtectedRoute>
              }
            />

            {/* Budget Routes */}
            <Route
              path="/budget/overview"
              element={
                <ProtectedRoute>
                  <BudgetOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget/allocations"
              element={
                <ProtectedRoute>
                  <BudgetOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget/requests"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget/expenses"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Transactions, Categories */}
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <BudgetOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
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
