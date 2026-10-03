import React, { useMemo } from 'react';
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
import { CalendarDays, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { EventCard } from '../../src/components/events/EventCard';
import { EventSliderCard } from '../../src/components/events/EventSliderCard';
import { useAuthStore } from '../../src/store/authStore';
import { eventsApi } from '../../src/api/events.api';

export default function HomeFeedScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

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

  // Split into today's events and future events
  const todayEvents = useMemo(
    () => upcomingEvents.filter((e) => e.date === todayIso),
    [upcomingEvents, todayIso]
  );

  const futureEvents = useMemo(
    () => upcomingEvents.filter((e) => e.date > todayIso),
    [upcomingEvents, todayIso]
  );

  // Determine greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning !';
    if (hour < 17) return 'Good Afternoon !';
    return 'Good Evening !';
  }, []);

  return (
    <ScreenWrapper className="px-4">
      {/* Header: Avatar, Greeting, Name, Notification */}
      <AppTopHeader
        mode="user"
        subtitle={greeting}
        title={user?.name || 'Staff'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#df3b20']}
            tintColor="#df3b20"
          />
        }
      >
        {/* One-per-day Info Banner */}
        {hasBookingToday && (
          <View className="bg-[#fdece8] rounded-2xl p-4 mb-4 flex-row items-center border border-[#fad4cc]">
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

        {/* Horizontal Slider: Featured / Today's Shifts Carousel */}
        {!isLoading && upcomingEvents.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3 mt-1">
              <View className="flex-row items-center">
                <Sparkles size={16} color="#df3b20" />
                <Text className="text-sm font-black text-neutral-900 ml-2 tracking-tight">
                  Featured Shifts
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/shifts')}
                className="flex-row items-center"
              >
                <Text className="text-xs font-bold text-[#df3b20] mr-0.5">
                  View All
                </Text>
                <ChevronRight size={14} color="#df3b20" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 4, paddingVertical: 2 }}
            >
              {upcomingEvents.slice(0, 6).map((event) => (
                <EventSliderCard
                  key={event.id}
                  event={event}
                  isToday={event.date === todayIso}
                  onPress={() => router.push(`/events/${event.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Upcoming Shifts Vertical Section */}
        {upcomingEvents.length > 0 && (
          <>
            <View className="flex-row items-center mb-3 mt-2">
              <CalendarDays size={16} color="#64748b" />
              <Text className="text-sm font-black text-neutral-900 ml-2 tracking-tight">
                All Available Shifts
              </Text>
            </View>
            <View className="pt-0.5">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => router.push(`/events/${event.id}`)}
                />
              ))}
            </View>
          </>
        )}

        {/* Empty State */}
        {!isLoading && upcomingEvents.length === 0 && (
          <View className="bg-white rounded-[28px] p-10 items-center justify-center my-8 shadow-sm border border-white/50">
            <CalendarDays size={48} color="#d4d4d8" />
            <Text className="text-base font-bold text-neutral-800 mt-4">
              No Upcoming Shifts
            </Text>
            <Text className="text-xs text-neutral-500 text-center mt-1.5 leading-4">
              New shifts will appear here when published.{'\n'}
              Pull down to refresh.
            </Text>
          </View>
        )}

        {/* End-of-list quote */}
        {upcomingEvents.length > 0 && (
          <View className="items-center justify-center pt-8 pb-4">
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
