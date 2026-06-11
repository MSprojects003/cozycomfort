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

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(5, 'Zip code is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser, loading } = useAuth();
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    const success = await registerUser({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
    });
    if (!success) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-blue-900" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Cozy Comfort today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input {...register('first_name')} />
                {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input {...register('last_name')} />
                {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <Label>Address</Label>
              <Input {...register('address')} />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label>City</Label>
                <Input {...register('city')} />
                {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
              </div>
              <div className="col-span-1">
                <Label>State</Label>
                <Input {...register('state')} />
                {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
              </div>
              <div className="col-span-1">
                <Label>Zip Code</Label>
                <Input {...register('zip_code')} />
                {errors.zip_code && <p className="text-sm text-red-500">{errors.zip_code.message}</p>}
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Register
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};