import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { distributorAPI } from '../service/api';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const PlaceOrder: React.FC = () => {
  const { distributor } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['available-blankets'],
    queryFn: () => distributorAPI.getAvailableBlankets(),
  });

  const requestMutation = useMutation({
    mutationFn: () => {
      if (!selectedProduct) throw new Error('No product selected');
      return distributorAPI.requestFromManufacturer(
        selectedProduct.id, 
        quantity, 
        notes || `Request for restocking ${selectedProduct.name}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['distributor-inventory'] });
      toast.success(`Request sent to manufacturer for ${quantity} units`);
      setSelectedProduct(null);
      setQuantity(1);
      setNotes('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send request');
    },
  });

  const products = data?.data?.available_blankets || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    requestMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request from Manufacturer</h1>
        <p className="text-gray-600 mt-1">Request additional stock from the manufacturer</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product: any) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.material} - {product.size}</p>
                      <p className="text-sm text-gray-600">Color: {product.color}</p>
                      <p className="text-sm text-gray-600">Manufacturer Stock: {product.quantity} units</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-900">${product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedProduct ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select a product from the list to request stock
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-600">Manufacturer Stock: {selectedProduct.quantity} units</p>
                  <p className="text-sm text-gray-600">Price per unit: ${selectedProduct.price}</p>
                </div>

                <div>
                  <Label htmlFor="quantity">Request Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total Cost: ${(selectedProduct.price * quantity).toFixed(2)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={requestMutation.isPending}
                >
                  {requestMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Request to Manufacturer
                    </>
                  )}
                </Button>

                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Request will be processed. Stock will be added to your inventory upon approval.
                  </AlertDescription>
                </Alert>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};