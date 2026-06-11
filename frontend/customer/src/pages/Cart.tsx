import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ShoppingBag, ArrowRight, CreditCard, Truck } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { customerAPI } from '../services/api';
import { toast } from 'sonner';
import { useState } from 'react';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState(customer?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const checkoutMutation = useMutation({
    mutationFn: () => {
      return customerAPI.checkout({
        customer_id: customer!.id,
        items: cart,
        payment_method: paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery',
        shipping_address: shippingAddress,
        notes: ''
      });
    },
    onSuccess: (response) => {
      toast.success(`Order placed successfully! Order #: ${response.data.order_number}`);
      clearCart();
      navigate('/orders');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to place order');
    },
  });

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    if (!shippingAddress) {
      toast.error('Please enter shipping address');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    checkoutMutation.mutate();
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any items yet</p>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image && (
                    <img
                      src={`http://localhost:5000${item.image}`}
                      alt={item.product_name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product_name}</h3>
                    <p className="text-blue-900 font-bold">${item.price}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary & Checkout */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({getCartCount()} items)</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4" />
                  Shipping Address
                </Label>
                <Input
                  placeholder="Enter your shipping address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="cursor-pointer"
                    />
                    <span>Credit / Debit Card</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="cursor-pointer"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  'Processing...'
                ) : (
                  <>
                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};