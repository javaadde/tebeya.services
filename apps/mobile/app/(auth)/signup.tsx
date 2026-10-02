import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, User, Mail, Phone, Lock, CheckCircle2, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { authApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/authStore';

export default function SignupScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [inviteCode, setInviteCode] = useState('');
  const [lockedPhoneOrEmail, setLockedPhoneOrEmail] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const handleVerifyCode = async () => {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter your invite code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.verifyInviteCode(cleanCode);
      if (res.lockedPhoneOrEmail) {
        setLockedPhoneOrEmail(res.lockedPhoneOrEmail);
        if (res.lockedPhoneOrEmail.includes('@')) {
          setEmail(res.lockedPhoneOrEmail);
        } else {
          setPhone(res.lockedPhoneOrEmail);
        }
      }
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired invite code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.register({
        inviteCode: inviteCode.trim().toUpperCase(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      await setSession(res.user, res.tokens);
      Alert.alert(
        'Account Created',
        'Welcome to Tebeya Services! Please complete your government ID verification in Profile.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable className="px-5 py-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between pt-2 pb-4">
        <TouchableOpacity
          onPress={() => (step === 2 ? setStep(1) : router.back())}
          className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color="#201d1e" />
        </TouchableOpacity>

        <Text className="text-base font-black text-neutral-900 tracking-tight">
          Invite-Only Signup
        </Text>

        <View className="w-12" />
      </View>

      <View className="bg-white rounded-[28px] p-6 shadow-sm border border-white/50 mb-4">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-2xl bg-[#fdece8] items-center justify-center mr-3">
            <KeyRound size={20} color="#df3b20" />
          </View>
          <View>
            <Text className="text-base font-black text-neutral-900">
              {step === 1 ? 'Step 1: Invite Code' : 'Step 2: Staff Details'}
            </Text>
            <Text className="text-xs text-neutral-500">
              {step === 1 ? 'Verify single-use access code' : 'Complete your account setup'}
            </Text>
          </View>
        </View>

        {error && (
          <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl mb-4">
            <Text className="text-xs text-rose-700 font-semibold">{error}</Text>
          </View>
        )}

        {step === 1 ? (
          <View>
            <Text className="text-xs text-neutral-600 leading-5 mb-4">
              Registration requires an admin-issued single-use code to guarantee high-trust catering staff.
            </Text>

            <Input
              label="Single-Use Invite Code"
              placeholder="e.g. TB-89X2-A"
              value={inviteCode}
              onChangeText={(text) => {
                setInviteCode(text.toUpperCase());
                setError(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              leftIcon={<KeyRound size={18} color="#94a3b8" />}
            />

            <Button
              title="Verify Invite Code"
              onPress={handleVerifyCode}
              loading={loading}
              variant="primary"
              size="lg"
            />
          </View>
        ) : (
          <View>
            <View className="flex-row items-center bg-[#fdece8] p-3 rounded-xl mb-4">
              <CheckCircle2 size={16} color="#df3b20" />
              <Text className="text-xs font-bold text-[#df3b20] ml-2">
                Validated Code: {inviteCode}
              </Text>
            </View>

            <Input
              label="Full Name"
              placeholder="Rahul Sharma"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={18} color="#94a3b8" />}
            />

            <Input
              label="Mobile Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color="#94a3b8" />}
            />

            <Input
              label="Email Address"
              placeholder="rahul@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color="#94a3b8" />}
            />

            <Input
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color="#94a3b8" />}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color="#94a3b8" />}
            />

            <Button
              title="Complete Registration"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              size="lg"
            />
          </View>
        )}
      </View>

      <View className="bg-white/80 rounded-[24px] p-4 items-center">
        <Text className="text-xs text-neutral-600">Already registered?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="mt-1">
          <Text className="text-xs font-black text-[#df3b20]">Sign In to Account →</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
