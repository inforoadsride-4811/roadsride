'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, CheckCircle, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { requestPasswordReset, completePasswordReset } from '@/actions/customer-auth';
import { passwordResetRequestSchema, passwordResetSchema, validateForm } from '@/lib/validations';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { addToast } = useToast();

  // Step: 'email' | 'otp' | 'success'
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm(passwordResetRequestSchema, { email });
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    await requestPasswordReset(email);
    // Always show success (don't reveal if email exists)
    setStep('otp');
    setResendCooldown(30);
    addToast({ title: 'Code sent!', message: 'If an account exists, you will receive an OTP.', type: 'success' });
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm(passwordResetSchema, { email, otp: otpValue, newPassword });
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await completePasswordReset({ email, otp: otpValue, newPassword });

    if (result.success) {
      setStep('success');
      addToast({ title: 'Password reset!', message: 'You can now sign in with your new password.', type: 'success' });
      setTimeout(() => router.push('/account/login'), 3000);
    } else if (result.errors) {
      setErrors(result.errors);
    } else {
      addToast({ title: 'Failed', message: result.error, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-brand-black">
          {step === 'email' && 'Reset your password'}
          {step === 'otp' && 'Enter verification code'}
          {step === 'success' && 'Password updated!'}
        </h2>
        {step === 'email' && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email and we&apos;ll send you a code to reset your password.
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-brand-border sm:rounded-xl sm:px-10">

          {step === 'email' && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <Link href="/account/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-black transition-colors">
                <ArrowLeft size={14} /> Back to login
              </Link>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-brand-yellow" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  placeholder="you@example.com"
                  className={errors.email ? 'border-red-400' : ''}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover rounded-xl font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form className="space-y-6" onSubmit={handleResetSubmit}>
              <button type="button" onClick={() => setStep('email')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-black transition-colors">
                <ArrowLeft size={14} /> Back
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} className="text-brand-yellow" />
                </div>
                <p className="text-sm text-gray-600">Enter the code sent to <strong>{email}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Verification code</label>
                <Input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, '')); setErrors({}); }}
                  placeholder="000000"
                  className={`text-center text-2xl tracking-[0.5em] font-bold h-14 ${errors.otp ? 'border-red-400' : ''}`}
                  autoFocus
                />
                {errors.otp && <p className="text-xs text-red-500 mt-1 text-center">{errors.otp}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors({}); }}
                  placeholder="Minimum 6 characters"
                  className={errors.newPassword ? 'border-red-400' : ''}
                />
                {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading || otpValue.length !== 6}
                className="w-full h-11 text-base bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover rounded-xl font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={async () => {
                      if (resendCooldown > 0) return;
                      await requestPasswordReset(email);
                      setResendCooldown(30);
                      addToast({ title: 'New code sent!', type: 'success' });
                    }}
                    disabled={resendCooldown > 0}
                    className={`font-medium ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-brand-yellow-hover hover:text-brand-yellow cursor-pointer'}`}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-2">Password Updated!</h3>
              <p className="text-gray-600 mb-4">Redirecting you to sign in...</p>
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-yellow" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
