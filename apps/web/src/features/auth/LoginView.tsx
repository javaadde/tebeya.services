import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ShieldCheck, Mail, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';

export function LoginView() {
  const { requestOtp, verifyOtp, demoLogin } = useAuth();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an authorized admin email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const message = await requestOtp(email);
      setSuccessMessage(message || `One-time password dispatched to ${email}`);
      setStep('otp');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send one-time password. Please verify the email is authorized.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit one-time password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyOtp(email, otp);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid or expired one-time password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const message = await requestOtp(email);
      setSuccessMessage(message || `A new code has been sent to ${email}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ede8e1] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          src="/logo.jpg"
          alt="Tebeya Services Logo"
          className="w-16 h-16 rounded-3xl object-cover border border-[#dad0c3] shadow-md mx-auto"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <h2 className="mt-4 text-2xl font-black text-stone-900 tracking-tight">
          Tebeya Services
        </h2>
        <p className="mt-1 text-sm text-stone-500 font-medium">
          Admin Operations Hub · Secure OTP Access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-stone-300/40 rounded-3xl sm:px-10 border border-[#dad0c3]/80">
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}

          {step === 'email' ? (
            <form className="space-y-5" onSubmit={handleSendOtp}>
              <div>
                <Input
                  label="Authorized Admin Email"
                  type="email"
                  required
                  placeholder="admin@tebeya.services"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  helperText="Only emails defined in the server's admin_web_controll_emails policy can log in."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 rounded-2xl"
                isLoading={isLoading}
                icon={Mail}
              >
                Send One-Time Password
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div className="p-3 bg-[#f7f4ef] rounded-2xl border border-[#dad0c3] text-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 block">Recipient:</span>
                  <span className="font-semibold text-stone-900 font-mono">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError(null);
                  }}
                  className="text-[#598A31] hover:underline font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change
                </button>
              </div>

              <div>
                <Input
                  label="Enter 6-Digit One-Time Password"
                  type="text"
                  required
                  placeholder="••••••"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  className="font-mono text-center tracking-[8px] text-lg font-bold"
                  helperText="Check your email inbox or server logs for the one-time code."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 rounded-2xl"
                isLoading={isLoading}
                icon={KeyRound}
              >
                Verify & Enter Portal
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#598A31] font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Didn't receive code? Resend
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-[#dad0c3]/60 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full py-2.5 text-xs font-bold border-[#dad0c3] text-stone-800 bg-[#f7f4ef] hover:bg-[#dad0c3]/40 rounded-2xl"
              onClick={() => demoLogin()}
            >
              ⚡ Explore Demo Admin Portal (Instant Access)
            </Button>

            <div className="flex items-start gap-2.5 text-xs text-stone-500 bg-[#faf8f5] p-3 rounded-2xl border border-[#dad0c3]/60">
              <ShieldCheck className="w-4 h-4 text-[#598A31] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-700">Access Control:</span> Only authorized admin emails are issued OTP passes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
