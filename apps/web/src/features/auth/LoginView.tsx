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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-emerald-200">
          TS
        </div>
        <h2 className="mt-4 text-2xl font-black text-gray-900 tracking-tight">
          Tebeya Services
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-medium">
          Admin Portal · Secure OTP Access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
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
                  helperText="Only emails defined in the server's admin_web_controll_emails list can log in."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                isLoading={isLoading}
                icon={Mail}
              >
                Send One-Time Password
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block">Recipient:</span>
                  <span className="font-semibold text-gray-900 font-mono">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError(null);
                  }}
                  className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
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
                className="w-full py-2.5"
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
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-700 font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Didn't receive code? Resend
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full py-2 text-xs border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50"
              onClick={() => demoLogin()}
            >
              ⚡ Explore Demo Admin Portal (Instant Access)
            </Button>

            <div className="flex items-start gap-2.5 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-700">Access Control:</span> Only emails in the server's <code className="bg-gray-200 px-1 py-0.5 rounded text-[11px]">admin_web_controll_emails</code> policy are dispatched OTP credentials.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
