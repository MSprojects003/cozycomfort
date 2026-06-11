import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Factory,
} from 'lucide-react';

interface NavItem {
  name: string;
  icon: React.FC<{ className?: string }>;
  path: string;
}

// Navigation items
const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Products', icon: Package, path: '/products' },
  { name: 'Orders', icon: ShoppingBag, path: '/orders' },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-md"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Factory className="h-8 w-8 text-gray-900" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cozy Comfort</h1>
                <p className="text-xs text-gray-500">Manufacturer Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback className="bg-gray-900 text-white">
                  {user ? getInitials(user.name) : 'CM'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
};