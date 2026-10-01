import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock, IndianRupee, ArrowRight } from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { SlotBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

interface ShiftCardProps {
  event: EventWithStaffMeta;
  onPress: () => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ event, onPress }) => {
  const isFull = event.filledCount >= event.headcount;
  const spotsLeft = Math.max(0, event.headcount - event.filledCount);
  const totalPay = (event.payPerPerson || 0) + (event.estimatedPayout || 0);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-4 border border-slate-200/80 shadow-sm"
    >
      {/* Top Meta Header: Slot & Date */}
      <View className="flex-row justify-between items-center mb-2.5">
        <SlotBadge slot={event.slot} />
        <View className="bg-slate-100 px-2.5 py-1 rounded-full">
          <Text className="text-xs font-semibold text-slate-700">
            {event.date}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text className="text-lg font-bold text-slate-900 mb-2 leading-6" numberOfLines={2}>
        {event.title}
      </Text>

      {/* Details: Venue & Timing */}
      <View className="space-y-1.5 mb-3">
        <View className="flex-row items-center">
          <MapPin size={15} color="#64748b" />
          <Text className="text-xs text-slate-600 ml-1.5 flex-1" numberOfLines={1}>
            {event.venue.text}
            {event.distanceKm !== undefined && (
              <Text className="font-semibold text-indigo-600"> • {event.distanceKm} km away</Text>
            )}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Clock size={15} color="#64748b" />
          <Text className="text-xs text-slate-600 ml-1.5">
            {event.startTime} - {event.endTime}
          </Text>
        </View>
      </View>

      {/* Pay Pill & Capacity Bar */}
      <View className="bg-slate-50 p-3 rounded-xl mb-3 border border-slate-100">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <IndianRupee size={16} color="#4f46e5" />
            <Text className="text-base font-extrabold text-indigo-700 ml-0.5">
              ₹{totalPay || event.payPerPerson}
            </Text>
            {event.estimatedPayout ? (
              <Text className="text-xs text-slate-500 ml-1">
                (₹{event.payPerPerson} + ₹{event.estimatedPayout} travel)
              </Text>
            ) : (
              <Text className="text-xs text-slate-500 ml-1">per person</Text>
            )}
          </View>
          <View className={`px-2 py-0.5 rounded-full ${isFull ? 'bg-rose-100' : 'bg-emerald-100'}`}>
            <Text className={`text-xs font-bold ${isFull ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isFull ? 'Shift Full' : `${spotsLeft} spots left`}
            </Text>
          </View>
        </View>

        <ProgressBar current={event.filledCount} total={event.headcount} showLabels={false} />
      </View>

      {/* Action Footer */}
      <View className="flex-row justify-between items-center pt-1 border-t border-slate-100">
        <Text className="text-xs font-medium text-slate-500">
          {event.isJoined ? '✅ You are booked for this shift' : 'Tap to review shift details'}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-xs font-bold text-indigo-600 mr-1">
            {event.isJoined ? 'View Shift' : 'View & Join'}
          </Text>
          <ArrowRight size={14} color="#4f46e5" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
