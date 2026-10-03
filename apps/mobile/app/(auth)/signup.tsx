import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  KeyRound,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { CateringStaffIllustration } from '../../src/components/auth/CateringStaffIllustration';
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

  // Step 1: Verify OTP / Invite Code (Rule 3)
  const handleVerifyCode = async () => {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter your invite code / OTP.');
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
      const msg = err instanceof Error ? err.message : 'Invalid or expired invite code / OTP.';
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
    <ScreenWrapper
      scrollable
      backgroundColor="bg-white"
      className="px-6 py-4 justify-between"
    >
      <View className="flex-1 justify-between">
        <View className="pt-2">
          {/* Top Navigation Bar */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => (step === 2 ? setStep(1) : router.back())}
              className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={22} color="#1a1a1a" />
            </TouchableOpacity>
            <Text className="text-base font-black text-neutral-900 tracking-tight">
              {step === 1 ? 'Step 1: Invite OTP' : 'Step 2: Staff Details'}
            </Text>
            <View className="w-10" />
          </View>

          {/* Orange Brand Progress Bar */}
          <View className="flex-row items-center justify-center space-x-2 w-full px-2 mb-6">
            <View
              className={`flex-1 h-[4px] rounded-full mx-1 ${
                step >= 1 ? 'bg-[#df3b20]' : 'bg-neutral-200'
              }`}
            />
            <View
              className={`flex-1 h-[4px] rounded-full mx-1 ${
                step >= 2 ? 'bg-[#df3b20]' : 'bg-neutral-200'
              }`}
            />
          </View>

          {/* Global Error Banner */}
          {error && (
            <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-4">
              <Text className="text-xs text-rose-700 font-semibold text-center">{error}</Text>
            </View>
          )}

          {step === 1 ? (
            /* ---------------- STEP 1: INVITE CODE / OTP ENTRY FIRST ---------------- */
            <View className="items-center">
              {/* Meaningful Catering Staff Illustration */}
              <View className="items-center my-3">
                <CateringStaffIllustration width={220} height={175} />
              </View>

              {/* Meaningful Catering Copy */}
              <Text className="text-2xl font-black text-neutral-900 text-center tracking-tight mb-2">
                Join Event Staff
              </Text>
              <Text className="text-xs font-normal text-neutral-500 text-center px-4 leading-5 mb-8">
                Enter the admin-issued invite code (OTP) provided by your catering coordinator to verify your access.
              </Text>

              {/* Pill Input */}
              <Input
                pill
                placeholder="Single-Use Invite Code (e.g. TB-89X2-A)"
                value={inviteCode}
                onChangeText={(text) => {
                  setInviteCode(text.toUpperCase());
                  setError(null);
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                leftIcon={<KeyRound size={18} color="#9ca3af" />}
              />

              {/* Primary Action Button (No Gmail or other buttons here) */}
              <Button
                title="Verify Invite Code"
                variant="primary"
                pill
                size="lg"
                onPress={handleVerifyCode}
                loading={loading}
                className="w-full h-[52px] mt-2 shadow-sm"
              />
            </View>
          ) : (
            /* ---------------- STEP 2: STAFF DETAILS & CREDENTIALS ---------------- */
            <View>
              {/* Verified Code Pill */}
              <View className="flex-row items-center justify-center bg-[#fdece8] border border-[#fad4cc] py-2 px-4 rounded-full mb-6 self-center">
                <CheckCircle2 size={16} color="#df3b20" />
                <Text className="text-xs font-bold text-[#df3b20] ml-2">
                  Verified Code: {inviteCode}
                </Text>
              </View>

              <Text className="text-2xl font-black text-neutral-900 text-center tracking-tight mb-2">
                Create Staff Profile
              </Text>
              <Text className="text-xs font-normal text-neutral-500 text-center px-4 leading-5 mb-6">
                Fill in your details to complete registration and start booking banquet shifts.
              </Text>

              {/* Form Fields */}
              <Input
                pill
                placeholder="Full Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                leftIcon={<User size={18} color="#9ca3af" />}
              />

              <Input
                pill
                placeholder="Mobile Number"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setError(null);
                }}
                keyboardType="phone-pad"
                editable={!lockedPhoneOrEmail || lockedPhoneOrEmail.includes('@')}
                helperText={
                  lockedPhoneOrEmail && !lockedPhoneOrEmail.includes('@')
                    ? 'Locked to this invite code'
                    : undefined
                }
                leftIcon={<Phone size={18} color="#9ca3af" />}
              />

              <Input
                pill
                placeholder="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!lockedPhoneOrEmail || !lockedPhoneOrEmail.includes('@')}
                helperText={
                  lockedPhoneOrEmail && lockedPhoneOrEmail.includes('@')
                    ? 'Locked to this invite code'
                    : undefined
                }
                leftIcon={<Mail size={18} color="#9ca3af" />}
              />

              <Input
                pill
                placeholder="Password (at least 6 characters)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                secureTextEntry
                leftIcon={<Lock size={18} color="#9ca3af" />}
              />

              <Input
                pill
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError(null);
                }}
                secureTextEntry
                leftIcon={<Lock size={18} color="#9ca3af" />}
              />

              {/* Primary Action Button */}
              <Button
                title="Complete Registration"
                variant="primary"
                pill
                size="lg"
                onPress={handleRegister}
                loading={loading}
                className="w-full h-[52px] mt-2 shadow-sm"
              />

              <TouchableOpacity
                onPress={() => setStep(1)}
                className="mt-3 py-2 items-center"
              >
                <Text className="text-xs font-semibold text-neutral-500">
                  Change Invite Code
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer Navigation */}
        <View className="items-center py-6">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="flex-row items-center py-2"
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <Text className="text-[13px] text-neutral-600">Already registered? </Text>
            <Text className="text-[13px] font-black text-[#df3b20]">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
