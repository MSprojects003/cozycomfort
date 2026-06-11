import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {type Blanket } from '../../types';

interface ProductCardProps {
  product: Blanket;
  onEdit: (product: Blanket) => void;
  onDelete: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `http://localhost:5000${path}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100">
        {getImageUrl(product.front_image) ? (
          <img
            src={getImageUrl(product.front_image)!}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-sm">No image</div>
            </div>
          </div>
        )}
        
        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.quantity < 20 
              ? 'bg-red-500 text-white' 
              : product.quantity < 50 
              ? 'bg-yellow-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {product.quantity} in stock
          </span>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Material:</span>
            <span className="font-medium">{product.material}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">{product.size}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Color:</span>
            <span className="font-medium">{product.color}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2">
            <span>Price:</span>
            <span className="text-gray-900">${product.price}</span>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEdit(product)}
            >
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1"
              onClick={() => onDelete(product.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};