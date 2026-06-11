import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './pages/Dashboard';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Products } from './pages/Products';
import { PlaceOrder } from './pages/PlaceOrder';
import { MyOrders } from './pages/MyOrders';
import { Inventory } from './pages/Inventory';
import { CustomerOrders } from './pages/CustomerOrders';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="place-order" element={ <PlaceOrder />} />
        <Route path="orders" element={ <MyOrders />} />
        <Route path="customer-orders" element={<CustomerOrders />} />
        <Route path="inventory" element={ <Inventory />} />
       
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