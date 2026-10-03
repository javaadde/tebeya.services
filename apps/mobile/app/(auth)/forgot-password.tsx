import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ChevronLeft, KeyRound, CheckCircle2 } from 'lucide-react-native';
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
    <ScreenWrapper
      scrollable
      backgroundColor="bg-white"
      className="px-6 py-4 justify-between"
    >
      <View className="flex-1 justify-between">
        <View className="pt-2">
          {/* Top Navigation */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={22} color="#1a1a1a" />
            </TouchableOpacity>
            <Text className="text-base font-black text-neutral-900 tracking-tight">Reset Password</Text>
            <View className="w-10" />
          </View>

          {/* Heading */}
          <Text className="text-2xl font-black text-neutral-900 text-center tracking-tight mb-2">
            Password Recovery
          </Text>
          <Text className="text-xs font-normal text-neutral-500 text-center px-4 leading-5 mb-8">
            Enter your registered email address to receive password reset instructions.
          </Text>

          {/* Error message */}
          {error && (
            <View className="bg-rose-50 border border-rose-200 p-3 rounded-2xl mb-4">
              <Text className="text-xs text-rose-700 font-semibold text-center">{error}</Text>
            </View>
          )}

          {sent ? (
            <View className="bg-[#fdece8] border border-[#fad4cc] p-6 rounded-3xl items-center my-4">
              <CheckCircle2 size={36} color="#df3b20" />
              <Text className="text-base font-bold text-neutral-900 mt-3 mb-1">
                Instructions Dispatched
              </Text>
              <Text className="text-xs text-neutral-600 text-center leading-5 mb-6">
                We have sent instructions to reset your password to {email}.
              </Text>
              <Button
                title="Return to Login"
                variant="primary"
                pill
                size="md"
                onPress={() => router.replace('/(auth)/login')}
                className="w-full h-[48px]"
              />
            </View>
          ) : (
            <View>
              <Input
                pill
                placeholder="Email address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color="#9ca3af" />}
              />

              <Button
                title="Send Reset Instructions"
                variant="primary"
                pill
                size="lg"
                onPress={handleSendReset}
                loading={loading}
                className="h-[52px] mt-2 shadow-sm"
              />
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="items-center py-6">
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="flex-row items-center py-2"
          >
            <Text className="text-[13px] text-neutral-600">Remember your password? </Text>
            <Text className="text-[13px] font-black text-[#df3b20]">Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
