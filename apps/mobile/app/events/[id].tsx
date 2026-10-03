import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AltArrowLeftOutlineIcon,
  HeartBoldIcon,
  HeartOutlineIcon,
  StarBoldIcon,
  ClockCircleOutlineIcon,
  MapPointOutlineIcon,
  Routing2OutlineIcon,
  UsersGroupRoundedOutlineIcon,
  TShirtOutlineIcon,
  PhoneCallingOutlineIcon,
  CheckCircleBoldIcon,
  WalletMoneyOutlineIcon,
} from '@solar-icons/react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { SlotBadge } from '../../src/components/ui/Badge';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { DoubleBookingModal } from '../../src/components/feedback/DoubleBookingModal';
import { ClashAlertModal } from '../../src/components/feedback/ClashAlertModal';
import { eventsApi } from '../../src/api/events.api';
import { evaluateScheduleClash } from '../../src/utils/clashEngine';
import { CONFIG } from '../../src/constants/config';
import { getSlotImage, BUFFET_IMAGE } from '../../src/utils/slotImages';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [isFavorite, setIsFavorite] = useState(false);
  const [doubleBookingModalVisible, setDoubleBookingModalVisible] = useState(false);
  const [clashModalVisible, setClashModalVisible] = useState(false);
  const [clashMessage, setClashMessage] = useState('');

  const { data: event, isLoading } = useQuery<EventWithStaffMeta>({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEventById(id as string),
    enabled: !!id,
  });

  const { data: myBookingsData } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => eventsApi.getMyBookings(),
  });

  const joinMutation = useMutation({
    mutationFn: (acknowledgedDoubleBooking: boolean = false) =>
      eventsApi.joinEvent(id as string, { acknowledgedDoubleBooking }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setDoubleBookingModalVisible(false);
      Alert.alert('Shift Confirmed!', 'You have successfully joined this catering shift.');
    },
    onError: (err: any) => {
      setDoubleBookingModalVisible(false);
      Alert.alert('Booking Error', err.message || 'Unable to join shift.');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => eventsApi.leaveEvent(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      Alert.alert('Shift Cancelled', 'You have been removed from this shift roster.');
    },
    onError: (err: any) => {
      Alert.alert('Cancellation Error', err.message || 'Unable to cancel shift.');
    },
  });

  if (isLoading || !event) {
    return (
      <View className="flex-1 bg-[#d9d9d9] items-center justify-center">
        <ActivityIndicator size="large" color="#df3b20" />
      </View>
    );
  }

  const isJoined =
    event.isJoined ||
    myBookingsData?.bookings?.some(
      (b) => b.eventId === event.id && b.status === 'confirmed'
    );

  const isFull = event.filledCount >= event.headcount;
  const spotsLeft = Math.max(0, event.headcount - event.filledCount);
  const totalPay = (event.payPerPerson || 0) + (event.estimatedPayout || 0);

  const heroImage = event.imageUrl
    ? { uri: event.imageUrl }
    : (BUFFET_IMAGE || getSlotImage(event.slot, event.startTime));

  const handleInitiateJoin = () => {
    const confirmedEvents = (myBookingsData?.events || []).filter((e) => {
      const b = myBookingsData?.bookings?.find((bk) => bk.eventId === e.id);
      return b?.status === 'confirmed';
    });

    const clashResult = evaluateScheduleClash(event, confirmedEvents);

    if (!clashResult.canJoin) {
      setClashMessage(clashResult.message || 'Cannot join due to schedule clash.');
      setClashModalVisible(true);
      return;
    }

    joinMutation.mutate(false);
  };

  const handleConfirmDoubleBooking = () => {
    joinMutation.mutate(true);
  };

  const handleLeave = () => {
    const eventDateTime = new Date(`${event.date}T${event.startTime}:00`);
    const now = new Date();
    const hoursRemaining = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < CONFIG.CANCELLATION_CUTOFF_HOURS) {
      Alert.alert(
        'Late Cancellation Cutoff Passed',
        `Cancellations within ${CONFIG.CANCELLATION_CUTOFF_HOURS} hours of shift start cannot be made in the app. Please contact your coordinator.`,
        [
          { text: 'OK' },
          event.contactPerson?.phone
            ? {
                text: 'Call Coordinator',
                onPress: () => Linking.openURL(`tel:${event.contactPerson!.phone}`),
              }
            : { text: 'Dismiss' },
        ]
      );
      return;
    }

    Alert.alert(
      'Leave Shift Confirmation',
      'Are you sure you want to cancel your booking for this shift?',
      [
        { text: 'Keep Shift', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: () => leaveMutation.mutate(),
        },
      ]
    );
  };

  const formattedDate = (() => {
    try {
      const d = new Date(event.date);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return event.date;
    }
  })();

  return (
    <View className="flex-1 bg-[#d9d9d9]">
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        bounces={false}
      >
        {/* Top Hero Image Header with Curved Bottom Edge */}
        <View className="relative w-full h-[280px] overflow-hidden rounded-b-[36px] bg-neutral-900 shadow-sm">
          <Image
            source={heroImage}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Overlaid Circular Controls (Back & Favorite) */}
          <View
            style={{ paddingTop: Math.max(insets.top, 24) + 6 }}
            className="absolute left-4 right-4 flex-row items-center justify-between"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.85}
              className="w-11 h-11 rounded-full bg-white/95 items-center justify-center shadow-md active:scale-95"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AltArrowLeftOutlineIcon size={22} color="#1c1b1f" strokeWidth={2.2} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}
              activeOpacity={0.85}
              className="w-11 h-11 rounded-full bg-white/95 items-center justify-center shadow-md active:scale-95"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isFavorite ? (
                <HeartBoldIcon size={20} color="#df3b20" />
              ) : (
                <HeartOutlineIcon size={20} color="#df3b20" strokeWidth={2.2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Details Section matching wireframe pills & cards */}
        <View className="px-4 pt-3.5">
          {/* Pill Row 1: Event Title (Left Pill) & Price (Right Pill) */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-2.5 bg-[#d7b3ad]/40 border border-[#d7b3ad]/70 rounded-2xl px-4 py-2.5 flex-row items-center justify-between">
              <Text numberOfLines={1} className="text-sm font-black text-neutral-900 flex-1 mr-2">
                {event.title}
              </Text>
              <SlotBadge slot={event.slot} />
            </View>

            <View className="bg-[#d7b3ad]/40 border border-[#d7b3ad]/70 rounded-2xl px-3.5 py-2.5 items-center justify-center min-w-[80px]">
              <Text className="text-sm font-black text-[#df3b20]">
                ₹{totalPay || event.payPerPerson}
              </Text>
            </View>
          </View>

          {/* Pill Row 2: Full-width Meta Bar (Date, Time, Rating) */}
          <View className="w-full bg-[#d7b3ad]/40 border border-[#d7b3ad]/70 rounded-2xl px-4 py-2.5 flex-row items-center justify-between mb-3.5">
            <View className="flex-row items-center">
              <ClockCircleOutlineIcon size={15} color="#df3b20" strokeWidth={2} />
              <Text className="text-xs font-bold text-neutral-800 ml-1.5">
                {formattedDate} · {event.startTime} - {event.endTime}
              </Text>
            </View>
            <View className="flex-row items-center">
              <StarBoldIcon size={13} color="#df3b20" />
              <Text className="text-xs font-black text-neutral-900 ml-1">4.8</Text>
              <Text className="text-[11px] font-semibold text-neutral-600 ml-0.5">(194)</Text>
            </View>
          </View>

          {/* Center Card 1: Shift Schedule & Venue (White Card 1 from wireframe) */}
          <View className="bg-white rounded-[26px] p-4.5 mb-3 shadow-sm border border-white/60">
            {isJoined && (
              <View className="flex-row items-center bg-[#fdece8] border border-[#fad4cc] p-2.5 rounded-xl mb-3">
                <CheckCircleBoldIcon size={16} color="#df3b20" />
                <Text className="text-xs font-bold text-[#df3b20] ml-2 flex-1">
                  You are confirmed on this roster
                </Text>
              </View>
            )}

            {/* Timing summary */}
            <View className="flex-row items-center justify-between pb-3 border-b border-neutral-100">
              <View className="flex-row items-center flex-1">
                <View className="w-8 h-8 rounded-xl bg-neutral-100 items-center justify-center mr-2.5">
                  <ClockCircleOutlineIcon size={17} color="#df3b20" strokeWidth={2} />
                </View>
                <View>
                  <Text className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Shift Hours
                  </Text>
                  <Text className="text-xs font-black text-neutral-900 mt-0.5">
                    {event.startTime} - {event.endTime}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                  Date
                </Text>
                <Text className="text-xs font-bold text-neutral-800 mt-0.5">
                  {formattedDate}
                </Text>
              </View>
            </View>

            {/* Venue & Maps Navigation */}
            <View className="pt-3">
              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-xl bg-neutral-100 items-center justify-center mr-2.5 mt-0.5">
                  <MapPointOutlineIcon size={17} color="#df3b20" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Venue Address
                  </Text>
                  <Text className="text-xs font-bold text-neutral-800 leading-4 mt-0.5">
                    {event.venue.text}
                  </Text>

                  {event.distanceKm !== undefined && (
                    <Text className="text-[11px] font-bold text-[#df3b20] mt-1">
                      {event.distanceKm} km from your registered address
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          event.venue.text
                        )}`
                      )
                    }
                    className="flex-row items-center mt-2"
                  >
                    <Routing2OutlineIcon size={14} color="#df3b20" strokeWidth={2} />
                    <Text className="text-xs font-bold text-[#df3b20] ml-1">
                      Open in Google Maps
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Center Card 2: Headcount Capacity & Requirements (White Card 2 from wireframe) */}
          <View className="bg-white rounded-[26px] p-4.5 mb-4 shadow-sm border border-white/60">
            {/* Headcount Capacity */}
            <View className="mb-3.5">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-xl bg-neutral-100 items-center justify-center mr-2.5">
                    <UsersGroupRoundedOutlineIcon size={16} color="#df3b20" strokeWidth={2} />
                  </View>
                  <Text className="text-xs font-bold text-neutral-800">
                    Headcount Capacity
                  </Text>
                </View>
                <Text className="text-xs font-bold text-neutral-700">
                  {spotsLeft} Spots Left
                </Text>
              </View>
              <ProgressBar current={event.filledCount} total={event.headcount} />
            </View>

            {/* Pay Breakdown */}
            <View className="bg-neutral-50 rounded-xl p-3 flex-row items-center justify-between border border-neutral-100 mb-3">
              <View className="flex-row items-center">
                <WalletMoneyOutlineIcon size={16} color="#df3b20" strokeWidth={2} />
                <View className="ml-2">
                  <Text className="text-[11px] font-bold text-neutral-700">
                    Base Pay: ₹{event.payPerPerson}
                  </Text>
                  {event.estimatedPayout ? (
                    <Text className="text-[10px] font-semibold text-neutral-500">
                      + ₹{event.estimatedPayout} Travel Allowance
                    </Text>
                  ) : null}
                </View>
              </View>
              <Text className="text-xs font-black text-neutral-900">
                ₹{totalPay || event.payPerPerson} Net
              </Text>
            </View>

            {/* Dress Code */}
            {event.dressCode && (
              <View className="flex-row items-start pt-3 border-t border-neutral-100">
                <View className="w-8 h-8 rounded-xl bg-neutral-100 items-center justify-center mr-2.5 mt-0.5">
                  <TShirtOutlineIcon size={16} color="#df3b20" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-neutral-800">Dress Code</Text>
                  <Text className="text-xs text-neutral-600 mt-0.5 leading-4">
                    {event.dressCode}
                  </Text>
                </View>
              </View>
            )}

            {/* Shift Coordinator */}
            {event.contactPerson?.phone && (
              <View className="flex-row items-center justify-between pt-3 mt-3 border-t border-neutral-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-xl bg-neutral-100 items-center justify-center mr-2.5">
                    <PhoneCallingOutlineIcon size={16} color="#df3b20" strokeWidth={2} />
                  </View>
                  <View>
                    <Text className="text-xs font-bold text-neutral-800">Coordinator</Text>
                    <Text className="text-xs text-neutral-500">
                      {event.contactPerson.name} ({event.contactPerson.phone})
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${event.contactPerson!.phone}`)}
                  className="w-9 h-9 rounded-full bg-neutral-100 items-center justify-center active:scale-95"
                >
                  <PhoneCallingOutlineIcon size={15} color="#201d1e" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Centered Rounded Pill Button (Matching exact button in user mockup) */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 4 }}
        className="absolute bottom-0 left-0 right-0 items-center px-6 pt-2"
        pointerEvents="box-none"
      >
        {isJoined ? (
          <TouchableOpacity
            onPress={handleLeave}
            disabled={leaveMutation.isPending}
            activeOpacity={0.88}
            className="w-full max-w-[320px] h-[50px] rounded-full bg-neutral-900 items-center justify-center shadow-lg active:scale-[0.98]"
          >
            {leaveMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-sm font-extrabold text-white tracking-wide">
                Cancel Booking / Leave Shift
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleInitiateJoin}
            disabled={joinMutation.isPending || isFull}
            activeOpacity={0.88}
            className={`w-full max-w-[320px] h-[50px] rounded-full items-center justify-center shadow-lg active:scale-[0.98] ${
              isFull ? 'bg-neutral-400' : 'bg-[#df3b20]'
            }`}
          >
            {joinMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-sm font-extrabold text-white tracking-wide">
                {isFull
                  ? 'Shift Full (Join Waitlist)'
                  : `Confirm & Join Shift (₹${totalPay || event.payPerPerson})`}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Double Booking Modal */}
      <DoubleBookingModal
        visible={doubleBookingModalVisible}
        eventTitle={event.title}
        onConfirm={handleConfirmDoubleBooking}
        onCancel={() => setDoubleBookingModalVisible(false)}
        loading={joinMutation.isPending}
      />

      {/* Clash Alert Modal */}
      <ClashAlertModal
        visible={clashModalVisible}
        message={clashMessage}
        onClose={() => setClashModalVisible(false)}
      />
    </View>
  );
}
