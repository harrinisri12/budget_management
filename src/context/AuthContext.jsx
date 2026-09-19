import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('cbm_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === 'admin@kongu.edu' && password === 'kongu@123') {
      const adminUser = {
        name: 'System Admin',
        email: 'admin@kongu.edu',
        role: 'Chief Budget Administrator',
        institution: 'Kongu Engineering College',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      setUser(adminUser);
      sessionStorage.setItem('cbm_admin_user', JSON.stringify(adminUser));
      return { success: true };
    } else {
      return {
        success: false,
        message: 'Invalid credentials. Please use admin@kongu.edu and kongu@123'
      };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('cbm_admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
