import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { BigEventCard } from '../../src/components/events';
import { ShiftCard } from '../../src/components/shifts/ShiftCard';
import { useAuthStore } from '../../src/store/authStore';
import { eventsApi } from '../../src/api/events.api';

type FilterType = 'all' | 'evening' | 'lunch' | 'breakfast';

export default function HomeFeedScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  const {
    data: events = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<EventWithStaffMeta[]>({
    queryKey: ['events'],
    queryFn: () => eventsApi.getEvents(),
  });

  const { data: myBookingsData } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => eventsApi.getMyBookings(),
  });

  const todayIso = new Date().toISOString().split('T')[0];

  // Compute set of event IDs user has already joined today
  const todayBookedEventIds = useMemo(() => {
    const ids = new Set<string>();
    if (myBookingsData?.bookings && myBookingsData?.events) {
      for (const booking of myBookingsData.bookings) {
        if (booking.status === 'confirmed') {
          const ev = myBookingsData.events.find((e) => e.id === booking.eventId);
          if (ev && ev.date === todayIso) {
            ids.add(ev.id);
          }
        }
      }
    }
    return ids;
  }, [myBookingsData, todayIso]);

  const hasBookingToday = todayBookedEventIds.size > 0;

  // Only upcoming events (date >= today), sorted nearest first
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date >= todayIso)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
  }, [events, todayIso]);

  // Filtered shifts based on quick filter tabs and availability toggle
  const displayShifts = useMemo(() => {
    return upcomingEvents.filter((event) => {
      const isNotFull = (event.filledCount || 0) < (event.headcount || 1);
      if (availableOnly && !isNotFull) return false;

      if (selectedFilter === 'all') return true;

      const hour = event.startTime ? parseInt(event.startTime.split(':')[0], 10) : 0;
      const isEvening = event.slot === 'dinner' || hour >= 16 || hour <= 4;
      const isLunch = event.slot === 'lunch' || (hour >= 11 && hour < 16);
      const isBreakfast = event.slot === 'breakfast' || (hour >= 5 && hour < 11);

      if (selectedFilter === 'evening') return isEvening;
      if (selectedFilter === 'lunch') return isLunch;
      if (selectedFilter === 'breakfast') return isBreakfast;

      return true;
    });
  }, [upcomingEvents, selectedFilter, availableOnly]);

  // Determine greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning !';
    if (hour < 17) return 'Good Afternoon !';
    return 'Good Evening !';
  }, []);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'evening', label: 'Evening' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'breakfast', label: 'Breakfast' },
  ];

  return (
    <ScreenWrapper className="px-4">
      {/* Header matching reference mockup: Avatar, Greeting, User Name, Circular Button */}
      <AppTopHeader
        mode="user"
        subtitle={greeting}
        title={user?.name || 'Staff'}
        onRightPress={() => router.push('/notifications')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#df3b20']}
            tintColor="#df3b20"
          />
        }
      >
        {/* Quick Filters Row matching mockup */}
        <View className="flex-row items-center justify-between mb-3 mt-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingRight: 8 }}
          >
            {filters.map((filter) => {
              const isActive = selectedFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  activeOpacity={0.8}
                  onPress={() => setSelectedFilter(filter.key)}
                  className={`px-5 py-2 rounded-full mr-2.5 shadow-sm border ${
                    isActive
                      ? 'bg-[#1f1c1d] border-[#1f1c1d]'
                      : 'bg-white border-white/60'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isActive ? 'text-white' : 'text-neutral-700'
                    }`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Circular Filter Toggle Button matching circle in mockup */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAvailableOnly((prev) => !prev)}
            className={`w-9 h-9 rounded-full items-center justify-center shadow-sm border shrink-0 ${
              availableOnly
                ? 'bg-[#df3b20] border-[#df3b20]'
                : 'bg-white border-white/60'
            }`}
          >
            <SlidersHorizontal
              size={16}
              color={availableOnly ? '#ffffff' : '#201d1e'}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
        </View>

        {/* One-per-day Info Banner */}
        {hasBookingToday && (
          <View className="bg-[#fdece8] rounded-2xl p-4 mb-3 flex-row items-center border border-[#fad4cc]">
            <CheckCircle2 size={20} color="#df3b20" />
            <View className="ml-3 flex-1">
              <Text className="text-xs font-bold text-[#df3b20]">
                You have a shift today
              </Text>
              <Text className="text-[10px] text-neutral-600 mt-0.5">
                Only one work per day is allowed
              </Text>
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#df3b20" />
          </View>
        )}

        {/* Big Hero Card: Terracotta Red stepped card with swipeable image carousel */}
        {!isLoading && upcomingEvents.length > 0 && (
          <View className="mt-1">
            <BigEventCard
              events={
                displayShifts.length > 0
                  ? displayShifts.slice(0, 5)
                  : upcomingEvents.slice(0, 5)
              }
              onPressEvent={(ev) => router.push(`/events/${ev.id}`)}
            />
          </View>
        )}

        {/* 2x2 Grid of Shift Cards matching exact mockup layout */}
        {!isLoading && displayShifts.length > 0 && (
          <View className="flex-row flex-wrap justify-between pt-1">
            {displayShifts.map((event) => (
              <ShiftCard
                key={event.id}
                event={event}
                variant="grid"
                onPress={() => router.push(`/events/${event.id}`)}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && displayShifts.length === 0 && (
          <View className="bg-white rounded-[28px] p-8 items-center justify-center my-6 shadow-sm border border-white/50">
            <Sparkles size={36} color="#df3b20" />
            <Text className="text-base font-bold text-neutral-800 mt-3">
              No Shifts Found
            </Text>
            <Text className="text-xs text-neutral-500 text-center mt-1">
              {selectedFilter !== 'all' || availableOnly
                ? 'No shifts match your selected quick filters. Try switching filters.'
                : 'All upcoming shifts are currently filled. Check back soon!'}
            </Text>
          </View>
        )}

        {/* Bottom Quote: Hakuna Matata ! */}
        {displayShifts.length > 0 && (
          <View className="items-center justify-center pt-6 pb-4">
            <Text className="text-2xl font-black text-neutral-400/80 tracking-wider text-center">
              Hakuna Matata !
            </Text>
            <Text className="text-[11px] font-semibold text-neutral-400 mt-1">
              You're all caught up
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
