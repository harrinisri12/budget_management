import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Tracks the current user's ID so stale async responses can be discarded
  const currentUserIdRef = useRef(null);
  // In-flight promise cache: concurrent callers for the same user share one request
  const profileFetchRef = useRef(null);
  // Prevents state updates after unmount
  const mountedRef = useRef(true);

  // Build merged user object from an auth user + profiles row
  const buildMergedUser = useCallback((authUser, profile) => {
    if (!authUser || !profile) return null;
    const assignedRole = normalizeApplicationRole(profile.role);
    return {
      id: authUser.id,
      email: authUser.email,
      name: profile.name || authUser.email.split('@')[0],
      role: assignedRole,
      designation: profile.designation || (
        assignedRole === 'hod'
          ? 'Department Head / HOD'
          : assignedRole === 'admin'
            ? 'Budget Coordinator'
            : 'Faculty Member'
      ),
      employeeId: profile.employee_id || '',
      department: profile.departments?.name || 'Computer Science and Engineering (CSE)',
      departmentCode: profile.departments?.code || 'CSE',
      phone: profile.phone || '',
      status: profile.status || 'Active'
    };
  }, []);


  // Fetch full user profile from profiles table linked to auth.users.
  // Uses an in-flight promise cache so concurrent callers for the same user
  // share one database request instead of issuing duplicates.
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser?.id) {
      if (mountedRef.current) setUser(null);
      return null;
    }

    const fetchingForUserId = authUser.id;

    // Reuse an active in-flight request for the same user
    if (profileFetchRef.current && profileFetchRef.current.userId === fetchingForUserId) {
      try {
        return await profileFetchRef.current.promise;
      } catch {
        return null;
      }
    }

    const promise = (async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*, departments(id, name, code)')
          .eq('id', fetchingForUserId)
          .maybeSingle();

        if (error) {
          // Database error — do not silently treat as a missing profile
          console.error('Database error fetching user profile:', error.message);
          return null;
        }

        if (!profile) {
          console.warn('No profile found for user:', fetchingForUserId);
          return null;
        }

        return buildMergedUser(authUser, profile);
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        return null;
      } finally {
        // Clear the cache entry so future calls (e.g. refreshProfile) get fresh data
        if (profileFetchRef.current?.userId === fetchingForUserId) {
          profileFetchRef.current = null;
        }
      }
    })();

    profileFetchRef.current = { userId: fetchingForUserId, promise };

    const mergedUser = await promise;

    // Only update state if still mounted AND this is still the current active user
    if (mountedRef.current && currentUserIdRef.current === fetchingForUserId) {
      setUser(mergedUser);
    }

    return mergedUser;
  }, [buildMergedUser]);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    mountedRef.current = true;

    // Prevents the auth state change handler from duplicating the profile load
    // that initializeAuth performs for the INITIAL_SESSION event.
    let initializationComplete = false;

    // Subscribe BEFORE calling initializeAuth to ensure no events are missed.
    // The initializationComplete flag prevents double-fetching INITIAL_SESSION.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // CRITICAL: Do NOT await inside this callback.
      // The Supabase SDK does not await the return value of this callback;
      // async work inside it runs detached and causes race conditions.
      // Synchronous state updates happen here; async profile work is
      // scheduled via setTimeout so the callback returns promptly.

      if (!mountedRef.current) return;

      setSession(newSession);

      if (event === 'SIGNED_OUT') {
        currentUserIdRef.current = null;
        profileFetchRef.current = null;
        setUser(null);
        setLoading(false);
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        // Session silently refreshed — profile data has not changed
        return;
      }

      if (newSession?.user) {
        const incomingUserId = newSession.user.id;

        // INITIAL_SESSION is handled by initializeAuth; skip to avoid duplicate fetch
        if (event === 'INITIAL_SESSION' && !initializationComplete) {
          return;
        }

        currentUserIdRef.current = incomingUserId;

        // Schedule async work outside the callback to keep it synchronous
        setTimeout(() => {
          if (!mountedRef.current || currentUserIdRef.current !== incomingUserId) return;
          fetchUserProfile(newSession.user).then(() => {
            if (mountedRef.current) setLoading(false);
          });
        }, 0);
      } else {
        currentUserIdRef.current = null;
        profileFetchRef.current = null;
        setUser(null);
        setLoading(false);
      }
    });

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        setSession(initialSession);

        if (initialSession?.user) {
          currentUserIdRef.current = initialSession.user.id;
          await fetchUserProfile(initialSession.user);
        } else {
          currentUserIdRef.current = null;
          setUser(null);
        }
      } catch (err) {
        console.warn('Supabase session init warning:', err);
        if (mountedRef.current) {
          currentUserIdRef.current = null;
          setUser(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          initializationComplete = true;
        }
      }
    }

    initializeAuth();

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

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

      if (!profile) {
        // Sign out to avoid leaving a partially authenticated session
        await supabase.auth.signOut();
        return { success: false, message: 'Unable to load your account profile. Please contact your administrator.' };
      }

      // If a specific portal role was requested, verify the user qualifies.
      // Admin and HOD both access the same admin portal.
      // Faculty users must not access the admin portal.
      if (role) {
        const normalizedRequested = normalizeApplicationRole(role);
        if ((normalizedRequested === 'admin' || normalizedRequested === 'hod') && profile.role === 'faculty') {
          await supabase.auth.signOut();
          return { success: false, message: 'Access denied: Account does not have admin or HOD portal access.' };
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

      if (!profile) {
        await supabase.auth.signOut();
        return { success: false, message: 'Unable to load your account profile. Please contact your administrator.' };
      }

      // Only faculty-role users may access the faculty portal.
      // HOD and admin users must use the admin portal at /login.
      if (profile.role !== 'faculty') {
        await supabase.auth.signOut();
        return {
          success: false,
          message: profile.role === 'hod' || profile.role === 'admin'
            ? 'Please use the Admin/HOD login portal to access your account.'
            : 'Access denied: You do not have faculty portal permissions.'
        };
      }

      return { success: true, user: profile };
    } catch (err) {
      console.error('Faculty login error:', err);
      return { success: false, message: err.message || 'An error occurred during sign in.' };
    }
  };

  // Current user accessor
  const getCurrentUser = () => user;

  // Sign Out — always clears local state even if the Supabase request fails
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      currentUserIdRef.current = null;
      profileFetchRef.current = null;
      if (mountedRef.current) {
        setUser(null);
        setSession(null);
      }
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

  // Refresh profile using getSession() (local storage read) instead of
  // getUser() (network call to /auth/v1/user) to avoid unnecessary 403s
  // when the token is expired and auto-refresh has not yet completed.
  const refreshProfile = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const currentUser = currentSession?.user;

      if (!currentUser) {
        console.warn('refreshProfile: no active session found.');
        return;
      }

      // Invalidate the cache so an explicit refresh always reads fresh data
      if (profileFetchRef.current?.userId === currentUser.id) {
        profileFetchRef.current = null;
      }

      await fetchUserProfile(currentUser);
    } catch (err) {
      console.error('Error refreshing profile:', err);
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
        resetPassword,
        updatePassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
