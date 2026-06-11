import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { customerAPI } from '../services/api';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  Pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  Confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  Shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  Delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  Cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Clock },
};

export const Orders: React.FC = () => {
  const { customer } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['customer-orders', customer?.id],
    queryFn: () => customerAPI.getOrders(customer!.id),
    enabled: !!customer?.id,
  });

  const orders = data?.data?.orders || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">No orders yet</p>
            <p className="text-sm text-gray-400">Start shopping to place your first order</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const StatusIcon = statusConfig[order.status]?.icon || Package;
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{order.product_name}</h3>
                        <Badge className={statusConfig[order.status]?.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Order Number</p>
                          <p className="font-mono">{order.order_number}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p>{order.quantity} units</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Amount</p>
                          <p className="font-bold text-green-600">${order.total_amount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Order Date</p>
                          <p>{new Date(order.order_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};