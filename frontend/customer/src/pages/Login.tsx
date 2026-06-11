import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'customer@example.com',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    const success = await login(data.email);
    if (!success) {
      setError('Customer not found. Please register first.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-blue-900" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Login to your Cozy Comfort account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="customer@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};