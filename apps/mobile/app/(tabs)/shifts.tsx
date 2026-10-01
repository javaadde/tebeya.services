import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Navigation,
  XCircle,
  Shirt,
  AlertTriangle,
} from 'lucide-react-native';
import { CateringEvent, Booking } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { EmptyState } from '../../src/components/layout/EmptyState';
import { SlotBadge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { eventsApi } from '../../src/api/events.api';
import { CONFIG } from '../../src/constants/config';

export default function MyShiftsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'confirmed' | 'waitlisted'>('confirmed');

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => eventsApi.getMyBookings(),
  });

  const leaveMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.leaveEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Shift Cancelled', 'You have been removed from this shift roster.');
    },
    onError: (err: Error) => {
      Alert.alert('Unable to Cancel Shift', err.message);
    },
  });

  const handleOpenMaps = (address: string, lat?: number, lng?: number) => {
    let url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    if (lat && lng) {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open map application.');
    });
  };

  const handleCallCoordinator = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to place phone call.');
    });
  };

  const handleLeaveShift = (event: CateringEvent) => {
    // Check cancellation cutoff (e.g. 24 hours before start)
    const eventDateTime = new Date(`${event.date}T${event.startTime}:00`);
    const now = new Date();
    const hoursRemaining = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < CONFIG.CANCELLATION_CUTOFF_HOURS) {
      Alert.alert(
        'Late Cancellation Cutoff Passed',
        `Cancellations within ${CONFIG.CANCELLATION_CUTOFF_HOURS} hours of shift start cannot be made in the app. Please contact your coordinator directly.`,
        [
          { text: 'OK' },
          event.contactPerson?.phone
            ? {
                text: 'Call Coordinator',
                onPress: () => handleCallCoordinator(event.contactPerson!.phone),
              }
            : { text: 'Dismiss' },
        ]
      );
      return;
    }

    Alert.alert(
      'Leave Shift Confirmation',
      `Are you sure you want to cancel your shift at "${event.title}"? Your spot will be offered to the waitlist.`,
      [
        { text: 'Keep Shift', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: () => leaveMutation.mutate(event.id),
        },
      ]
    );
  };

  const confirmedEvents = (data?.events || []).filter((e) => {
    const booking = data?.bookings?.find((b) => b.eventId === e.id);
    return booking?.status === 'confirmed';
  });

  const waitlistedEvents = (data?.events || []).filter((e) => {
    const booking = data?.bookings?.find((b) => b.eventId === e.id);
    return booking?.status === 'waitlisted';
  });

  const displayList = activeTab === 'confirmed' ? confirmedEvents : waitlistedEvents;

  return (
    <ScreenWrapper>
      <Header title="My Shifts" />

      {/* Segmented Filter */}
      <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row">
        <TouchableOpacity
          onPress={() => setActiveTab('confirmed')}
          className={`flex-1 py-2 rounded-xl items-center mr-2 border ${
            activeTab === 'confirmed'
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'confirmed' ? 'text-white' : 'text-slate-600'
            }`}
          >
            Confirmed ({confirmedEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('waitlisted')}
          className={`flex-1 py-2 rounded-xl items-center border ${
            activeTab === 'waitlisted'
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'waitlisted' ? 'text-white' : 'text-slate-600'
            }`}
          >
            Waitlisted ({waitlistedEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#4f46e5']}
          />
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <SlotBadge slot={item.slot} />
              <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Text className="text-xs font-bold text-emerald-700">
                  {activeTab === 'confirmed' ? 'Confirmed Shift' : 'Waitlisted'}
                </Text>
              </View>
            </View>

            <Text className="text-lg font-bold text-slate-900 mb-2">
              {item.title}
            </Text>

            {/* Timing & Reporting notice */}
            <View className="bg-amber-50/70 p-3 rounded-xl mb-3 border border-amber-200/70">
              <View className="flex-row items-center mb-1">
                <Clock size={15} color="#d97706" />
                <Text className="text-xs font-bold text-amber-900 ml-1.5">
                  Reporting Time: 30 mins before shift start
                </Text>
              </View>
              <Text className="text-xs text-amber-800">
                Shift: {item.date} • {item.startTime} to {item.endTime}
              </Text>
            </View>

            {/* Venue & Dress Code */}
            <View className="space-y-1.5 mb-4">
              <View className="flex-row items-center">
                <MapPin size={15} color="#64748b" />
                <Text className="text-xs text-slate-700 ml-1.5 flex-1" numberOfLines={2}>
                  {item.venue.text}
                </Text>
              </View>

              {item.dressCode && (
                <View className="flex-row items-center mt-1">
                  <Shirt size={15} color="#64748b" />
                  <Text className="text-xs text-slate-700 ml-1.5 flex-1" numberOfLines={1}>
                    Dress Code: {item.dressCode}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Row */}
            <View className="flex-row space-x-2 pt-2 border-t border-slate-100">
              <TouchableOpacity
                onPress={() => handleOpenMaps(item.venue.text, item.venue.lat, item.venue.lng)}
                className="flex-1 flex-row items-center justify-center bg-slate-100 py-2.5 px-3 rounded-xl mr-2"
              >
                <Navigation size={14} color="#334155" />
                <Text className="text-xs font-bold text-slate-700 ml-1.5">
                  Directions
                </Text>
              </TouchableOpacity>

              {item.contactPerson?.phone && (
                <TouchableOpacity
                  onPress={() => handleCallCoordinator(item.contactPerson!.phone)}
                  className="flex-1 flex-row items-center justify-center bg-slate-100 py-2.5 px-3 rounded-xl mr-2"
                >
                  <Phone size={14} color="#334155" />
                  <Text className="text-xs font-bold text-slate-700 ml-1.5">
                    Coordinator
                  </Text>
                </TouchableOpacity>
              )}

              {activeTab === 'confirmed' && (
                <TouchableOpacity
                  onPress={() => handleLeaveShift(item)}
                  className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 items-center justify-center"
                >
                  <XCircle size={16} color="#e11d48" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={activeTab === 'confirmed' ? 'No Confirmed Shifts' : 'No Waitlisted Shifts'}
              description={
                activeTab === 'confirmed'
                  ? "You haven't joined any upcoming catering shifts yet. Visit the Discover tab to find available slots."
                  : 'You are not currently on any waitlists.'
              }
              actionTitle="Discover Shifts"
              onAction={() => router.push('/(tabs)')}
            />
          ) : null
        }
      />
    </ScreenWrapper>
  );
}
