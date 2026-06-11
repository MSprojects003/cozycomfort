import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Eye, 
  Package, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw
} from 'lucide-react';
import { distributorAPI } from '../service/api';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const statusIcons: Record<string, any> = {
  Pending: Clock,
  Confirmed: CheckCircle,
  Shipped: Truck,
  Delivered: Package,
  Cancelled: XCircle
};

export const MyOrders: React.FC = () => {
  const { distributor } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  console.log('Distributor object:', distributor);
  console.log('Distributor ID:', distributor?.id);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['distributor-orders', distributor?.id, selectedStatus],
    queryFn: async () => {
      if (!distributor?.id) {
        throw new Error('No distributor ID available');
      }
      console.log(`Fetching orders for distributor ${distributor.id} with status: ${selectedStatus}`);
      const response = await distributorAPI.getOrders(
        distributor.id, 
        selectedStatus === 'all' ? undefined : selectedStatus
      );
      console.log('API Response:', response);
      return response;
    },
    enabled: !!distributor?.id,
    retry: 1,
  });

  const orders = data?.data?.orders || [];
  
  console.log('Orders received:', orders);
  console.log('Orders count:', orders.length);

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status];
    return Icon ? <Icon className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error fetching orders:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading requests: {error.message}</p>
        <p className="text-gray-500 mb-4">Make sure the backend server is running on port 5000</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests to Manufacturer</h1>
          <p className="text-gray-600 mt-1">Track your stock requests to the manufacturer</p>
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
                  <p className="text-gray-500">No requests found</p>
                  <p className="text-sm text-gray-400">Go to "Request Stock" to place a request</p>
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
                          <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-500">Request Number</p>
                            <p className="font-mono text-sm">{order.order_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Request Date</p>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.order_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Quantity Requested</p>
                            <p className="font-semibold">{order.quantity} units</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Unit Price</p>
                            <p>${order.unit_price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-bold text-green-600">${order.total_amount}</p>
                          </div>
                        </div>

                        {order.shipped_date && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm font-semibold text-blue-900">Shipping Information</p>
                            <p className="text-sm">Shipped on: {new Date(order.shipped_date).toLocaleDateString()}</p>
                            {order.delivered_date && (
                              <p className="text-sm">Delivered on: {new Date(order.delivered_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Request Details - {order.order_number}</DialogTitle>
                            </DialogHeader>
                            <RequestDetailsModal order={order} />
                          </DialogContent>
                        </Dialog>
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

// Request Details Modal Component
const RequestDetailsModal: React.FC<{ order: any }> = ({ order }) => {
  const statusSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-4">Request Progress</h4>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
            style={{ width: `${currentStep >= 0 ? (currentStep / (statusSteps.length - 1)) * 100 : 0}%` }}
          />
          <div className="relative flex justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step} className="text-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2
                  ${idx <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {idx < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : idx === currentStep ? (
                    <div className="animate-pulse">{idx + 1}</div>
                  ) : (
                    idx + 1
                  )}
                </div>
                <p className="text-sm font-medium">{step}</p>
                {idx === currentStep && order.status === step && (
                  <p className="text-xs text-green-600 mt-1">Current</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-500">Request Number</p>
          <p className="font-mono">{order.order_number}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Request Date</p>
          <p>{new Date(order.order_date).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Product</p>
          <p className="font-semibold">{order.blanket_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Quantity</p>
          <p>{order.quantity} units</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Unit Price</p>
          <p>${order.unit_price}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-bold text-green-600">${order.total_amount}</p>
        </div>
      </div>

      {order.notes && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="mt-1">{order.notes}</p>
        </div>
      )}

      {order.shipped_date && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">Shipping Information</p>
          <p>Shipped Date: {new Date(order.shipped_date).toLocaleString()}</p>
          {order.delivered_date && (
            <p>Delivered Date: {new Date(order.delivered_date).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
};