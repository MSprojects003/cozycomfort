import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/Loginform';
import { Dashboard } from './pages/Dasbaord';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';


const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
         
        <Route path="low-stock" element={<div className="p-8">Low Stock Page (Coming Soon)</div>} />
        <Route path="settings" element={<div className="p-8">Settings Page (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;