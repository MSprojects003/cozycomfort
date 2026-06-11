import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Package, Clock, Calendar, CheckCircle, XCircle, Truck, RefreshCw } from 'lucide-react';
import { sellerAPI } from '../services/api';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

export const MyOrders: React.FC = () => {
  const { seller } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['seller-orders', seller?.id, selectedStatus],
    queryFn: () => sellerAPI.getOrders(seller!.id, selectedStatus === 'all' ? undefined : selectedStatus),
    enabled: !!seller?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: (orderNumber: string) => sellerAPI.cancelOrder(orderNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      toast.success('Order cancelled successfully');
    },
  });

  const orders = data?.data?.orders || [];

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
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="Shipped">Shipped</TabsTrigger>
          <TabsTrigger value="Delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No orders found</p>
                  <p className="text-sm text-gray-400">Go to "Place Order" to place your first order</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order: any) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{order.blanket_name}</h3>
                          <Badge className={statusColors[order.status]}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-500">Order Number</p>
                            <p className="font-mono text-sm">{order.order_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Order Date</p>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.order_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-semibold">{order.quantity} units</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Unit Price</p>
                            <p>${order.unit_price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Cost</p>
                            <p className="font-bold text-green-600">${order.total_cost}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Distributor</p>
                            <p>{order.distributor_name || `ID: ${order.distributor_id}`}</p>
                          </div>
                        </div>

                        {order.expected_delivery && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm font-semibold text-blue-900">Expected Delivery</p>
                            <p className="text-sm">{new Date(order.expected_delivery).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                            </DialogHeader>
                            <OrderDetailsModal order={order} />
                          </DialogContent>
                        </Dialog>

                        {order.status === 'Pending' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Cancel this order?')) {
                                cancelMutation.mutate(order.order_number);
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OrderDetailsModal: React.FC<{ order: any }> = ({ order }) => {
  const statusSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-4">Order Progress</h4>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
          <div className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
          <div className="relative flex justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step} className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2
                  ${idx <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {idx < currentStep ? <CheckCircle className="h-5 w-5" /> :
                   idx === currentStep ? <div className="animate-pulse">{idx + 1}</div> : idx + 1}
                </div>
                <p className="text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div><p className="text-sm text-gray-500">Order Number</p><p className="font-mono">{order.order_number}</p></div>
        <div><p className="text-sm text-gray-500">Order Date</p><p>{new Date(order.order_date).toLocaleString()}</p></div>
        <div><p className="text-sm text-gray-500">Product</p><p className="font-semibold">{order.blanket_name}</p></div>
        <div><p className="text-sm text-gray-500">Quantity</p><p>{order.quantity} units</p></div>
        <div><p className="text-sm text-gray-500">Unit Price</p><p>${order.unit_price}</p></div>
        <div><p className="text-sm text-gray-500">Total Cost</p><p className="font-bold text-green-600">${order.total_cost}</p></div>
        <div><p className="text-sm text-gray-500">Payment Status</p><Badge>{order.payment_status}</Badge></div>
      </div>
      {order.notes && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">Notes</p>
          <p>{order.notes}</p>
        </div>
      )}
    </div>
  );
};