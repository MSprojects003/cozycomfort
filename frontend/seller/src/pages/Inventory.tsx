import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, AlertTriangle, TrendingUp, DollarSign, Plus, Minus, RefreshCw } from 'lucide-react';
import { sellerAPI } from '../services/api';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Inventory: React.FC = () => {
  const { seller } = useAuth();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['seller-inventory', seller?.id],
    queryFn: () => sellerAPI.getInventory(seller!.id),
    enabled: !!seller?.id,
  });

  const sellMutation = useMutation({
    mutationFn: ({ blanketId, quantity }: { blanketId: number; quantity: number }) =>
      sellerAPI.sellFromInventory(seller!.id, blanketId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      toast.success('Sale recorded successfully');
      setSelectedItem(null);
      setSellQuantity(1);
    },
  });

  const inventory = data?.data?.inventory || [];
  const totalItems = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const totalValue = inventory.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.purchased_price || 0)), 0);
  const lowStockItems = inventory.filter((item: any) => (item.quantity || 0) < 10 && (item.quantity || 0) > 0);
  const zeroStockItems = inventory.filter((item: any) => (item.quantity || 0) === 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your stock</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item: any) => (
                <TableRow key={item.blanket_id}>
                  <TableCell className="font-medium">{item.blanket_name}</TableCell>
                  <TableCell className={`font-bold ${item.quantity === 0 ? 'text-gray-400' : ''}`}>
                    {item.quantity} units
                  </TableCell>
                  <TableCell>${item.purchased_price?.toFixed(2) || '0'}</TableCell>
                  <TableCell>${item.selling_price?.toFixed(2) || '0'}</TableCell>
                  <TableCell>
                    {item.quantity === 0 ? (
                      <Badge variant="outline" className="text-gray-500">Not Purchased Yet</Badge>
                    ) : item.quantity < 10 ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedItem(item)}
                      disabled={item.quantity === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Record Sale
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zero Stock Alert */}
      {zeroStockItems.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {zeroStockItems.length} products with zero stock. Place orders to restock them.
          </AlertDescription>
        </Alert>
      )}

      {/* Record Sale Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Sale - {selectedItem?.blanket_name}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>Current Stock: <span className="font-bold">{selectedItem.quantity} units</span></p>
                <p>Selling Price: <span className="font-bold">${selectedItem.selling_price?.toFixed(2)}</span></p>
              </div>
              <div>
                <Label>Quantity Sold</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSellQuantity(Math.max(1, sellQuantity - 1))}
                    disabled={sellQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Math.min(selectedItem.quantity, parseInt(e.target.value) || 1))}
                    className="text-center"
                    min={1}
                    max={selectedItem.quantity}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSellQuantity(Math.min(selectedItem.quantity, sellQuantity + 1))}
                    disabled={sellQuantity >= selectedItem.quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Total Revenue: ${(sellQuantity * selectedItem.selling_price).toFixed(2)}
                </p>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => sellMutation.mutate({ blanketId: selectedItem.blanket_id, quantity: sellQuantity })}
                disabled={sellQuantity > selectedItem.quantity}
              >
                Confirm Sale
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};