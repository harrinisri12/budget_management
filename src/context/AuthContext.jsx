import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('cbm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Admin Login
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'admin@kongu.edu' && password === 'kongu@123') {
      const adminUser = {
        name: 'System Admin',
        email: 'admin@kongu.edu',
        role: 'admin',
        designation: 'Chief Budget Administrator',
        institution: 'Kongu Engineering College',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      setUser(adminUser);
      sessionStorage.setItem('cbm_user', JSON.stringify(adminUser));
      return { success: true };
    } else {
      return {
        success: false,
        message: 'Invalid email or password.'
      };
    }
  };

  // Faculty Login
  const loginFaculty = (email, password, facultyList = []) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@kongu.edu')) {
      return {
        success: false,
        message: 'Please use a valid Kongu email address.'
      };
    }

    // Check matching faculty from state/roster
    const facultyMatch = facultyList.find(
      (f) => f.email && f.email.trim().toLowerCase() === cleanEmail
    );

    // Accept default mock password 'kongu@123' if password not explicitly set on record
    const expectedPassword = (facultyMatch && facultyMatch.password) ? facultyMatch.password : 'kongu@123';

    if (facultyMatch && password === expectedPassword) {
      const facultyUser = {
        name: facultyMatch.name,
        email: facultyMatch.email,
        role: 'faculty',
        designation: facultyMatch.designation || 'Faculty Member',
        employeeId: facultyMatch.employeeId || 'FAC001',
        department: 'Computer Science and Engineering (CSE)',
        phone: facultyMatch.phone || '+91 98421 12345'
      };
      setUser(facultyUser);
      sessionStorage.setItem('cbm_user', JSON.stringify(facultyUser));
      return { success: true };
    }

    // Fallback for default demo faculty arun@kongu.edu if not found in passed array
    if (cleanEmail === 'arun@kongu.edu' && password === 'kongu@123') {
      const defaultFaculty = {
        name: 'Dr. Arun Kumar',
        email: 'arun@kongu.edu',
        role: 'faculty',
        designation: 'Professor',
        employeeId: 'FAC001',
        department: 'Computer Science and Engineering (CSE)',
        phone: '+91 98421 12345'
      };
      setUser(defaultFaculty);
      sessionStorage.setItem('cbm_user', JSON.stringify(defaultFaculty));
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid email or password.'
    };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('cbm_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isFaculty: user?.role === 'faculty',
        login,
        loginFaculty,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

