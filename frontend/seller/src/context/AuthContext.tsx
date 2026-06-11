import React, { createContext, useState, useContext,type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../services/api';
import { toast } from 'sonner';
import type{ Seller, RegisterData, LoginCredentials } from '../types';

interface AuthContextType {
  seller: Seller | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [seller, setSeller] = useState<Seller | null>(() => {
    const stored = localStorage.getItem('seller');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('seller_token'));
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await sellerAPI.login(credentials.email, credentials.password);
      setSeller(response.data.seller);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${response.data.seller.business_name}!`);
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error('Invalid credentials. Please register first.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      await sellerAPI.register(data);
      toast.success('Registration successful! Please login.');
      navigate('/login');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSeller(null);
    setIsAuthenticated(false);
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller');
    localStorage.removeItem('seller_id');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ seller, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};