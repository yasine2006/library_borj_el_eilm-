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
      // Verify token + update user data (approval_status etc.)
      apiGetMe().then(data => {
        if (data) {
          localStorage.setItem('user', JSON.stringify(data));
          setUser(data);
        }
      }).catch(() => {
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
  const isGrossistePending = () => user?.user_type === 'wholesale' && user?.approval_status === 'pending';
  const isGrossisteRejected = () => user?.user_type === 'wholesale' && user?.approval_status === 'rejected';

  return (
    <AuthContext.Provider value={{ user, login, logout, isSuperAdmin, isAdmin, isClient, isGrossistePending, isGrossisteRejected, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
