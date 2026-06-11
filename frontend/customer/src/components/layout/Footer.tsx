import React from 'react';
import { Package, Mail, Phone, MapPin, Globe, Share2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Cozy Comfort</span>
            </div>
            <p className="text-gray-400">Premium quality blankets for your comfort.</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/shop" className="hover:text-white">Shop</a></li>
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 234 567 890</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@cozycomfort.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 123 Comfort St, NY</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <Globe className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
              <Share2 className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
              <Heart className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Cozy Comfort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};