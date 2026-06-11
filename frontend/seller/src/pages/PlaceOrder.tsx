import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, AlertCircle, CheckCircle, Package, Plus, Minus, Radio } from 'lucide-react';
import { sellerAPI } from '../services/api';
import { toast } from 'sonner';
import {type Blanket } from '../types';

interface OrderItem {
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  selling_price: number;
  max_quantity: number;
}

export const PlaceOrder: React.FC = () => {
  const { seller } = useAuth();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['available-products'],
    queryFn: () => sellerAPI.getAvailableBlankets(),
  });

  const placeOrderMutation = useMutation({
    mutationFn: () => {
      const items = orderItems
        .filter(item => item.quantity > 0)
        .map(item => ({
          blanket_id: item.blanket_id,
          quantity: item.quantity,
          selling_price: item.selling_price
        }));
      
      if (items.length === 0) {
        throw new Error('No items selected');
      }
      
      // BROADCAST TO ALL DISTRIBUTORS - No distributor_id field
      return sellerAPI.placeOrder({
        seller_id: seller!.id,
        items: items,
        notes: notes
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      toast.success(`Order broadcasted to all distributors! Total: $${response.data.total_cost}`);
      // Reset form
      setOrderItems([]);
      setNotes('');
    },
    onError: (error: any) => {
      console.error('Order error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to place order');
    },
  });

  const products = productsData?.data?.available_blankets || [];

  const updateQuantity = (blanketId: number, quantity: number, blanketName: string, price: number, maxQuantity: number) => {
    if (quantity < 0) return;
    if (quantity > maxQuantity) {
      toast.error(`Only ${maxQuantity} units available for ${blanketName}`);
      return;
    }
    
    const existingIndex = orderItems.findIndex(item => item.blanket_id === blanketId);
    
    if (quantity === 0) {
      if (existingIndex !== -1) {
        setOrderItems(orderItems.filter(item => item.blanket_id !== blanketId));
      }
    } else {
      const sellingPrice = price * 1.3;
      
      if (existingIndex !== -1) {
        const updated = [...orderItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity,
          selling_price: sellingPrice
        };
        setOrderItems(updated);
      } else {
        setOrderItems([...orderItems, {
          blanket_id: blanketId,
          blanket_name: blanketName,
          quantity,
          selling_price: sellingPrice,
          max_quantity: maxQuantity
        }]);
      }
    }
  };

  const getQuantity = (blanketId: number): number => {
    const item = orderItems.find(item => item.blanket_id === blanketId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = orderItems.filter(item => item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one product to order');
      return;
    }
    
    if (confirm(`Broadcast this order to ALL distributors? Total amount: $${getTotalAmount().toFixed(2)}`)) {
      placeOrderMutation.mutate();
    }
  };

  if (productsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Place Order</h1>
        <p className="text-gray-600 mt-1">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Broadcast Mode</span>
          {' '}Order will be sent to ALL distributors. First to accept gets the order.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Available Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No products available from manufacturers.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {products.map((product: Blanket) => {
                      const currentQuantity = getQuantity(product.id);
                      return (
                        <Card key={product.id} className="hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row gap-4 p-4">
                            {product.front_image && (
                              <div className="w-full md:w-32 h-32 overflow-hidden rounded-lg">
                                <img
                                  src={`http://localhost:5000${product.front_image}`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-lg">{product.name}</h3>
                                  <p className="text-sm text-gray-600">{product.material} - {product.size}</p>
                                  <p className="text-sm text-gray-600">Color: {product.color}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-green-900">${product.price}</p>
                                  <p className="text-sm text-gray-500">Suggested Resale: ${(product.price * 1.3).toFixed(2)}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Available Stock:</span>
                                  <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                                    {product.quantity} units
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <Label className="text-sm">Quantity:</Label>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(product.id, currentQuantity - 1, product.name, product.price, product.quantity)}
                                      disabled={currentQuantity <= 0}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={currentQuantity}
                                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0, product.name, product.price, product.quantity)}
                                      className="w-20 text-center"
                                      min="0"
                                      max={product.quantity}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(product.id, currentQuantity + 1, product.name, product.price, product.quantity)}
                                      disabled={currentQuantity >= product.quantity}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {currentQuantity > 0 && (
                                <div className="mt-2 text-sm text-green-600">
                                  Subtotal: ${(product.price * 1.3 * currentQuantity).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-yellow-600" />
                  Order Summary (Broadcast)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Broadcast Info */}
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Radio className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    This order will be visible to <strong>ALL distributors</strong>. 
                    The first distributor to accept will fulfill it.
                  </AlertDescription>
                </Alert>

                {/* Selected Items Summary */}
                {orderItems.filter(i => i.quantity > 0).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No items selected</p>
                    <p className="text-sm">Add quantities to products above</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {orderItems.filter(i => i.quantity > 0).map((item) => (
                      <div key={item.blanket_id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{item.blanket_name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.selling_price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">@ ${item.selling_price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-900">${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for distributors?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  disabled={placeOrderMutation.isPending || orderItems.filter(i => i.quantity > 0).length === 0}
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Broadcasting Order...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Broadcast Order to All Distributors
                    </>
                  )}
                </Button>

                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Order will be visible to all distributors. Once a distributor accepts, 
                    stock will be added to your inventory automatically.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};