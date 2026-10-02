import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  User as UserIcon,
  Phone,
  Bell,
  Headphones,
  ShieldCheck,
  MapPin,
  ChevronRight,
  LogOut,
  Info,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { useAuthStore } from '../../src/store/authStore';
import { profileApi } from '../../src/api/profile.api';

export default function UserSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: wageRule } = useQuery({
    queryKey: ['wage-rules'],
    queryFn: () => profileApi.getWageRules(),
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Tebeya Services?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const defaultAvatar =
    user?.profileImageUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  const hasIdProof = !!user?.idProofUrl;
  const isAddressConfirmed = !!user?.address?.confirmed;

  return (
    <ScreenWrapper className="px-4">
      {/* Header matching Image 4: "Change your" / "User & Settings" / Orange Button */}
      <AppTopHeader
        subtitle="Change your"
        title="User & Settings"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Profile Hero Section matching Image 4 */}
        <View className="flex-row items-center py-2 mb-2">
          {/* Circular Avatar */}
          <View className="w-20 h-20 rounded-full border-2 border-neutral-900 overflow-hidden mr-4 bg-neutral-200">
            <Image
              source={{ uri: defaultAvatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* User Details matching Image 4 */}
          <View className="flex-1">
            <Text className="text-xl font-black text-neutral-900 tracking-tight">
              {user?.name || 'Jude Bellingham'}
            </Text>
            <Text className="text-xs font-bold text-neutral-600 mt-0.5">
              {user?.phone || '+91 790293742'}
            </Text>
            <Text className="text-xs font-medium text-neutral-500">
              {user?.email || 'jawaadde@gmail.com'}
            </Text>
          </View>
        </View>

        {/* 3 Circular Quick Action Buttons matching Image 4 */}
        <View className="flex-row justify-between px-2 my-4">
          {/* Circle 1: Phone / Account Details */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/address-picker')}
            className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-sm border border-white/50"
          >
            <MapPin size={22} color="#201d1e" />
          </TouchableOpacity>

          {/* Circle 2: Notifications Center */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/notifications')}
            className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-sm border border-white/50"
          >
            <Bell size={22} color="#201d1e" />
          </TouchableOpacity>

          {/* Circle 3: Support / Coordinator */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Alert.alert('Support Hotline', 'Tebeya Coordinator: +91 98765 43210')}
            className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-sm border border-white/50"
          >
            <Headphones size={22} color="#201d1e" />
          </TouchableOpacity>
        </View>

        {/* Card 1: Horizontal Rounded Card (KYC ID Proof) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/kyc-upload')}
          className="bg-white rounded-[28px] p-5 mb-3.5 shadow-sm border border-white/50 flex-row items-center justify-between"
        >
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <ShieldCheck size={16} color={hasIdProof ? '#10b981' : '#df3b20'} />
              <Text className="text-sm font-bold text-neutral-900 ml-1.5">
                Government ID Proof (KYC)
              </Text>
            </View>
            <Text className="text-xs text-neutral-500 leading-4">
              {hasIdProof
                ? 'Document uploaded in private vault. Admin verified.'
                : 'Upload Aadhaar, Voter ID, or Driving License for KYC compliance.'}
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-[#f1f2f2] items-center justify-center">
            <ChevronRight size={16} color="#201d1e" />
          </View>
        </TouchableOpacity>

        {/* Card 2: Large Tall Rounded Card (Address & Policy & Logout) */}
        <View className="bg-white rounded-[28px] p-5 shadow-sm border border-white/50">
          <Text className="text-sm font-black text-neutral-900 mb-3">
            Account Preferences & Rules
          </Text>

          {/* Address Item */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/address-picker')}
            className="flex-row items-center justify-between py-3 border-b border-neutral-100"
          >
            <View className="flex-1 mr-2">
              <Text className="text-xs font-bold text-neutral-800">
                Home Address Location
              </Text>
              <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={1}>
                {user?.address?.text || 'Indiranagar, Bangalore (Coordinates confirmed)'}
              </Text>
            </View>
            <ChevronRight size={16} color="#94a3b8" />
          </TouchableOpacity>

          {/* Policy Information */}
          <View className="py-3 border-b border-neutral-100">
            <View className="flex-row items-center mb-1">
              <Info size={14} color="#df3b20" />
              <Text className="text-xs font-bold text-neutral-800 ml-1.5">
                Distance Travel Policy
              </Text>
            </View>
            <Text className="text-xs text-neutral-500 leading-4">
              Free travel buffer up to {wageRule?.freeKm ?? 10} km. Shifts beyond earn an extra +₹{wageRule?.perKmRate ?? 15}/km.
            </Text>
          </View>

          {/* Sign Out Button in Brand Coral */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            className="mt-6 bg-[#df3b20] py-3.5 px-4 rounded-2xl flex-row items-center justify-center shadow-sm"
          >
            <LogOut size={16} color="#ffffff" />
            <Text className="text-sm font-bold text-white ml-2">
              Sign Out of Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
