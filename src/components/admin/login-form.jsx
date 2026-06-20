'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { adminLogin } from '@/actions/auth';

export default function LoginForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      addToast({ title: 'Invalid Email', message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    if (formData.password.length < 6) {
      addToast({ title: 'Invalid Password', message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setLoading(true);

    const { success, error } = await adminLogin(formData.email, formData.password);

    if (success) {
      addToast({ title: 'Welcome back', message: 'Successfully logged in.', type: 'success' });
      router.push('/admin');
      router.refresh(); // Refresh to update middleware state
    } else {
      addToast({ title: 'Login Failed', message: error || 'Invalid credentials.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-brand-border relative overflow-hidden">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-yellow"></div>
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-brand-black mb-2">Admin Panel</h1>
        <p className="text-sm text-gray-500">Sign in to manage your store</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="admin@roadsride.in"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10"
          />
          <Mail size={18} className="absolute left-3 top-9 text-gray-400" />
        </div>

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="pl-10 pr-10"
          />
          <Lock size={18} className="absolute left-3 top-9 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
