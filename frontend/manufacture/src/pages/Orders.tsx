import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  Clock, 
  AlertCircle,
  Eye,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { manufacturerAPI } from '../services/api';
import { toast } from 'sonner';
import { type DistributorOrder } from '../types';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const statusSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export const Orders: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<DistributorOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['distributor-orders'],
    queryFn: () => manufacturerAPI.getDistributorOrders(),
  });

  const { data: stats } = useQuery({
    queryKey: ['order-stats'],
    queryFn: () => manufacturerAPI.getOrderStats(),
  });

  const acceptMutation = useMutation({
    mutationFn: (orderNumber: string) => manufacturerAPI.acceptOrder(orderNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast.success('Order accepted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to accept order: ${error.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ orderNumber, reason }: { orderNumber: string; reason: string }) => 
      manufacturerAPI.rejectOrder(orderNumber, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      setIsRejectDialogOpen(false);
      setRejectReason('');
      toast.success('Order rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject order: ${error.message}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderNumber, status }: { orderNumber: string; status: string }) =>
      manufacturerAPI.updateOrderStatus(orderNumber, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast.success('Order status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const orders = data?.data?.orders || [];
  const orderStats = stats?.data;

  const getStatusStep = (status: string) => {
    return statusSteps.indexOf(status);
  };

  const canUpdateStatus = (currentStatus: string) => {
    return currentStatus !== 'Delivered' && currentStatus !== 'Cancelled';
  };

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusSteps.indexOf(currentStatus);
    if (currentIndex < statusSteps.length - 1) {
      return statusSteps[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Manage distributor orders and track fulfillment</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats?.total_orders || 0}</div>
            <p className="text-xs text-gray-500">All time orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats?.pending_orders || 0}</div>
            <p className="text-xs text-gray-500">Awaiting confirmation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Production</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats?.processing_orders || 0}</div>
            <p className="text-xs text-gray-500">Being processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(orderStats?.total_revenue || 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500">From completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distributor Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order:any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                      <TableCell>{order.blanket_name}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${order.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Product</Label>
                                    <p className="text-lg font-semibold">{order.blanket_name}</p>
                                  </div>
                                  <div>
                                    <Label>Quantity</Label>
                                    <p className="text-lg font-semibold">{order.quantity} units</p>
                                  </div>
                                  <div>
                                    <Label>Unit Price</Label>
                                    <p className="text-lg font-semibold">${order.unit_price}</p>
                                  </div>
                                  <div>
                                    <Label>Total Amount</Label>
                                    <p className="text-lg font-semibold text-green-600">${order.total_amount}</p>
                                  </div>
                                  <div>
                                    <Label>Order Date</Label>
                                    <p>{new Date(order.order_date).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <Label>Current Status</Label>
                                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                                      {order.status}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {order.notes && (
                                  <div>
                                    <Label>Notes</Label>
                                    <p className="text-gray-600">{order.notes}</p>
                                  </div>
                                )}

                                {/* Status Timeline */}
                                <div className="mt-6">
                                  <Label>Order Progress</Label>
                                  <div className="flex items-center justify-between mt-2">
                                    {statusSteps.map((step, idx) => (
                                      <div key={step} className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          getStatusStep(order.status) >= idx 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-300 text-gray-600'
                                        }`}>
                                          {getStatusStep(order.status) > idx ? (
                                            <CheckCircle className="h-5 w-5" />
                                          ) : (
                                            <span className="text-sm">{idx + 1}</span>
                                          )}
                                        </div>
                                        <span className="text-xs mt-1">{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Status Update Buttons */}
                                {canUpdateStatus(order.status) && (
                                  <div className="flex gap-2 mt-4">
                                    <Button
                                      onClick={() => {
                                        const nextStatus = getNextStatus(order.status);
                                        if (nextStatus && confirm(`Move order to ${nextStatus}?`)) {
                                          updateStatusMutation.mutate({ 
                                            orderNumber: order.order_number, 
                                            status: nextStatus 
                                          });
                                        }
                                      }}
                                    >
                                      Move to {getNextStatus(order.status)}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {order.status === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => acceptMutation.mutate(order.order_number)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Order Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for rejection</Label>
              <Textarea
                placeholder="Please provide a reason for rejecting this order..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedOrder) {
                    rejectMutation.mutate({ 
                      orderNumber: selectedOrder.order_number, 
                      reason: rejectReason 
                    });
                  }
                }}
              >
                Confirm Rejection
              </Button>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};