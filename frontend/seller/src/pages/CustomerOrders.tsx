import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Package, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { sellerAPI } from '../services/api';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const statusSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

interface CustomerOrder {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  order_date: string;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  notes: string;
  can_accept?: boolean;
}

export const CustomerOrders: React.FC = () => {
  const { seller } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customer-orders', selectedStatus],
    queryFn: () => sellerAPI.getCustomerOrders(selectedStatus === 'all' ? undefined : selectedStatus),
  });

  const acceptMutation = useMutation({
    mutationFn: ({ orderNumber }: { orderNumber: string }) =>
      sellerAPI.acceptCustomerOrder(orderNumber, seller!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      toast.success('Order accepted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to accept order');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderNumber, status }: { orderNumber: string; status: string }) =>
      sellerAPI.updateCustomerOrderStatus(orderNumber, seller!.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update order status');
    },
  });

  const orders = data?.data?.orders || [];
  const stats = data?.data?.stats || { total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };

  const getStatusStep = (status: string) => {
    return statusSteps.indexOf(status);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Customer Orders</h1>
          <p className="text-gray-600 mt-1">Browse and accept customer orders (First come first serve)</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.shipped || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="Pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="Confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
          <TabsTrigger value="Shipped">Shipped ({stats.shipped})</TabsTrigger>
          <TabsTrigger value="Delivered">Delivered ({stats.delivered})</TabsTrigger>
          <TabsTrigger value="Cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No customer orders found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: CustomerOrder) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                          <TableCell>{order.customer_name || `Customer #${order.customer_id}`}</TableCell>
                          <TableCell>{order.blanket_name}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status === 'Pending' && order.can_accept !== false && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    if (confirm('Accept this order?')) {
                                      acceptMutation.mutate({ orderNumber: order.order_number });
                                    }
                                  }}
                                  disabled={acceptMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                              )}
                              {order.status === 'Confirmed' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Mark as shipped?')) {
                                      updateStatusMutation.mutate({ 
                                        orderNumber: order.order_number, 
                                        status: 'Shipped' 
                                      });
                                    }
                                  }}
                                >
                                  <Truck className="h-4 w-4" />
                                </Button>
                              )}
                              {order.status === 'Shipped' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    if (confirm('Mark as delivered?')) {
                                      updateStatusMutation.mutate({ 
                                        orderNumber: order.order_number, 
                                        status: 'Delivered' 
                                      });
                                    }
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
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
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status Timeline */}
              <div>
                <h4 className="font-semibold mb-4">Order Progress</h4>
                <div className="relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
                  <div 
                    className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
                    style={{ width: `${(getStatusStep(selectedOrder.status) / (statusSteps.length - 1)) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, idx) => (
                      <div key={step} className="text-center">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2
                          ${idx <= getStatusStep(selectedOrder.status) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                        `}>
                          {idx < getStatusStep(selectedOrder.status) ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : idx === getStatusStep(selectedOrder.status) ? (
                            <div className="animate-pulse">{idx + 1}</div>
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <p className="text-sm font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-semibold">{selectedOrder.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Email</p>
                  <p>{selectedOrder.customer_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Phone</p>
                  <p>{selectedOrder.customer_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p>{selectedOrder.shipping_address}</p>
                </div>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-mono">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p>{new Date(selectedOrder.order_date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-semibold">{selectedOrder.blanket_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p>{selectedOrder.quantity} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p>${selectedOrder.unit_price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-green-600">${selectedOrder.total_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p>{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <Badge variant="outline">{selectedOrder.payment_status}</Badge>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Order Notes</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};