import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { authApi } from '../../src/api/auth.api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSendReset = async () => {
    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 py-8">
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center mb-6 py-1"
      >
        <ArrowLeft size={20} color="#0f172a" />
        <Text className="text-sm font-semibold text-slate-900 ml-1.5">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-8">
        <View className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center mb-3">
          <KeyRound size={26} color="#4f46e5" />
        </View>
        <Text className="text-2xl font-black text-slate-900 tracking-tight text-center">
          Reset Password
        </Text>
        <Text className="text-xs text-slate-500 text-center mt-1 px-4 leading-5">
          Enter your registered email address and we will send you a secure link to reset your password.
        </Text>
      </View>

      {error && (
        <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl mb-5">
          <Text className="text-xs text-rose-700 font-semibold">{error}</Text>
        </View>
      )}

      {sent ? (
        <View className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl items-center">
          <Text className="text-sm font-bold text-emerald-800 mb-1">
            Check Your Email
          </Text>
          <Text className="text-xs text-emerald-700 text-center leading-5 mb-5">
            We have sent password reset instructions to {email}.
          </Text>
          <Button
            title="Return to Login"
            onPress={() => router.replace('/(auth)/login')}
            size="sm"
          />
        </View>
      ) : (
        <View>
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
            leftIcon={<Mail size={18} color="#94a3b8" />}
          />

          <Button
            title="Send Reset Instructions"
            onPress={handleSendReset}
            loading={loading}
            size="lg"
          />
        </View>
      )}
    </ScreenWrapper>
  );
}
