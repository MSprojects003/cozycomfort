import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type RegisterData } from '../../types';

const registerSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  owner_name: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  store_type: z.enum(['physical', 'online', 'both']),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerUser, loading } = useAuth();
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      store_type: 'physical',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    const registerData: RegisterData = {
      business_name: data.business_name,
      owner_name: data.owner_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      store_type: data.store_type,
      website: data.website || '',
    };
    const success = await registerUser(registerData);
    if (!success) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-gray-200 max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-green-900 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Register as Seller
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join the Cozy Comfort seller network
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                placeholder="Your Store Name"
                {...register('business_name')}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.business_name && (
                <p className="text-sm text-red-500">{errors.business_name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                placeholder="Full Name"
                {...register('owner_name')}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.owner_name && (
                <p className="text-sm text-red-500">{errors.owner_name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@yourstore.com"
                {...register('email')}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 8900"
                {...register('phone')}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Business Street, City"
                {...register('address')}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store_type">Store Type</Label>
              <select
                id="store_type"
                {...register('store_type')}
                className="w-full border rounded-md p-2"
              >
                <option value="physical">Physical Store</option>
                <option value="online">Online Store</option>
                <option value="both">Both</option>
              </select>
              {errors.store_type && (
                <p className="text-sm text-red-500">{errors.store_type.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                placeholder="https://yourstore.com"
                {...register('website')}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...register('password')}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                {...register('confirmPassword')}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-green-900 hover:bg-green-800 text-white transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register as Seller'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};