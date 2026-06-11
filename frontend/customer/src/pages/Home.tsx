import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, Truck, Shield, Clock } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Cozy Comfort Blankets</h1>
          <p className="text-xl mb-8">Premium quality blankets for ultimate comfort and warmth</p>
          <Button size="lg" onClick={() => navigate('/shop')} className="bg-white text-blue-900 hover:bg-gray-100">
            Shop Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 text-blue-900" />
              <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on all orders over $50</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-blue-900" />
              <h3 className="font-semibold text-lg mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">30-day money-back guarantee</p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-blue-900" />
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600">2-5 business days delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="text-center">
            <Button variant="outline" onClick={() => navigate('/shop')}>View All Products</Button>
          </div>
        </div>
      </section>
    </div>
  );
};