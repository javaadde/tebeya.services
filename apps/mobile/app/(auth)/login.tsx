import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { SocialAuthBlock } from '../../src/components/auth/SocialAuthBlock';
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
    <ScreenWrapper
      scrollable
      backgroundColor="bg-white"
      className="px-6 py-4 justify-between"
    >
      <View className="flex-1 justify-center pt-8">
        {/* Title */}
        <Text className="text-2xl font-black text-neutral-900 text-center mb-8 tracking-tight">
          Login
        </Text>

        {/* Error Notification */}
        {error && (
          <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-4">
            <Text className="text-xs text-rose-700 font-semibold text-center">{error}</Text>
          </View>
        )}

        {/* Form Inputs */}
        <View className="w-full">
          <Input
            pill
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Mail size={18} color="#9ca3af" />}
          />

          <Input
            pill
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            secureTextEntry
            leftIcon={<Lock size={18} color="#9ca3af" />}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            className="self-center my-3"
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          >
            <Text className="text-xs font-semibold text-neutral-500">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Primary Login Button */}
          <Button
            title="Login"
            variant="primary"
            pill
            size="lg"
            onPress={handleLogin}
            loading={loading}
            className="h-[52px] mt-1 shadow-sm"
          />
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-neutral-200" />
          <Text className="mx-4 text-xs font-medium text-neutral-400">or</Text>
          <View className="flex-1 h-[1px] bg-neutral-200" />
        </View>

        {/* Google-Only Social Login */}
        <SocialAuthBlock />
      </View>

      {/* Footer Navigation */}
      <View className="items-center py-6">
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          className="flex-row items-center py-2"
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
        >
          <Text className="text-[13px] text-neutral-600">Need an account? </Text>
          <Text className="text-[13px] font-black text-[#598A31]">Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
