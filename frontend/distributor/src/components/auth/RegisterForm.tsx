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
import { Loader2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const registerSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
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
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    const success = await registerUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
    });
    if (!success) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-gray-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Register as Distributor
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join the Cozy Comfort distribution network
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                placeholder="Your Company Name"
                {...register('name')}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@yourcompany.com"
                {...register('email')}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Warehouse Street, City, Country"
                {...register('address')}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...register('password')}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
              className="w-full bg-blue-900 hover:bg-blue-800 text-white transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register as Distributor'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};