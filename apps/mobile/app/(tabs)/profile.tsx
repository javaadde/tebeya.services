import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronRight,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { UserStatusBadge } from '../../src/components/ui/Badge';
import { useAuthStore } from '../../src/store/authStore';
import { profileApi } from '../../src/api/profile.api';
import { CONFIG } from '../../src/constants/config';

export default function ProfileScreen() {
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

  const hasIdProof = !!user?.idProofUrl;
  const isAddressConfirmed = !!user?.address?.confirmed;

  return (
    <ScreenWrapper scrollable>
      <Header title="Staff Profile" />

      <View className="p-4">
        {/* User Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-200 shadow-sm items-center">
          <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center mb-3 border-2 border-indigo-200">
            <UserIcon size={40} color="#4f46e5" />
          </View>

          <Text className="text-xl font-black text-slate-900 mb-0.5">
            {user?.name || 'Staff Member'}
          </Text>

          <View className="flex-row items-center space-x-1.5 mb-2">
            <Text className="text-xs text-slate-500">{user?.email}</Text>
          </View>

          {user?.status && <UserStatusBadge status={user.status} />}

          <View className="w-full flex-row justify-around mt-4 pt-4 border-t border-slate-100">
            <View className="items-center">
              <View className="flex-row items-center">
                <Phone size={14} color="#64748b" />
                <Text className="text-xs font-semibold text-slate-700 ml-1">
                  {user?.phone || 'No phone'}
                </Text>
              </View>
              <Text className="text-[10px] text-slate-400 mt-0.5">
                {user?.phoneVerified ? 'Verified Phone' : 'Unverified Phone'}
              </Text>
            </View>

            <View className="w-px bg-slate-200" />

            <View className="items-center">
              <View className="flex-row items-center">
                <ShieldCheck size={14} color={hasIdProof ? '#10b981' : '#f59e0b'} />
                <Text className="text-xs font-semibold text-slate-700 ml-1">
                  {hasIdProof ? 'KYC Uploaded' : 'KYC Pending'}
                </Text>
              </View>
              <Text className="text-[10px] text-slate-400 mt-0.5">
                Govt ID Proof
              </Text>
            </View>
          </View>
        </View>

        {/* KYC & ID Verification Card (Rule 4) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/kyc-upload')}
          className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-3">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${hasIdProof ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              <FileText size={20} color={hasIdProof ? '#059669' : '#d97706'} />
            </View>
            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-sm font-bold text-slate-900">
                  Government ID Proof
                </Text>
                {hasIdProof && (
                  <View className="bg-emerald-50 px-2 py-0.5 rounded-full ml-2">
                    <Text className="text-[10px] font-bold text-emerald-700">Uploaded</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-slate-500 mt-0.5 leading-4" numberOfLines={2}>
                {hasIdProof
                  ? 'Private authenticated storage. Admin verification in progress.'
                  : 'Upload Aadhaar, Voter ID, or Driving License for KYC compliance.'}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Home Address & Geolocation Card (FR-23) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/address-picker')}
          className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-3">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${isAddressConfirmed ? 'bg-indigo-100' : 'bg-slate-100'}`}>
              <MapPin size={20} color={isAddressConfirmed ? '#4f46e5' : '#64748b'} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-slate-900">
                Home Address Location
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5 leading-4" numberOfLines={2}>
                {user?.address?.text || 'Set your home pin to calculate travel bonuses for distant venues.'}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Wage Rules & Travel Policy Card (FR-24) */}
        <View className="bg-slate-100/80 rounded-2xl p-4 mb-6 border border-slate-200/60">
          <View className="flex-row items-center mb-2">
            <Info size={16} color="#4f46e5" />
            <Text className="text-xs font-bold text-slate-900 ml-1.5">
              Wage & Travel Policy Information
            </Text>
          </View>
          <Text className="text-xs text-slate-600 leading-5">
            • Free Travel Buffer: Venues within {wageRule?.freeKm ?? CONFIG.DEFAULT_FREE_KM} km of home are covered under base pay.
          </Text>
          <Text className="text-xs text-slate-600 leading-5 mt-1">
            • Travel Bonus: Distances beyond {wageRule?.freeKm ?? CONFIG.DEFAULT_FREE_KM} km earn an extra +₹{wageRule?.perKmRate ?? CONFIG.DEFAULT_PER_KM_RATE}/km.
          </Text>
          <Text className="text-xs text-slate-600 leading-5 mt-1">
            • Daily Cap: Max 2 events per calendar day with mandatory 2-hour rest/travel gap.
          </Text>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-rose-50 py-3.5 px-4 rounded-xl border border-rose-200 mb-8"
        >
          <LogOut size={18} color="#e11d48" />
          <Text className="text-sm font-bold text-rose-700 ml-2">
            Sign Out of Account
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-[11px] text-slate-400">
          Tebeya Services v1.0.0 • Catering Staff Edition
        </Text>
      </View>
    </ScreenWrapper>
  );
}
