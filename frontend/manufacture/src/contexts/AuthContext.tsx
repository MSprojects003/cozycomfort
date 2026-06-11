import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {type User, type LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    // Mock login - replace with actual API call
    if (credentials.email === 'manufacturer@cozy.com' && credentials.password === 'admin123') {
      const userData: User = {
        id: 1,
        name: 'Cozy Comfort Manufacturing',
        email: credentials.email,
        role: 'manufacturer',
        company: 'Cozy Comfort Inc.'
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('token', 'mock-token-12345');
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};