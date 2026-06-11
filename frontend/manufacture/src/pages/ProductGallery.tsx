import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid, List } from 'lucide-react';
import { manufacturerAPI } from '../services/api';
import { ProductCard } from '../components/products/Productcard';
import {type Blanket } from '../types';

export const ProductGallery: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['blankets'],
    queryFn: () => manufacturerAPI.getBlankets(),
  });

  const blankets: Blanket[] = data?.data?.blankets || [];
  
  const filteredBlankets = blankets.filter(blanket =>
    blanket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blanket.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Gallery</h1>
          <p className="text-gray-600 mt-1">View all your products in gallery mode</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
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
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBlankets.map((blanket) => (
            <ProductCard
              key={blanket.id}
              product={blanket}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlankets.map((blanket) => (
            <div key={blanket.id} className="flex gap-4 p-4 border rounded-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                {blanket.front_image && (
                  <img
                    src={`http://localhost:5000${blanket.front_image}`}
                    alt={blanket.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{blanket.name}</h3>
                <p className="text-sm text-gray-600">{blanket.material} - {blanket.size} - {blanket.color}</p>
                <p className="text-lg font-bold mt-1">${blanket.price}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  blanket.quantity < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {blanket.quantity} units
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};