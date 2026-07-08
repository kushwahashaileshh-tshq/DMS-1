import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      const { user: currUser, profile: currProfile, error: err } = await getCurrentUser();
      if (err) {
        setError(err.message);
      } else {
        setUser(currUser);
        setProfile(currProfile);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    const { data, error: err } = await authLogin(email, password);
    if (err) {
      setError(err.message);
      return false;
    }
    setUser(data.user);
    setProfile(data.profile);
    return true;
  };

  const logout = async () => {
    const { error: err } = await authLogout();
    if (err) {
      setError(err.message);
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, login, logout }}>
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
