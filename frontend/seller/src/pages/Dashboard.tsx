import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { sellerAPI } from '../services/api';
import { Badge } from '@/components/ui/badge';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const { seller } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['seller-dashboard', seller?.id],
    queryFn: () => sellerAPI.getDashboard(seller!.id),
    enabled: !!seller?.id,
  });

  const summary = data?.data?.summary;
  const recentOrders = data?.data?.recent_orders || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {seller?.business_name}!</h1>
        <p className="text-gray-600 mt-1">Here's your store overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Orders" value={summary?.total_orders_placed || 0} icon={ShoppingCart} color="text-blue-600" />
        <StatCard title="Pending Orders" value={summary?.pending_orders || 0} icon={Clock} color="text-yellow-600" />
        <StatCard title="Items in Stock" value={summary?.total_items_in_stock || 0} icon={Package} color="text-green-600" />
        <StatCard title="Total Spent" value={`$${(summary?.total_amount_spent || 0).toLocaleString()}`} icon={DollarSign} color="text-purple-600" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
                <span className="font-semibold">{summary?.pending_orders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-blue-100">Accepted</Badge>
                <span className="font-semibold">{summary?.accepted_orders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-green-100">Fulfilled</Badge>
                <span className="font-semibold">{summary?.fulfilled_orders || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{order.blanket_name}</p>
                    <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${order.total_cost}</p>
                    <Badge variant="outline" className="text-xs">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};