import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X, Package, ClipboardList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { customer, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-900" />
            <span className="text-xl font-bold text-gray-900">Cozy Comfort</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/shop" className="text-gray-700 hover:text-blue-900 transition">Shop</Link>
            <Link to="/orders" className="text-gray-700 hover:text-blue-900 transition flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              My Orders
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-900 transition">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-900 transition">Contact</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/cart')} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {customer?.first_name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/account')}>My Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>My Orders</DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Register</Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-3">
            <Link to="/shop" className="block text-gray-700 hover:text-blue-900" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            <Link to="/orders" className="block text-gray-700 hover:text-blue-900 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <ClipboardList className="h-4 w-4" />
              My Orders
            </Link>
            <Link to="/about" className="block text-gray-700 hover:text-blue-900" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block text-gray-700 hover:text-blue-900" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link to="/cart" className="block text-gray-700 hover:text-blue-900" onClick={() => setMobileMenuOpen(false)}>Cart ({getCartCount()})</Link>
            {isAuthenticated ? (
              <>
                <Link to="/account" className="block text-gray-700 hover:text-blue-900" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                <Link to="/orders" className="block text-gray-700 hover:text-blue-900" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block text-red-600 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-blue-900" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-gray-700 hover:text-blue-900" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};