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
import { Loader2, Truck, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'distributor@cozy.com',
      password: 'distributor123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    const success = await login(data.email, data.password);  // FIXED: Pass email and password separately
    if (!success) {
      setError('Invalid email or password');
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
            Distributor Portal
          </CardTitle>
          <CardDescription className="text-gray-600">
            Cozy Comfort Distribution System
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="distributor@cozy.com"
                {...register('email')}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
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
                  Logging in...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 pt-6">
          <div className="flex gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Real-time Updates</span>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
          <p className="text-xs text-center text-gray-400">
            Demo Credentials: distributor@cozy.com / distributor123
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};