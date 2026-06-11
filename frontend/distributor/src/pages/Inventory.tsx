import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { distributorAPI } from '../service/api';

export const Inventory: React.FC = () => {
  const { distributor } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['distributor-inventory', distributor?.id],
    queryFn: () => distributorAPI.getInventory(distributor!.id),
    enabled: !!distributor?.id,
  });

  const inventory = data?.data?.inventory || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  const totalItems = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const lowStockItems = inventory.filter((item: any) => (item.quantity || 0) < (item.reorder_level || 20));
  const totalValue = inventory.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.unit_price || 50)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track your stock levels and manage inventory</p>
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
            <CardTitle className="text-sm font-medium">Total Units in Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
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
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item: any) => (
                <TableRow key={item.blanket_id}>
                  <TableCell className="font-medium">{item.blanket_name}</TableCell>
                  <TableCell className="font-bold">{item.quantity || 0} units</TableCell>
                  <TableCell>{item.reorder_level || 20} units</TableCell>
                  <TableCell>
                    {(item.quantity || 0) < (item.reorder_level || 20) ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock - Order More
                      </Badge>
                    ) : (item.quantity || 0) < ((item.reorder_level || 20) * 2) ? (
                      <Badge className="bg-yellow-600 text-white">
                        Moderate Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-green-600 text-white">
                        Well Stocked
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.last_updated ? new Date(item.last_updated).toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};