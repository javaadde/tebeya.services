import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, User, Mail, Phone, Lock, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { authApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/authStore';

export default function SignupScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [inviteCode, setInviteCode] = useState('');
  const [lockedPhoneOrEmail, setLockedPhoneOrEmail] = useState<string | null>(null);

  // Form Fields for Step 2
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  // Step 1: Verify Invite Code (Rule 3)
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

  // Step 2: Complete Registration
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
        'Welcome to Tebeya Services! Please upload your ID proof in your profile to complete verification.',
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
    <ScreenWrapper scrollable className="px-6 py-8">
      {/* Brand & Progress Header */}
      <View className="items-center mb-6 pt-2">
        <View className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center mb-3">
          <KeyRound size={28} color="#4f46e5" />
        </View>
        <Text className="text-2xl font-black text-slate-900 tracking-tight text-center">
          Invite-Only Signup
        </Text>
        <Text className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-2">
          {step === 1 ? 'Step 1: Validate Invite Code' : 'Step 2: Staff Details'}
        </Text>
      </View>

      {/* Global Error Banner */}
      {error && (
        <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl mb-5">
          <Text className="text-xs text-rose-700 font-semibold">{error}</Text>
        </View>
      )}

      {step === 1 ? (
        // STEP 1: INVITE CODE VALIDATION
        <View>
          <View className="bg-slate-100/70 p-4 rounded-2xl mb-6 border border-slate-200/60">
            <Text className="text-xs text-slate-600 leading-5">
              Tebeya Services operates on an invite-only model to ensure trusted catering staff.
              Enter the single-use invite code provided by your event coordinator.
            </Text>
          </View>

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
            size="lg"
            icon={<ArrowRight size={18} color="#ffffff" />}
          />
        </View>
      ) : (
        // STEP 2: PROFILE & CREDENTIALS
        <View>
          <View className="flex-row items-center bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-5">
            <CheckCircle2 size={18} color="#059669" />
            <Text className="text-xs text-emerald-800 font-semibold ml-2">
              Invite Code Verified: {inviteCode}
            </Text>
          </View>

          <Input
            label="Full Name"
            placeholder="Rahul Sharma"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            leftIcon={<User size={18} color="#94a3b8" />}
          />

          <Input
            label="Mobile Number"
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError(null);
            }}
            keyboardType="phone-pad"
            editable={!lockedPhoneOrEmail || lockedPhoneOrEmail.includes('@')}
            helperText={lockedPhoneOrEmail && !lockedPhoneOrEmail.includes('@') ? 'Locked to this invite code' : undefined}
            leftIcon={<Phone size={18} color="#94a3b8" />}
          />

          <Input
            label="Email Address"
            placeholder="rahul@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!lockedPhoneOrEmail || !lockedPhoneOrEmail.includes('@')}
            helperText={lockedPhoneOrEmail && lockedPhoneOrEmail.includes('@') ? 'Locked to this invite code' : undefined}
            leftIcon={<Mail size={18} color="#94a3b8" />}
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            secureTextEntry
            leftIcon={<Lock size={18} color="#94a3b8" />}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError(null);
            }}
            secureTextEntry
            leftIcon={<Lock size={18} color="#94a3b8" />}
          />

          <Button
            title="Complete Registration"
            onPress={handleRegister}
            loading={loading}
            size="lg"
          />

          <TouchableOpacity
            onPress={() => setStep(1)}
            className="mt-3 py-2 items-center"
          >
            <Text className="text-xs font-semibold text-slate-500">
              Change Invite Code
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Switch to Login */}
      <View className="flex-row justify-center items-center mt-8 pt-4 border-t border-slate-200/60">
        <Text className="text-xs text-slate-500">Already registered? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text className="text-xs font-bold text-indigo-600">Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
