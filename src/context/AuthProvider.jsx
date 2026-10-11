import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './AuthContext';

// Helper to normalize legacy role names to exactly 3 supported application roles: 'hod', 'faculty', 'admin'
const normalizeApplicationRole = (rawRole) => {
  if (!rawRole) return 'faculty';
  const r = String(rawRole).trim().toLowerCase();
  if (r === 'hod' || r.includes('head') || r.includes('department head')) return 'hod';
  if (r === 'admin' || r.includes('administrator') || r.includes('coordinator') || r.includes('officer')) return 'admin';
  return 'faculty';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch full user profile from profiles table linked to auth.users
  const fetchUserProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      return null;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, departments(id, name, code)')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile from database:', error.message);
        setUser(null);
        return null;
      }

      if (!profile) {
        setUser(null);
        return null;
      }

      const assignedRole = normalizeApplicationRole(profile.role);

      const mergedUser = {
        id: authUser.id,
        email: authUser.email,
        name: profile.name || authUser.email.split('@')[0],
        role: assignedRole,
        designation: profile.designation || (assignedRole === 'hod' ? 'Department Head / HOD' : assignedRole === 'admin' ? 'Budget Coordinator' : 'Faculty Member'),
        employeeId: profile.employee_id || '',
        department: profile.departments?.name || 'Computer Science and Engineering (CSE)',
        departmentCode: profile.departments?.code || 'CSE',
        phone: profile.phone || '',
        status: profile.status || 'Active'
      };

      setUser(mergedUser);
      return mergedUser;
    } catch (err) {
      console.error('Error fetching profile in AuthProvider:', err);
      setUser(null);
      return null;
    }
  };

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            await fetchUserProfile(initialSession.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Supabase session init warning:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        await fetchUserProfile(newSession.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Admin / HOD / General Login (Email + Password, optional role)
  const login = async (email, password, role) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, message: 'Email address is required.' };
    }
    if (!password) {
      return { success: false, message: 'Password is required.' };
    }

    // Disallow employee ID as login credential
    if (!cleanEmail.includes('@')) {
      return {
        success: false,
        message: 'Please use your registered email address to log in. Employee/Faculty ID is not accepted as a login credential.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        return {
          success: false,
          message: error.message === 'Invalid login credentials'
            ? 'Invalid email or password.'
            : error.message
        };
      }

      const profile = await fetchUserProfile(data.user);

      if (role && profile) {
        const normalizedCheck = normalizeApplicationRole(role);
        if (profile.role !== normalizedCheck && profile.role !== 'admin' && profile.role !== 'hod') {
          await supabase.auth.signOut();
          return { success: false, message: `Access denied: Account is not authorized for ${role} role.` };
        }
      }

      return { success: true, user: profile };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: err.message || 'An error occurred during sign in.' };
    }
  };

  // Faculty Login (Email + Password ONLY - Employee ID rejected)
  const loginFaculty = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, message: 'Email address is required.' };
    }
    if (!password) {
      return { success: false, message: 'Password is required.' };
    }

    // Strict validation: Faculty ID / Employee ID MUST NOT be used as login credential
    if (!cleanEmail.includes('@')) {
      return {
        success: false,
        message: 'Faculty login requires your institutional email address (@kongu.edu). Faculty ID / Employee ID cannot be used to log in.'
      };
    }

    if (!cleanEmail.endsWith('@kongu.edu')) {
      return {
        success: false,
        message: 'Please use a valid Kongu email address ending in @kongu.edu.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        return {
          success: false,
          message: error.message === 'Invalid login credentials'
            ? 'Invalid email or password.'
            : error.message
        };
      }

      const profile = await fetchUserProfile(data.user);

      // Verify user is faculty
      if (profile && profile.role !== 'faculty' && profile.role !== 'admin' && profile.role !== 'hod') {
        await supabase.auth.signOut();
        return { success: false, message: 'Access denied: You do not have faculty portal permissions.' };
      }

      return { success: true, user: profile };
    } catch (err) {
      console.error('Faculty login error:', err);
      return { success: false, message: err.message || 'An error occurred during sign in.' };
    }
  };

  // Current user accessor
  const getCurrentUser = () => user;

  // Sign Out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  // Reset Password Request (Forgot Password flow)
  const resetPassword = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Email address is required.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: 'Password reset link has been dispatched to your email address.'
      };
    } catch (err) {
      return { success: false, message: err.message || 'Error sending password reset email.' };
    }
  };

  // Update Password (when user lands on reset password page)
  const updatePassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Password updated successfully. You can now sign in.' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update password.' };
    }
  };

  const refreshProfile = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isHod: user?.role === 'hod',
        isFaculty: user?.role === 'faculty',
        isManagement: user?.role === 'admin' || user?.role === 'hod',
        loading,
        login,
        loginFaculty,
        logout,
        getCurrentUser,
        onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
        resetPassword,
        updatePassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
