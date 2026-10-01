import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ShieldCheck, Lock } from 'lucide-react';

export function LoginView() {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid credentials. Please verify your login details.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-emerald-200">
          TS
        </div>
        <h2 className="mt-4 text-2xl font-black text-gray-900 tracking-tight">
          Tebeya Services
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-medium">
          Catering Staff Operations & Administration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}

            <div>
              <Input
                label="Admin Email"
                type="email"
                required
                placeholder="admin@tebeya.services"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              isLoading={isLoading}
              icon={Lock}
            >
              Sign In to Admin Hub
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full py-2 text-xs border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50"
              onClick={() => demoLogin()}
            >
              ⚡ Explore Demo Admin Portal (Instant Access)
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-2.5 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-700">Restricted Access:</span> This portal is reserved for event dispatchers and administrators. Staff must sign up via the Tebeya mobile app using an admin-issued invite code.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
