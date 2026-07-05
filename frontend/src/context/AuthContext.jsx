import { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiRegister, apiGetMe } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      apiGetMe().catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      });
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isSuperAdmin = () => user?.role_id === 1;
  const isAdmin = () => user?.role_id === 1 || user?.role_id === 2;
  const isClient = () => user?.role_id === 3;

  return (
    <AuthContext.Provider value={{ user, login, logout, isSuperAdmin, isAdmin, isClient, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
