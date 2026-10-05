import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Sparkles,
  AlertTriangle,
  IndianRupee,
  Clock,
  ChevronLeft,
} from 'lucide-react-native';
import { AppNotification, NotificationType } from '@tebeya/shared';
import { ScreenWrapper } from '../src/components/layout/ScreenWrapper';
import { EmptyState } from '../src/components/layout/EmptyState';
import { notificationsApi } from '../src/api/notifications.api';

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'event_published':
      case 'seat_opened':
        return <Sparkles size={18} color="#598A31" />;
      case 'payment_marked':
        return <IndianRupee size={18} color="#10b981" />;
      case 'event_reminder':
        return <Clock size={18} color="#f59e0b" />;
      case 'event_cancelled':
        return <AlertTriangle size={18} color="#e11d48" />;
      default:
        return <Bell size={18} color="#201d1e" />;
    }
  };

  return (
    <ScreenWrapper className="px-4">
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
          Notifications
        </Text>

        {notifications.length > 0 ? (
          <TouchableOpacity
            onPress={() => markAllReadMutation.mutate()}
            className="px-3 py-1.5 rounded-xl bg-white shadow-sm"
          >
            <Text className="text-xs font-bold text-[#598A31]">
              Mark all
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-12" />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#598A31']}
            tintColor="#598A31"
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const isUnread = !item.readAt;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (item.data?.eventId) {
                  router.push(`/events/${item.data.eventId}`);
                }
              }}
              className={`p-4 rounded-[24px] mb-3 shadow-sm border ${
                isUnread
                  ? 'bg-white border-[#cee2be]'
                  : 'bg-white/90 border-white/60'
              }`}
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-2xl bg-[#f1f2f2] items-center justify-center mr-3 mt-0.5">
                  {getNotificationIcon(item.type)}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm font-bold text-neutral-900 flex-1 mr-2" numberOfLines={1}>
                      {item.title}
                    </Text>
                    {isUnread && (
                      <View className="w-2 h-2 rounded-full bg-[#598A31] ml-1" />
                    )}
                  </View>
                  <Text className="text-xs text-neutral-600 leading-4">
                    {item.body}
                  </Text>
                  <Text className="text-[10px] text-neutral-400 mt-2 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No Notifications"
              description="Shift alerts, reminders, and payment updates will appear here."
              icon={<Bell size={32} color="#94a3b8" />}
            />
          ) : null
        }
      />
    </ScreenWrapper>
  );
}
