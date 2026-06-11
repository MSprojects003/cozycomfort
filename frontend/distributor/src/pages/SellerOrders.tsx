import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { distributorAPI } from '../service/api';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Fulfilled: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

export const SellerOrders: React.FC = () => {
  const { distributor } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const queryClient = useQueryClient();

  // Get pending seller orders (broadcasted to all distributors)
  const { data: pendingData, isLoading: pendingLoading, refetch } = useQuery({
    queryKey: ['pending-orders', distributor?.id],
    queryFn: () => distributorAPI.getPendingSellerOrders(distributor!.id),
    enabled: !!distributor?.id,
    refetchInterval: 5000, // Auto refresh every 5 seconds
  });

  // Get accepted orders
  const { data: acceptedData, isLoading: acceptedLoading } = useQuery({
    queryKey: ['my-accepted-orders', distributor?.id],
    queryFn: () => distributorAPI.getMyAcceptedOrders(distributor!.id),
    enabled: !!distributor?.id,
  });

  const acceptMutation = useMutation({
    mutationFn: ({ orderNumber }: { orderNumber: string }) =>
      distributorAPI.acceptSellerOrder(orderNumber, distributor!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-accepted-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Order accepted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to accept order');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderNumber, status }: { orderNumber: string; status: string }) =>
      distributorAPI.fulfillOrder(orderNumber, distributor!.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-accepted-orders'] });
      toast.success('Order status updated');
    },
  });

  const pendingOrders = pendingData?.data?.orders || [];
  const acceptedOrders = acceptedData?.data?.orders || [];

  if (pendingLoading || acceptedLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Orders</h1>
          <p className="text-gray-600 mt-1">Manage orders from sellers</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Pending Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Orders (Broadcasted to All Distributors)</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pending orders</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Your Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((item: any) => {
                  const order = item.order;
                  const canFulfill = item.can_fulfill;
                  const availableQty = item.available_quantity;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                      <TableCell>{order.blanket_name}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${order.total_amount}</TableCell>
                      <TableCell>
                        <span className={availableQty < order.quantity ? 'text-red-600 font-bold' : 'text-green-600'}>
                          {availableQty} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => acceptMutation.mutate({ orderNumber: order.order_number })}
                            disabled={!canFulfill || acceptMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Accepted Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Accepted Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {acceptedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No accepted orders</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acceptedOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                    <TableCell>{order.blanket_name}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>${order.total_amount}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === 'Accepted' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ 
                              orderNumber: order.order_number, 
                              status: 'Shipped' 
                            })}
                          >
                            Ship
                          </Button>
                        )}
                        {order.status === 'Shipped' && (
                          <Button
                            size="sm"
                            className="bg-green-600"
                            onClick={() => updateStatusMutation.mutate({ 
                              orderNumber: order.order_number, 
                              status: 'Delivered' 
                            })}
                          >
                            Deliver
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Product</p><p className="font-semibold">{selectedOrder.blanket_name}</p></div>
                <div><p className="text-sm text-gray-500">Quantity</p><p>{selectedOrder.quantity} units</p></div>
                <div><p className="text-sm text-gray-500">Unit Price</p><p>${selectedOrder.unit_price}</p></div>
                <div><p className="text-sm text-gray-500">Total Amount</p><p className="font-bold text-green-600">${selectedOrder.total_amount}</p></div>
                <div><p className="text-sm text-gray-500">Order Date</p><p>{new Date(selectedOrder.order_date).toLocaleString()}</p></div>
                <div><p className="text-sm text-gray-500">Status</p><Badge>{selectedOrder.status}</Badge></div>
              </div>
              {selectedOrder.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
              {selectedOrder.accepted_date && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Accepted Date</p>
                  <p>{new Date(selectedOrder.accepted_date).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};