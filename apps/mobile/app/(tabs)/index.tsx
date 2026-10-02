import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowUpRight, MapPin, Clock, IndianRupee } from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { ShiftCard } from '../../src/components/shifts/ShiftCard';
import { SlotBadge } from '../../src/components/ui/Badge';
import { useAuthStore } from '../../src/store/authStore';
import { eventsApi } from '../../src/api/events.api';

const banquetBanner = require('../../assets/banquet-banner.jpg');

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

  // Highlighted today shift or top upcoming shift for the large top card
  const featuredEvent = useMemo(() => {
    if (myBookingsData?.events?.length) {
      const todayShift = myBookingsData.events.find((e) => e.date === todayIso);
      if (todayShift) return todayShift;
    }
    return events[0] || null;
  }, [events, myBookingsData, todayIso]);

  // Remaining shifts for the 2x2 grid
  const gridEvents = useMemo(() => {
    if (!events.length) return [];
    if (featuredEvent) {
      return events.filter((e) => e.id !== featuredEvent.id).slice(0, 4);
    }
    return events.slice(0, 4);
  }, [events, featuredEvent]);

  return (
    <ScreenWrapper className="px-4">
      {/* Exact Header matching Image 1: Avatar, Good Morning !, Jude Bellingham, Orange Button */}
      <AppTopHeader
        mode="user"
        subtitle="Good Morning !"
        title={user?.name || 'Jude Bellingham'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#df3b20']}
            tintColor="#df3b20"
          />
        }
      >
        {/* Large Featured Banquet Card with User's Uploaded Image */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() =>
            featuredEvent
              ? router.push(`/events/${featuredEvent.id}`)
              : router.push('/(tabs)/shifts')
          }
          className="rounded-[30px] overflow-hidden mb-4 shadow-md bg-neutral-900 border border-white/50 relative h-64 justify-between p-5"
        >
          {/* Background Banquet Image */}
          <Image
            source={banquetBanner}
            className="absolute inset-0 w-full h-full"
            resizeMode="cover"
          />

          {/* Dark scrim gradient overlay for contrast */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(20, 18, 19, 0.42)',
            }}
          />

          {/* Top row: Badges and circular arrow */}
          <View className="flex-row items-center justify-between z-10">
            <View className="flex-row items-center">
              {featuredEvent ? (
                <SlotBadge slot={featuredEvent.slot} />
              ) : (
                <View className="bg-[#df3b20] px-3 py-1 rounded-full shadow-sm">
                  <Text className="text-xs font-black text-white uppercase tracking-wider">
                    Featured
                  </Text>
                </View>
              )}
              <View className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full ml-2 border border-white/30">
                <Text className="text-[11px] font-bold text-white">
                  {featuredEvent
                    ? featuredEvent.date === todayIso
                      ? "Today's Shift"
                      : featuredEvent.date
                    : 'Grand Banquet'}
                </Text>
              </View>
            </View>

            {/* Circular top-right arrow button matching nav bar shape */}
            <View className="w-10 h-10 rounded-full bg-white/95 items-center justify-center shadow-md">
              <ArrowUpRight size={20} color="#201d1e" />
            </View>
          </View>

          {/* Bottom details with glass card effect */}
          <View className="z-10 bg-black/50 p-4 rounded-2xl border border-white/20 backdrop-blur-md">
            <Text className="text-xl font-black text-white leading-6 mb-1.5" numberOfLines={1}>
              {featuredEvent ? featuredEvent.title : 'Luxury Banquet & Wedding Reception'}
            </Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                <MapPin size={13} color="#fca5a5" />
                <Text className="text-xs text-neutral-200 ml-1.5 font-medium" numberOfLines={1}>
                  {featuredEvent ? featuredEvent.venue.text : 'The Grand Pavilion • Banquet Hall'}
                </Text>
              </View>

              <View className="flex-row items-center bg-[#df3b20] px-3 py-1.5 rounded-xl shadow-sm">
                <IndianRupee size={13} color="#ffffff" />
                <Text className="text-xs font-black text-white ml-0.5">
                  {featuredEvent ? featuredEvent.payPerPerson : '1,200'}
                </Text>
                <Text className="text-[10px] text-white/80 ml-1 font-semibold">
                  {featuredEvent && (featuredEvent as EventWithStaffMeta).isJoined ? 'Booked' : 'shift'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2x2 Grid Section matching Image 1 */}
        <View className="flex-row flex-wrap justify-between">
          {gridEvents.map((item) => (
            <ShiftCard
              key={item.id}
              event={item}
              variant="grid"
              onPress={() => router.push(`/events/${item.id}`)}
            />
          ))}

          {/* Fallback placeholding cards if few events exist */}
          {gridEvents.length === 0 && (
            <>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="bg-white rounded-[26px] p-4 mb-3.5 justify-between relative shadow-sm border border-white/40"
                  style={{ width: '48.2%', minHeight: 145 }}
                >
                  <View className="w-8 h-8 rounded-full bg-[#f1f2f2] border border-[#e4e5e6] items-center justify-center self-end">
                    <ArrowUpRight size={16} color="#201d1e" />
                  </View>
                  <View>
                    <Text className="text-xs font-bold text-neutral-700">
                      Shift Slot #{i}
                    </Text>
                    <Text className="text-[10px] text-neutral-400 mt-1">
                      Check back for new publishings
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
