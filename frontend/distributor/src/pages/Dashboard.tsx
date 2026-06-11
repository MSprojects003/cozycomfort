import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { distributorAPI } from '../service/api';
import { useAuth } from '../context/AuthContext';
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
  const { distributor } = useAuth();
  
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['distributor-summary', distributor?.id],
    queryFn: () => distributorAPI.getSummary(distributor!.id),
    enabled: !!distributor?.id,
  });

  const summary = summaryData?.data?.summary;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  // Get pending and confirmed counts safely
  const pendingCount = summary?.status_breakdown?.Pending || 0;
  const confirmedCount = summary?.status_breakdown?.Confirmed || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {distributor?.name}!</h1>
        <p className="text-gray-600 mt-1">Here's your distribution overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={summary?.total_orders || 0}
          icon={ShoppingCart}
          color="text-blue-600"
        />
        <StatCard
          title="Items Ordered"
          value={summary?.total_items_ordered || 0}
          icon={Package}
          color="text-green-600"
        />
        <StatCard
          title="Total Spent"
          value={`$${(summary?.total_amount_spent || 0).toLocaleString()}`}
          icon={DollarSign}
          color="text-purple-600"
        />
        <StatCard
          title="Active Orders"
          value={pendingCount + confirmedCount}
          icon={TrendingUp}
          color="text-orange-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.status_breakdown && Object.entries(summary.status_breakdown).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <Badge variant="outline">{status}</Badge>
                  <span className="font-semibold">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summaryData?.data?.recent_orders?.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{order.blanket_name}</p>
                    <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${order.total_amount}</p>
                    <Badge variant="outline" className="text-xs">
                      {order.status}
                    </Badge>
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