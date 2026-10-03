import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  MapPin,
  Phone,
  Shirt,
  Info,
  IndianRupee,
  Navigation,
  CheckCircle2,
  Users,
  ChevronLeft,
  ArrowUpRight,
} from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { SlotBadge } from '../../src/components/ui/Badge';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button } from '../../src/components/ui/Button';
import { DoubleBookingModal } from '../../src/components/feedback/DoubleBookingModal';
import { ClashAlertModal } from '../../src/components/feedback/ClashAlertModal';
import { eventsApi } from '../../src/api/events.api';
import { evaluateScheduleClash } from '../../src/utils/clashEngine';
import { CONFIG } from '../../src/constants/config';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

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
      <ScreenWrapper className="items-center justify-center">
        <ActivityIndicator size="large" color="#df3b20" />
      </ScreenWrapper>
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

    // With 1-per-day rule, no double-booking scenario is possible
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

  return (
    <ScreenWrapper className="px-4">
      {/* Top Header matching design reference */}
      <View className="flex-row items-center justify-between pt-2 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color="#201d1e" />
        </TouchableOpacity>

        <Text className="text-base font-black text-neutral-900 tracking-tight">
          Shift Details
        </Text>

        <View className="w-12 h-12 rounded-full bg-[#df3b20] items-center justify-center shadow-sm">
          <ArrowUpRight size={22} color="#ffffff" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Main Details Card */}
        <View className="bg-white rounded-[28px] p-5 mb-3.5 shadow-sm border border-white/50">
          <View className="flex-row justify-between items-center mb-3">
            <SlotBadge slot={event.slot} />
            <View className="bg-[#f1f2f2] px-3 py-1 rounded-full">
              <Text className="text-xs font-bold text-neutral-700">
                {event.date}
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-black text-neutral-900 mb-2 leading-7">
            {event.title}
          </Text>

          {isJoined && (
            <View className="flex-row items-center bg-[#fdece8] border border-[#fad4cc] p-3 rounded-2xl my-2">
              <CheckCircle2 size={18} color="#df3b20" />
              <Text className="text-xs font-bold text-[#df3b20] ml-2 flex-1">
                You are confirmed on this roster
              </Text>
            </View>
          )}

          {/* Wage Card */}
          <View className="bg-[#f1f2f2] rounded-2xl p-4 my-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                Total Estimated Pay
              </Text>
              <View className="flex-row items-center">
                <IndianRupee size={18} color="#df3b20" />
                <Text className="text-xl font-black text-neutral-900">
                  ₹{totalPay || event.payPerPerson}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between pt-2 mt-2 border-t border-neutral-200/80">
              <Text className="text-[11px] text-neutral-500">
                Base Shift: ₹{event.payPerPerson}
              </Text>
              {event.estimatedPayout ? (
                <Text className="text-[11px] font-bold text-[#df3b20]">
                  + ₹{event.estimatedPayout} Travel Bonus
                </Text>
              ) : null}
            </View>
          </View>

          {/* Timing & Venue */}
          <View className="space-y-3 pt-2">
            <View className="flex-row items-center">
              <Clock size={16} color="#64748b" />
              <Text className="text-xs font-bold text-neutral-800 ml-2">
                {event.startTime} - {event.endTime}
              </Text>
            </View>

            <View className="flex-row items-start mt-2">
              <MapPin size={16} color="#64748b" className="mt-0.5" />
              <View className="ml-2 flex-1">
                <Text className="text-xs text-neutral-700 leading-4">
                  {event.venue.text}
                </Text>
                {event.distanceKm !== undefined && (
                  <Text className="text-[11px] font-bold text-[#df3b20] mt-0.5">
                    {event.distanceKm} km from your home location
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.text)}`
                    )
                  }
                  className="flex-row items-center mt-1.5"
                >
                  <Navigation size={12} color="#df3b20" />
                  <Text className="text-xs font-bold text-[#df3b20] ml-1">
                    Open in Maps
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Capacity Card */}
        <View className="bg-white rounded-[28px] p-5 mb-3.5 shadow-sm border border-white/50">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Users size={16} color="#64748b" />
              <Text className="text-xs font-bold text-neutral-800 ml-1.5">
                Headcount Capacity
              </Text>
            </View>
            <Text className="text-xs font-bold text-neutral-700">
              {spotsLeft} Spots Left
            </Text>
          </View>
          <ProgressBar current={event.filledCount} total={event.headcount} />
        </View>

        {/* Dress Code & Supervisor Notes */}
        <View className="bg-white rounded-[28px] p-5 mb-5 shadow-sm border border-white/50 space-y-3">
          {event.dressCode && (
            <View className="flex-row items-start">
              <Shirt size={16} color="#64748b" className="mt-0.5" />
              <View className="ml-2 flex-1">
                <Text className="text-xs font-bold text-neutral-800">Dress Code</Text>
                <Text className="text-xs text-neutral-600 mt-0.5 leading-4">
                  {event.dressCode}
                </Text>
              </View>
            </View>
          )}

          {event.contactPerson?.phone && (
            <View className="flex-row items-center justify-between pt-3 mt-3 border-t border-neutral-100">
              <View>
                <Text className="text-xs font-bold text-neutral-800">Coordinator</Text>
                <Text className="text-xs text-neutral-500">
                  {event.contactPerson.name} ({event.contactPerson.phone})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${event.contactPerson!.phone}`)}
                className="w-10 h-10 rounded-full bg-[#f1f2f2] items-center justify-center"
              >
                <Phone size={16} color="#201d1e" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Main Action Button */}
        {isJoined ? (
          <Button
            title="Cancel Booking / Leave Shift"
            onPress={handleLeave}
            variant="secondary"
            size="lg"
            loading={leaveMutation.isPending}
          />
        ) : (
          <Button
            title={isFull ? 'Shift Full (Join Waitlist)' : `Confirm & Join Shift (₹${totalPay || event.payPerPerson})`}
            onPress={handleInitiateJoin}
            variant="primary"
            size="lg"
            loading={joinMutation.isPending}
          />
        )}
      </ScrollView>

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
    </ScreenWrapper>
  );
}
