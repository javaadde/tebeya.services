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
  AppWindow,
  CalendarSearch,
  Hexagon,
  History,
  ArrowUpRight,
  HelpCircle,
  Home,
  Clock,
  Settings,
  LogOut
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { useAuthStore } from '../../src/store/authStore';
import { profileApi } from '../../src/api/profile.api';

export default function UserSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

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

  return (
    <ScreenWrapper className="px-4 bg-[#dfdfdf]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <AppTopHeader
          subtitle="Change your"
          title="User & Settings"
          rightIcon={<LogOut size={22} color="#ffffff" />}
          onRightPress={handleLogout}
        />

        <View className="flex-row items-center py-2 mb-2 mt-2">
          <View className="w-20 h-20 rounded-full border border-neutral-200 overflow-hidden mr-4 bg-neutral-200">
            <Image
              source={{ uri: defaultAvatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-black text-neutral-900 tracking-tight">
              {user?.name || 'Jude Bellingham'}
            </Text>
            <Text className="text-xs text-neutral-600 mt-0.5">
              {user?.phone || '+91 790293742'}
            </Text>
            <Text className="text-xs text-neutral-500">
              {user?.email || 'jawaadde@gmail.com'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-start space-x-4 my-6">
          <TouchableOpacity
            activeOpacity={0.85}
            className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <AppWindow size={24} color="#598A31" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            className="w-14 h-14 rounded-full bg-[#598A31] items-center justify-center shadow-sm ml-4"
          >
            <CalendarSearch size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            className="w-14 h-14 rounded-full bg-[#598A31] items-center justify-center shadow-sm ml-4"
          >
            <Hexagon size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-[28px] p-5 mb-4 shadow-sm">
          <Text className="text-sm font-black text-neutral-900 mb-4">
            Account Details
          </Text>
          <View className="flex-row justify-between mb-3">
            <Text className="text-xs text-neutral-500">Email Address</Text>
            <Text className="text-xs font-bold text-neutral-900">{user?.email || 'jawaadde@gmail.com'}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-xs text-neutral-500">Phone Number</Text>
            <Text className="text-xs font-bold text-neutral-900">{user?.phone || '+91 790293742'}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-neutral-500">Member Since</Text>
            <Text className="text-xs font-bold text-neutral-900">Oct 2023</Text>
          </View>
        </View>

        <View className="bg-white rounded-[28px] p-5 shadow-sm mb-6">
          <Text className="text-sm font-black text-neutral-900 mb-5">
            Preferences
          </Text>

          <TouchableOpacity className="flex-row items-center mb-6" activeOpacity={0.8}>
            <View className="w-10 h-10 rounded-full bg-[#9cb97a] items-center justify-center mr-3">
              <History size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-neutral-900">Order History</Text>
              <Text className="text-xs text-neutral-500 mt-0.5">View all your past orders</Text>
            </View>
            <ArrowUpRight size={20} color="#201d1e" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center mb-6" activeOpacity={0.8}>
            <View className="w-10 h-10 rounded-full bg-[#9cb97a] items-center justify-center mr-3">
              <Hexagon size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-neutral-900">App Settings</Text>
              <Text className="text-xs text-neutral-500 mt-0.5">Manage notifications & privacy</Text>
            </View>
            <ArrowUpRight size={20} color="#201d1e" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center mb-6" activeOpacity={0.8}>
            <View className="w-10 h-10 rounded-full bg-[#9cb97a] items-center justify-center mr-3">
              <CalendarSearch size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-neutral-900">Saved Searches</Text>
              <Text className="text-xs text-neutral-500 mt-0.5">Quick access to your favorites</Text>
            </View>
            <ArrowUpRight size={20} color="#201d1e" />
          </TouchableOpacity>

          <Text className="text-sm font-black text-neutral-900 mt-2 mb-5">
            Support
          </Text>

          <TouchableOpacity className="flex-row items-center" activeOpacity={0.8}>
            <View className="w-10 h-10 rounded-full bg-[#9cb97a] items-center justify-center mr-3">
              <Home size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-neutral-900">Help Center</Text>
              <Text className="text-xs text-neutral-500 mt-0.5">FAQs and troubleshooting</Text>
            </View>
            <ArrowUpRight size={20} color="#201d1e" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
