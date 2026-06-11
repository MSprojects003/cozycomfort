import React, { createContext, useState, useContext,type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { distributorAPI } from '../service/api';
import { toast } from 'sonner';

interface Distributor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_date: string;
}

interface AuthContextType {
  distributor: Distributor | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
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
  const [distributor, setDistributor] = useState<Distributor | null>(() => {
    const stored = localStorage.getItem('distributor');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('distributor_token'));
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await distributorAPI.getAllDistributors();
      const distributors = response.data.distributors || [];
      const found = distributors.find((d: Distributor) => d.email === email);
      
      if (found) {
        setDistributor(found);
        setIsAuthenticated(true);
        localStorage.setItem('distributor_token', 'authenticated');
        localStorage.setItem('distributor', JSON.stringify(found));
        localStorage.setItem('distributor_id', found.id.toString());
        toast.success(`Welcome back, ${found.name}!`);
        navigate('/dashboard');
        return true;
      }
      toast.error('Distributor not found. Please register first.');
      return false;
    } catch (error) {
      toast.error('Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await distributorAPI.register(data);
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
    setDistributor(null);
    setIsAuthenticated(false);
    localStorage.removeItem('distributor_token');
    localStorage.removeItem('distributor');
    localStorage.removeItem('distributor_id');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ distributor, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};