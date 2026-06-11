import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, TrendingDown, AlertCircle, Clock } from 'lucide-react';
import { manufacturerAPI } from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import {type  Blanket } from '../types';

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['blankets'],
    queryFn: () => manufacturerAPI.getBlankets(),
  });

  const { data: orderStats } = useQuery({
    queryKey: ['order-stats'],
    queryFn: () => manufacturerAPI.getOrderStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  const blankets: Blanket[] = data?.data?.blankets || [];
  
  const totalProducts = blankets.length;
  const totalStock = blankets.reduce((sum, b) => sum + b.quantity, 0);
  const totalValue = blankets.reduce((sum, b) => sum + (b.price * b.quantity), 0);
  const lowStockItems = blankets.filter(b => b.quantity < 20).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back to your manufacturing dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          trend={12}
          color="text-blue-600"
        />
        <StatCard
          title="Total Stock"
          value={totalStock.toLocaleString()}
          icon={TrendingUp}
          trend={8}
          color="text-green-600"
        />
        <StatCard
          title="Inventory Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={TrendingDown}
          trend={-3}
          color="text-purple-600"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={AlertCircle}
          color="text-red-600"
        />
        <StatCard
          title="Pending Orders"
          value={orderStats?.data?.pending_orders || 0}
          icon={Clock}
          color="text-yellow-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blankets.slice(0, 5).map((blanket) => (
                <div key={blanket.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-900">{blanket.name}</p>
                    <p className="text-sm text-gray-500">{blanket.material} - {blanket.size}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${blanket.price}</p>
                    <p className="text-sm text-gray-500">Stock: {blanket.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Production Capacity</span>
                  <span className="text-sm font-medium text-gray-900">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-900 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Quality Rate</span>
                  <span className="text-sm font-medium text-gray-900">98.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Order Fulfillment</span>
                  <span className="text-sm font-medium text-gray-900">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blankets.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">{order.name}</p>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${order.price}</p>
                  <Badge className="bg-blue-100 text-blue-800">
                    In Stock
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};