import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { ShiftCard } from '../../src/components/shifts/ShiftCard';
import { eventsApi } from '../../src/api/events.api';
import { EventWithStaffMeta } from '@tebeya/shared';

export default function UpcomingEventsScreen() {
  const router = useRouter();

  const {
    data: myBookingsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => eventsApi.getMyBookings(),
  });

  const { data: allEvents = [] } = useQuery<EventWithStaffMeta[]>({
    queryKey: ['events'],
    queryFn: () => eventsApi.getEvents(),
  });

  // Include EVERY upcoming event that is not filled yet
  const displayShifts = useMemo(() => {
    const myBookedIds = new Set((myBookingsData?.events || []).map((e) => e.id));

    return allEvents
      .filter((event) => {
        const isNotFull = (event.filledCount || 0) < (event.headcount || 1);
        const isJoined = myBookedIds.has(event.id) || event.isJoined;
        return isNotFull || isJoined;
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
  }, [allEvents, myBookingsData]);

  return (
    <ScreenWrapper className="px-4">
      {/* Header matching Image 2: "check your" / "Upcoming events" / Orange Button */}
      <AppTopHeader
        subtitle="check your"
        title="Upcoming events"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#df3b20']}
            tintColor="#df3b20"
          />
        }
      >
        {/* 2-Column Grid */}
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

        {/* Empty state if no unfilled events exist */}
        {displayShifts.length === 0 && !isLoading && (
          <View className="bg-white rounded-[26px] p-8 items-center justify-center my-6 shadow-sm border border-white/50">
            <Text className="text-base font-bold text-neutral-800">
              No Open Shifts
            </Text>
            <Text className="text-xs text-neutral-500 text-center mt-1">
              All upcoming shifts are currently filled. Check back soon!
            </Text>
          </View>
        )}

        {/* Bottom Quote: Appears when scrolling is over (end of the list) */}
        {displayShifts.length > 0 && (
          <View className="items-center justify-center pt-8 pb-4">
            <Text className="text-2xl font-black text-neutral-400/80 tracking-wider text-center">
              Hakuna Matata !
            </Text>
            <Text className="text-[11px] font-semibold text-neutral-400 mt-1">
              You're all caught up with available shifts
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
