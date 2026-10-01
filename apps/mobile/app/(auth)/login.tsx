import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { authApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.login(email.trim().toLowerCase(), password);
      await setSession(res.user, res.tokens);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable className="px-6 py-10 justify-between">
      <View>
        {/* Brand Header */}
        <View className="items-center mb-8 pt-4">
          <View className="w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center mb-4 shadow-md">
            <LogIn size={32} color="#ffffff" />
          </View>
          <Text className="text-2xl font-black text-slate-900 tracking-tight">
            Staff Portal
          </Text>
          <Text className="text-sm text-slate-500 mt-1">
            Sign in to view and book catering shifts
          </Text>
        </View>

        {/* Global Error Banner */}
        {error && (
          <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl mb-5">
            <Text className="text-xs text-rose-700 font-semibold">{error}</Text>
          </View>
        )}

        {/* Form Fields */}
        <Input
          label="Email Address"
          placeholder="staff@tebeya.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<Mail size={18} color="#94a3b8" />}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          secureTextEntry
          leftIcon={<Lock size={18} color="#94a3b8" />}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          className="self-end -mt-1 mb-6"
        >
          <Text className="text-xs font-semibold text-indigo-600">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          size="lg"
        />
      </View>

      {/* Footer Navigation */}
      <View className="items-center pt-8 border-t border-slate-200/60 mt-10">
        <Text className="text-xs text-slate-500 text-center mb-2">
          New to Tebeya Services? Sign up requires an invite code.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          className="py-2 px-4"
        >
          <Text className="text-sm font-bold text-indigo-600">
            Enter Invite Code & Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
