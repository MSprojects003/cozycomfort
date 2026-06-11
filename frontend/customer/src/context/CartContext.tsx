import React, { createContext, useState, useContext,type ReactNode, useEffect } from 'react';
import {type CartItem } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, quantity: number) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        price: product.price,
        image: product.front_image
      };
      setCart([...cart, newItem]);
    }
    toast.success(`Added ${quantity} x ${product.name} to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    toast.info('Cart cleared');
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};