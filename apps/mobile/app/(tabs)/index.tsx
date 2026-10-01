import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Bell, Sparkles, Navigation, AlertCircle } from 'lucide-react-native';
import { EventSlot, EventWithStaffMeta } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { ShiftCard } from '../../src/components/shifts/ShiftCard';
import { EmptyState } from '../../src/components/layout/EmptyState';
import { UserStatusBadge } from '../../src/components/ui/Badge';
import { useAuthStore } from '../../src/store/authStore';
import { eventsApi } from '../../src/api/events.api';

const SLOT_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Shifts' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'snacks', label: 'Snacks' },
  { key: 'dinner', label: 'Dinner' },
];

export default function HomeFeedScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedSlot, setSelectedSlot] = useState<string>('all');
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);

  const {
    data: events = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<EventWithStaffMeta[]>({
    queryKey: ['events', selectedSlot],
    queryFn: () => eventsApi.getEvents({ slot: selectedSlot }),
  });

  // Query booked shifts to display "Today's Active Shift" banner if any
  const { data: myBookingsData } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => eventsApi.getMyBookings(),
  });

  const todayIso = new Date().toISOString().split('T')[0];
  const todayShift = useMemo(() => {
    if (!myBookingsData?.events) return null;
    return myBookingsData.events.find(
      (e) => e.date === todayIso && e.status === 'published'
    );
  }, [myBookingsData, todayIso]);

  // Filter & sort feed
  const displayEvents = useMemo(() => {
    let list = [...events];
    if (sortByDistance) {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }
    return list;
  }, [events, sortByDistance]);

  return (
    <ScreenWrapper className="px-4">
      {/* Top Header: User Greeting & Notification Bell */}
      <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center space-x-2">
            <Text className="text-xl font-black text-slate-900" numberOfLines={1}>
              Hi, {user?.name?.split(' ')[0] || 'Staff'}!
            </Text>
            {user?.status && (
              <View className="ml-2">
                <UserStatusBadge status={user.status} />
              </View>
            )}
          </View>
          <Text className="text-xs text-slate-500 mt-0.5">
            Ready to discover upcoming catering shifts?
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Bell size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* TODAY'S ACTIVE SHIFT ALERT BANNER (If booked today) */}
      {todayShift && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/events/${todayShift.id}`)}
          className="bg-indigo-600 rounded-2xl p-4 my-3 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <Sparkles size={16} color="#fbbf24" />
              <Text className="text-xs font-bold text-amber-300 ml-1.5 uppercase tracking-wide">
                Today's Confirmed Shift
              </Text>
            </View>
            <Text className="text-base font-bold text-white mb-0.5" numberOfLines={1}>
              {todayShift.title}
            </Text>
            <Text className="text-xs text-indigo-100">
              🕒 {todayShift.startTime} - {todayShift.endTime} • {todayShift.venue.text}
            </Text>
          </View>
          <View className="bg-white/20 px-3 py-1.5 rounded-xl">
            <Text className="text-xs font-bold text-white">View</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Filter Chips Bar */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {SLOT_FILTERS.map((filter) => {
            const isSelected = selectedSlot === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedSlot(filter.key)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Sort by distance toggle */}
          <TouchableOpacity
            onPress={() => setSortByDistance(!sortByDistance)}
            className={`flex-row items-center px-3.5 py-1.5 rounded-full mr-2 border ${
              sortByDistance
                ? 'bg-emerald-600 border-emerald-600'
                : 'bg-white border-slate-200'
            }`}
          >
            <Navigation
              size={12}
              color={sortByDistance ? '#ffffff' : '#64748b'}
            />
            <Text
              className={`text-xs font-semibold ml-1.5 ${
                sortByDistance ? 'text-white' : 'text-slate-600'
              }`}
            >
              Nearby First
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Shifts Feed List */}
      <FlatList
        data={displayEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShiftCard
            event={item}
            onPress={() => router.push(`/events/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#4f46e5']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No Shifts Available"
              description="There are currently no catering events matching this filter. Check back shortly as new shifts are published continuously."
              actionTitle="Reset Filter"
              onAction={() => {
                setSelectedSlot('all');
                setSortByDistance(false);
              }}
            />
          ) : null
        }
      />
    </ScreenWrapper>
  );
}
