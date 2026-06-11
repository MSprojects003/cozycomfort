import React, { createContext, useState, useContext,type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import { toast } from 'sonner';
import type{ Customer, RegisterData } from '../types';

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<boolean>;
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
  const [customer, setCustomer] = useState<Customer | null>(() => {
    const stored = localStorage.getItem('customer');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('customer_token'));
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await customerAPI.login(email);
      setCustomer(response.data.customer);
      setIsAuthenticated(true);
      localStorage.setItem('customer_token', 'authenticated');
      localStorage.setItem('customer', JSON.stringify(response.data.customer));
      localStorage.setItem('customer_id', response.data.customer.id.toString());
      toast.success(`Welcome back, ${response.data.customer.first_name}!`);
      navigate('/shop');
      return true;
    } catch (error) {
      toast.error('Customer not found');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await customerAPI.register(data);
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
    setCustomer(null);
    setIsAuthenticated(false);
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');
    localStorage.removeItem('customer_id');
    localStorage.removeItem('customer_cart');
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ customer, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};