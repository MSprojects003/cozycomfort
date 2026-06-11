import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  User
} from 'lucide-react';

interface NavItem {
  name: string;
  icon: React.FC<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Products', icon: Package, path: '/products' },
  { name: 'Place Order', icon: ShoppingCart, path: '/place-order' },
  { name: 'My Orders', icon: Truck, path: '/orders' },
  { name: 'Inventory', icon: Package, path: '/inventory' },
  { name: 'Customer Orders', icon: User, path: '/customer-orders' }, 
 
];

export const DashboardLayout: React.FC = () => {
  const { seller, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const getInitials = (name: string): string => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-white shadow-md">
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-green-900" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cozy Comfort</h1>
                <p className="text-xs text-gray-500">Seller Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar><AvatarFallback className="bg-green-900 text-white">{seller ? getInitials(seller.business_name) : 'S'}</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{seller?.business_name}</p>
                <p className="text-xs text-gray-500">{seller?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
};