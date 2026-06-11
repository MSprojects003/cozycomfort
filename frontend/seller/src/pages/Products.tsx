import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Eye } from 'lucide-react';
import { sellerAPI } from '../services/api';
import {type Blanket } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Products: React.FC = () => {
  const { seller } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Blanket | null>(null);
  const [filters, setFilters] = useState({
    material: '',
    size: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['available-products'],
    queryFn: () => sellerAPI.getAvailableBlankets(),
  });

  const products = data?.data?.available_blankets || [];

  const filteredProducts = products.filter((product: Blanket) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaterial = !filters.material || product.material === filters.material;
    const matchesSize = !filters.size || product.size === filters.size;
    const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);
    return matchesSearch && matchesMaterial && matchesSize && matchesMinPrice && matchesMaxPrice;
  });

  const uniqueMaterials = [...new Set(products.map((p: Blanket) => p.material))];
  const uniqueSizes = [...new Set(products.map((p: Blanket) => p.size))];

  const clearFilters = () => {
    setFilters({ material: '', size: '', minPrice: '', maxPrice: '' });
    setSearchTerm('');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Products</h1>
        <p className="text-gray-600 mt-1">Browse products from manufacturers</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products by name or material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Panel */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {(filters.material || filters.size || filters.minPrice || filters.maxPrice || searchTerm) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Material</label>
              <select
                className="w-full border rounded-md p-2 mt-1"
                value={filters.material}
                onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              >
                <option value="">All</option>
                {uniqueMaterials.map((m: string) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Size</label>
              <select
                className="w-full border rounded-md p-2 mt-1"
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              >
                <option value="">All</option>
                {uniqueSizes.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Min Price</label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Price</label>
              <Input
                type="number"
                placeholder="$1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Products Grid - NO ADD TO CART, only view details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: Blanket) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            {product.front_image && (
              <div className="h-48 overflow-hidden">
                <img
                  src={`http://localhost:5000${product.front_image}`}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
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
                  <span className="text-gray-600">Manufacturer Stock:</span>
                  <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                    {product.quantity} units
                  </Badge>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>Price:</span>
                  <span className="text-green-900">${product.price}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {selectedProduct.front_image && (
                  <img
                    src={`http://localhost:5000${selectedProduct.front_image}`}
                    alt={selectedProduct.name}
                    className="rounded-lg object-cover w-full"
                  />
                )}
                <div className="space-y-3">
                  <div><span className="font-semibold">Material:</span> {selectedProduct.material}</div>
                  <div><span className="font-semibold">Size:</span> {selectedProduct.size}</div>
                  <div><span className="font-semibold">Color:</span> {selectedProduct.color}</div>
                  <div><span className="font-semibold">Price:</span> ${selectedProduct.price}</div>
                  <div><span className="font-semibold">Manufacturer Stock:</span> {selectedProduct.quantity} units</div>
                  {selectedProduct.back_image && (
                    <div className="mt-2">
                      <p className="font-semibold">Back View:</p>
                      <img
                        src={`http://localhost:5000${selectedProduct.back_image}`}
                        alt={`${selectedProduct.name} back`}
                        className="rounded-lg object-cover w-full mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};