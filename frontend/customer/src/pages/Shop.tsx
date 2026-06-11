import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Heart, Star } from 'lucide-react';
import { customerAPI } from '../services/api';
import { toast } from 'sonner';

export const Shop: React.FC = () => {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customer-products', searchTerm],
    queryFn: () => customerAPI.getProducts({ search: searchTerm || undefined }),
  });

  const products = data?.data?.products || [];

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    toast.success(`Added ${product.name} to cart`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="relative h-64 overflow-hidden">
                {product.front_image ? (
                  <img
                    src={`http://localhost:5000${product.front_image}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                {!product.in_stock && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Material:</span>
                    <span>{product.material}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span>{product.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Color:</span>
                    <span>{product.color}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-2xl font-bold text-blue-900">${product.price}</span>
                    <Button 
                      onClick={() => handleAddToCart(product)} 
                      size="sm"
                      disabled={!product.in_stock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};