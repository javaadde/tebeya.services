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
  CheckCircle,
  IndianRupee,
  Clock,
} from 'lucide-react-native';
import { AppNotification, NotificationType } from '@tebeya/shared';
import { ScreenWrapper } from '../src/components/layout/ScreenWrapper';
import { Header } from '../src/components/layout/Header';
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
        return <Sparkles size={18} color="#4f46e5" />;
      case 'payment_marked':
        return <IndianRupee size={18} color="#10b981" />;
      case 'event_reminder':
        return <Clock size={18} color="#f59e0b" />;
      case 'event_cancelled':
        return <AlertTriangle size={18} color="#e11d48" />;
      default:
        return <Bell size={18} color="#6366f1" />;
    }
  };

  return (
    <ScreenWrapper>
      <Header
        title="Notifications"
        showBack
        rightAction={
          notifications.length > 0 ? (
            <TouchableOpacity
              onPress={() => markAllReadMutation.mutate()}
              className="py-1 px-2"
            >
              <Text className="text-xs font-semibold text-indigo-600">
                Mark all read
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#4f46e5']}
          />
        }
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isUnread = !item.readAt;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (item.data?.eventId) {
                  router.push(`/events/${item.data.eventId}`);
                }
              }}
              className={`p-4 rounded-2xl mb-3 border ${
                isUnread
                  ? 'bg-indigo-50/40 border-indigo-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <View className="flex-row items-start">
                <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3 mt-0.5">
                  {getNotificationIcon(item.type)}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm font-bold text-slate-900 flex-1 mr-2" numberOfLines={1}>
                      {item.title}
                    </Text>
                    {isUnread && (
                      <View className="w-2 h-2 rounded-full bg-indigo-600 ml-1" />
                    )}
                  </View>
                  <Text className="text-xs text-slate-600 leading-4">
                    {item.body}
                  </Text>
                  <Text className="text-[10px] text-slate-400 mt-2">
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
              description="You're all caught up! Shift alerts, reminders, and payment updates will appear here."
              icon={<Bell size={32} color="#94a3b8" />}
            />
          ) : null
        }
      />
    </ScreenWrapper>
  );
}
