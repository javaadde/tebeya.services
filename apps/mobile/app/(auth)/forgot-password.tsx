import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ChevronLeft, KeyRound } from 'lucide-react-native';
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
    <ScreenWrapper className="px-5 py-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between pt-2 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color="#201d1e" />
        </TouchableOpacity>

        <Text className="text-base font-black text-neutral-900 tracking-tight">
          Reset Password
        </Text>

        <View className="w-12" />
      </View>

      <View className="bg-white rounded-[28px] p-6 shadow-sm border border-white/50 mb-4">
        <View className="items-center mb-6">
          <View className="w-14 h-14 rounded-2xl bg-[#fdece8] items-center justify-center mb-3">
            <KeyRound size={26} color="#df3b20" />
          </View>
          <Text className="text-lg font-black text-neutral-900 text-center">
            Password Recovery
          </Text>
          <Text className="text-xs text-neutral-500 text-center mt-1 leading-5">
            Enter your email to receive recovery instructions.
          </Text>
        </View>

        {error && (
          <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl mb-4">
            <Text className="text-xs text-rose-700 font-semibold">{error}</Text>
          </View>
        )}

        {sent ? (
          <View className="bg-[#fdece8] p-5 rounded-2xl items-center">
            <Text className="text-sm font-bold text-[#df3b20] mb-1">
              Instructions Sent
            </Text>
            <Text className="text-xs text-neutral-700 text-center leading-5 mb-4">
              We have dispatched recovery details to {email}.
            </Text>
            <Button
              title="Return to Sign In"
              onPress={() => router.replace('/(auth)/login')}
              variant="primary"
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
              variant="primary"
              size="lg"
            />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
