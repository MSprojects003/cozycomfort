import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { distributorAPI } from '../service/api';
import { useState } from 'react';

export const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['available-blankets'],
    queryFn: () => distributorAPI.getAvailableBlankets(),
  });

  const products = data?.data?.available_blankets || [];
  
  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Products</h1>
        <p className="text-gray-600 mt-1">Browse products from manufacturer</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products by name or material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: any) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            {product.front_image && (
              <div className="h-48 overflow-hidden">
                <img
                  src={`http://localhost:5000${product.front_image}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Material:</span>
                  <span className="font-medium">{product.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{product.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{product.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-bold text-green-600">{product.quantity} units</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Price:</span>
                  <span className="text-blue-900">${product.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};