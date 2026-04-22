import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Simple JWT decode (no library needed — just reads the payload)
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      setUser({ 
        isLoggedIn: true, 
        name: decoded?.name || decoded?.email?.split('@')[0] || 'User',
        email: decoded?.email || '',
        role: decoded?.role || 'student'
      });
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.token) {
        const tok = res.data.token;
        setToken(tok);
        localStorage.setItem('token', tok);
        const decoded = decodeToken(tok);
        setUser({ 
          isLoggedIn: true, 
          name: decoded?.name || decoded?.email?.split('@')[0] || 'User',
          email: decoded?.email || email,
          role: decoded?.role || 'student'
        });
        toast.success('Welcome back!');
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    toast.success('Signed out');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
