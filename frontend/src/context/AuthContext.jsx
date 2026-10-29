import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('attendease_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('attendease_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('attendease_user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setToken(data.token);
    setUser(data);
    localStorage.setItem('attendease_token', data.token);
    localStorage.setItem('attendease_user', JSON.stringify(data));
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setToken(data.token);
    setUser(data);
    localStorage.setItem('attendease_token', data.token);
    localStorage.setItem('attendease_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('attendease_token');
    localStorage.removeItem('attendease_user');
  };

  const quickDemoLogin = async (roleType) => {
    if (roleType === 'FACULTY') {
      return login('prof.sharma@attendease.edu', 'Password123!');
    } else if (roleType === 'STUDENT2') {
      return login('priya.patel@attendease.edu', 'Password123!');
    } else {
      return login('alex.morgan@attendease.edu', 'Password123!');
    }
  };

  const isFaculty = user?.role === 'ROLE_FACULTY' || user?.role === 'ROLE_ADMIN';
  const isStudent = user?.role === 'ROLE_STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        isFaculty,
        isStudent,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
