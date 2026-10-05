import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Camera, SlidersHorizontal, Sparkles } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { EventCard } from '../../src/components/events/EventCard';
import { eventsApi } from '../../src/api/events.api';
import { EventWithStaffMeta } from '@tebeya/shared';

type FilterType = 'all' | 'evening' | 'lunch' | 'breakfast';

export default function UpcomingEventsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  // Filter shifts based on booking status, unfilled capacity, and quick filters
  const displayShifts = useMemo(() => {
    const myBookedIds = new Set((myBookingsData?.events || []).map((e) => e.id));

    return allEvents
      .filter((event) => {
        const isNotFull = (event.filledCount || 0) < (event.headcount || 1);
        const isJoined = myBookedIds.has(event.id) || event.isJoined;
        if (!isNotFull && !isJoined) return false;

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
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
  }, [allEvents, myBookingsData, selectedFilter, availableOnly]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'evening', label: 'Evening' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'breakfast', label: 'Breakfast' },
  ];

  return (
    <ScreenWrapper className="px-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          if (!hasScrolled) {
            setHasScrolled(true);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }
        }}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          if (offsetY > 20 && !hasScrolled) {
            setHasScrolled(true);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#598A31']}
            tintColor="#598A31"
          />
        }
      >
        {/* Header matching Image 1: "check" / "Your Events" / Red Circular Button with Camera/Action */}
        <AppTopHeader
          subtitle="check"
          title="Your Events"
          rightIcon={<Camera size={22} color="#ffffff" strokeWidth={2.2} />}
          onRightPress={() => router.push('/notifications')}
        />

        {/* Quick Filters Row matching Image 1 */}
        <View className="flex-row items-center justify-between mb-4 mt-6">
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

          {/* Circular Action/Toggle Button matching the circle in Image 1 */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAvailableOnly((prev) => !prev)}
            className={`w-9 h-9 rounded-full items-center justify-center shadow-sm border shrink-0 ${
              availableOnly
                ? 'bg-[#598A31] border-[#598A31]'
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
        {/* Vertical Event Cards List matching Image 1 & Image 2 */}
        <View className="pt-1">
          {displayShifts.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/events/${event.id}`)}
            />
          ))}
        </View>

        {/* Empty state if no events match current filters */}
        {displayShifts.length === 0 && !isLoading && (
          <View className="bg-white rounded-[28px] p-8 items-center justify-center my-6 shadow-sm border border-white/50">
            <Sparkles size={36} color="#598A31" />
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
          <Animated.View style={{ opacity: fadeAnim }} className="items-center justify-center pt-8 pb-4">
            <Text className="text-3xl font-black text-neutral-400/80 tracking-wider text-center">
              Hakuna Matata !
            </Text>
            <Text className="text-[11px] font-semibold text-neutral-400 mt-1">
              You're all caught up with available shifts
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
