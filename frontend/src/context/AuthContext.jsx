import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await apiRequest('/auth/me');
          setUser(userData);
        } catch (err) {
          console.error("Failed to load user session:", err);
          setAuthToken("");
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const res = await apiRequest('/auth/login', 'POST', formData, true);
    setAuthToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (email, password, fullName) => {
    const res = await apiRequest('/auth/register', 'POST', {
      email,
      password,
      full_name: fullName
    });
    setAuthToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const loginWithGoogle = async (credential) => {
    const res = await apiRequest('/auth/google', 'POST', { credential });
    setAuthToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const requestPasswordReset = (email) => apiRequest('/auth/forgot-password', 'POST', { email });

  const logout = () => {
    setAuthToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, requestPasswordReset, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
