import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Shirt,
  Info,
  IndianRupee,
  Navigation,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
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

  // Modals state
  const [doubleBookingModalVisible, setDoubleBookingModalVisible] = useState(false);
  const [clashModalVisible, setClashModalVisible] = useState(false);
  const [clashMessage, setClashMessage] = useState('');

  // Fetch event details
  const { data: event, isLoading } = useQuery<EventWithStaffMeta>({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEventById(id as string),
    enabled: !!id,
  });

  // Fetch existing user bookings to perform client clash pre-check (Rule 2)
  const { data: myBookingsData } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => eventsApi.getMyBookings(),
  });

  // Join Event Mutation
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

  // Leave Event Mutation
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
        <ActivityIndicator size="large" color="#4f46e5" />
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

  // Initiates Join Shift with Guardrails (Rule 2)
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

    if (clashResult.isSecondShiftOfDay) {
      // Prompt Mandatory Double-Booking Confirmation Modal (FR-12)
      setDoubleBookingModalVisible(true);
    } else {
      joinMutation.mutate(false);
    }
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
    <ScreenWrapper scrollable>
      <Header title="Shift Details" showBack />

      <View className="p-4">
        {/* Slot & Date Badge Bar */}
        <View className="flex-row justify-between items-center mb-3">
          <SlotBadge slot={event.slot} />
          <View className="bg-slate-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-bold text-slate-700">
              {event.date}
            </Text>
          </View>
        </View>

        {/* Shift Title */}
        <Text className="text-2xl font-black text-slate-900 mb-3 leading-7">
          {event.title}
        </Text>

        {/* Shift Joined Banner */}
        {isJoined && (
          <View className="flex-row items-center bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl mb-4">
            <CheckCircle2 size={20} color="#059669" />
            <View className="ml-3 flex-1">
              <Text className="text-xs font-bold text-emerald-800">
                You are confirmed on this roster
              </Text>
              <Text className="text-[11px] text-emerald-600">
                Please arrive 30 mins before shift start in required dress code.
              </Text>
            </View>
          </View>
        )}

        {/* Wage Card */}
        <View className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
              Estimated Total Earnings
            </Text>
            <View className="flex-row items-center">
              <IndianRupee size={20} color="#4f46e5" />
              <Text className="text-2xl font-black text-indigo-700 ml-0.5">
                ₹{totalPay || event.payPerPerson}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between text-xs pt-2 border-t border-indigo-200/50">
            <Text className="text-xs text-slate-600">
              Base Shift Wage: ₹{event.payPerPerson}
            </Text>
            {event.estimatedPayout ? (
              <Text className="text-xs font-semibold text-emerald-700">
                + ₹{event.estimatedPayout} Travel Allowance
              </Text>
            ) : null}
          </View>
        </View>

        {/* Timing & Venue Cards */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm space-y-3">
          <View className="flex-row items-center">
            <Clock size={18} color="#4f46e5" />
            <View className="ml-3 flex-1">
              <Text className="text-xs font-medium text-slate-500">Shift Timings</Text>
              <Text className="text-sm font-bold text-slate-900">
                {event.startTime} - {event.endTime}
              </Text>
            </View>
          </View>

          <View className="h-px bg-slate-100 my-1" />

          <View className="flex-row items-start">
            <MapPin size={18} color="#4f46e5" className="mt-0.5" />
            <View className="ml-3 flex-1">
              <Text className="text-xs font-medium text-slate-500">Venue Location</Text>
              <Text className="text-sm font-bold text-slate-900">
                {event.venue.text}
              </Text>
              {event.distanceKm !== undefined && (
                <Text className="text-xs font-semibold text-indigo-600 mt-0.5">
                  {event.distanceKm} km from your home
                </Text>
              )}
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.text)}`
                  )
                }
                className="flex-row items-center mt-2"
              >
                <Navigation size={13} color="#4f46e5" />
                <Text className="text-xs font-bold text-indigo-600 ml-1">
                  Open in Maps
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Headcount Capacity */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Users size={16} color="#64748b" />
              <Text className="text-xs font-bold text-slate-700 ml-1.5">
                Staff Headcount Capacity
              </Text>
            </View>
            <Text className="text-xs font-bold text-slate-600">
              {spotsLeft} Spots Left
            </Text>
          </View>
          <ProgressBar current={event.filledCount} total={event.headcount} />
        </View>

        {/* Dress Code & Guidelines */}
        <View className="bg-white rounded-2xl p-4 mb-6 border border-slate-200 shadow-sm space-y-3">
          {event.dressCode && (
            <View className="flex-row items-start">
              <Shirt size={18} color="#64748b" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="text-xs font-medium text-slate-500">Uniform & Dress Code</Text>
                <Text className="text-xs font-semibold text-slate-800 leading-5">
                  {event.dressCode}
                </Text>
              </View>
            </View>
          )}

          {event.notes && (
            <View className="flex-row items-start pt-2 border-t border-slate-100">
              <Info size={18} color="#64748b" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="text-xs font-medium text-slate-500">Shift Notes</Text>
                <Text className="text-xs text-slate-700 leading-5">
                  {event.notes}
                </Text>
              </View>
            </View>
          )}

          {event.contactPerson?.phone && (
            <View className="flex-row items-center justify-between pt-2 border-t border-slate-100">
              <View>
                <Text className="text-xs font-medium text-slate-500">Event Coordinator</Text>
                <Text className="text-xs font-bold text-slate-800">
                  {event.contactPerson.name} ({event.contactPerson.phone})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${event.contactPerson!.phone}`)}
                className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
              >
                <Phone size={16} color="#334155" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Button */}
        {isJoined ? (
          <Button
            title="Cancel Booking / Leave Shift"
            onPress={handleLeave}
            variant="danger"
            size="lg"
            loading={leaveMutation.isPending}
          />
        ) : (
          <Button
            title={isFull ? 'Shift Full (Join Waitlist)' : `Confirm & Join Shift (₹${totalPay || event.payPerPerson})`}
            onPress={handleInitiateJoin}
            size="lg"
            loading={joinMutation.isPending}
          />
        )}
      </View>

      {/* Double Booking Confirmation Modal (FR-12) */}
      <DoubleBookingModal
        visible={doubleBookingModalVisible}
        eventTitle={event.title}
        onConfirm={handleConfirmDoubleBooking}
        onCancel={() => setDoubleBookingModalVisible(false)}
        loading={joinMutation.isPending}
      />

      {/* Clash Alert Modal (Rule 2) */}
      <ClashAlertModal
        visible={clashModalVisible}
        message={clashMessage}
        onClose={() => setClashModalVisible(false)}
      />
    </ScreenWrapper>
  );
}
