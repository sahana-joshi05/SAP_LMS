import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = sessionStorage.getItem('lms_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (token, user) => {
    const value = { token, user };
    sessionStorage.setItem('lms_auth', JSON.stringify(value));
    setAuth(value);
  };

  const logout = () => {
    sessionStorage.removeItem('lms_auth');
    setAuth(null);
  };

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
