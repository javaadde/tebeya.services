import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  CalendarSearch,
  Clock,
  Check,
  MapPin,
  CalendarCheck,
  History,
} from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
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

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
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
      setConfirmModalVisible(false);
      setDoubleBookingModalVisible(false);
      Alert.alert('Shift Confirmed!', 'You have successfully joined this catering shift.');
    },
    onError: (err: any) => {
      setConfirmModalVisible(false);
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
      <View className="flex-1 bg-[#e3e3e3] items-center justify-center">
        <ActivityIndicator size="large" color="#598A31" />
      </View>
    );
  }

  const isJoined =
    event.isJoined ||
    myBookingsData?.bookings?.some(
      (b) => b.eventId === event.id && b.status === 'confirmed'
    );

  const isFull = event.filledCount >= event.headcount;

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

    setConfirmModalVisible(true);
  };

  const confirmAttendance = () => {
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
        [{ text: 'OK' }]
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
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return event.date;
    }
  })();

  const venueName = event.venue?.text?.split(',')[0] || 'The Deck';

  return (
    <View className="flex-1 bg-[#e3e3e3]">
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        bounces={false}
      >
        {/* Top Hero Image Header with Curved Bottom Edge */}
        <View className="w-full h-[280px] overflow-hidden rounded-b-[40px] bg-neutral-900 shadow-sm relative">
          <Image
            source={heroImage}
            className="w-full h-full opacity-90"
            resizeMode="cover"
          />
        </View>

        <View className="px-5 pt-5">
          <Text className="text-3xl font-bold text-neutral-900 mb-4">{event.title}</Text>

          {/* Date & Time Cards side by side */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 bg-white rounded-full p-2 pr-4 flex-row items-center mr-2 shadow-sm">
              <View className="w-12 h-12 bg-[#598A31] rounded-full items-center justify-center mr-3">
                <CalendarSearch color="white" size={24} />
              </View>
              <View>
                <Text className="text-neutral-500 text-xs font-semibold mb-0.5">Date</Text>
                <Text className="text-neutral-900 font-bold text-sm">{formattedDate}</Text>
              </View>
            </View>

            <View className="flex-1 bg-white rounded-full p-2 pr-4 flex-row items-center ml-2 shadow-sm">
              <View className="w-12 h-12 bg-[#598A31] rounded-full items-center justify-center mr-3">
                <Clock color="white" size={24} />
              </View>
              <View>
                <Text className="text-neutral-500 text-xs font-semibold mb-0.5">Time</Text>
                <Text className="text-neutral-900 font-bold text-sm">{event.startTime}</Text>
              </View>
            </View>
          </View>

          {/* Description Card */}
          <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
            <Text className="text-neutral-900 font-bold text-[19px] mb-2">{venueName}</Text>
            <Text className="text-neutral-500 text-sm leading-5">
              Experience the breathtaking ocean views while enjoying our signature international buffet. The Deck offers an unparalleled dining experience...
            </Text>
          </View>

          {/* What to Expect Card */}
          <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm">
            <Text className="text-neutral-900 font-bold text-[19px] mb-4">What to Expect</Text>
            <View className="flex-row items-center mb-3">
              <Check color="#598A31" size={18} strokeWidth={3} />
              <Text className="text-neutral-600 text-[15px] ml-3">Live Music Performance</Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Check color="#598A31" size={18} strokeWidth={3} />
              <Text className="text-neutral-600 text-[15px] ml-3">Unlimited Soft Drinks</Text>
            </View>
            <View className="flex-row items-center">
              <Check color="#598A31" size={18} strokeWidth={3} />
              <Text className="text-neutral-600 text-[15px] ml-3">Complimentary Parking</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Button */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 4 }}
        className="absolute bottom-0 left-0 right-0 px-6 pt-2"
        pointerEvents="box-none"
      >
        {isJoined ? (
          <TouchableOpacity
            onPress={handleLeave}
            disabled={leaveMutation.isPending}
            activeOpacity={0.88}
            className="w-full h-14 rounded-full bg-neutral-900 items-center justify-center shadow-lg"
          >
            {leaveMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-bold text-white">Leave Event</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleInitiateJoin}
            disabled={joinMutation.isPending || isFull}
            activeOpacity={0.88}
            className={`w-full h-14 rounded-full items-center justify-center shadow-lg ${
              isFull ? 'bg-neutral-400' : 'bg-[#598A31]'
            }`}
          >
            {joinMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-bold text-white">
                {isFull ? 'Shift Full' : 'Join the Event'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-10">
            <Text className="text-[22px] font-bold text-center text-neutral-900 mb-1">
              Confirm Attendance
            </Text>
            <Text className="text-[15px] font-semibold text-neutral-500 text-center mb-8">
              {event.title}
            </Text>

            <View className="space-y-6 px-2 mb-10">
              <View className="flex-row items-center">
                <View className="w-[52px] h-[52px] rounded-full bg-[#a3b899] items-center justify-center mr-4">
                  <CalendarCheck color="white" size={26} strokeWidth={2} />
                </View>
                <View>
                  <Text className="text-neutral-500 text-[11px] font-bold tracking-widest mb-0.5">DATE</Text>
                  <Text className="text-neutral-900 text-base font-bold">{formattedDate}</Text>
                </View>
              </View>

              <View className="flex-row items-center mt-6">
                <View className="w-[52px] h-[52px] rounded-full bg-[#a3b899] items-center justify-center mr-4">
                  <History color="white" size={26} strokeWidth={2} />
                </View>
                <View>
                  <Text className="text-neutral-500 text-[11px] font-bold tracking-widest mb-0.5">TIME</Text>
                  <Text className="text-neutral-900 text-base font-bold">{event.startTime}</Text>
                </View>
              </View>

              <View className="flex-row items-center mt-6">
                <View className="w-[52px] h-[52px] rounded-full bg-[#a3b899] items-center justify-center mr-4">
                  <MapPin color="white" size={26} strokeWidth={2} />
                </View>
                <View>
                  <Text className="text-neutral-500 text-[11px] font-bold tracking-widest mb-0.5">LOCATION</Text>
                  <Text className="text-neutral-900 text-base font-bold">{venueName}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setConfirmModalVisible(false)}
              className="w-full h-[54px] rounded-full border border-neutral-200 items-center justify-center mb-4 bg-white"
            >
              <Text className="text-neutral-600 text-base font-bold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmAttendance}
              disabled={joinMutation.isPending}
              className="w-full h-[54px] rounded-full bg-[#598A31] items-center justify-center shadow-sm"
            >
              {joinMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-bold">Confirm Attendance</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
