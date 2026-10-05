import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowUpRight, Clock, MapPin, Calendar, IndianRupee } from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { SlotBadge } from '../ui/Badge';

interface ShiftCardProps {
  event: EventWithStaffMeta;
  onPress: () => void;
  variant?: 'grid' | 'full';
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  event,
  onPress,
  variant = 'grid',
}) => {
  const isFull = event.filledCount >= event.headcount;
  const spotsLeft = Math.max(0, event.headcount - event.filledCount);
  const totalPay = (event.payPerPerson || 0) + (event.estimatedPayout || 0);

  if (variant === 'full') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        className="bg-white rounded-[28px] p-5 mb-4 shadow-sm relative border border-white/50"
      >
        {/* Top Right Arrow Button */}
        <View className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f1f2f2] border border-[#e4e5e6] items-center justify-center">
          <ArrowUpRight size={18} color="#201d1e" />
        </View>

        <View className="flex-row items-center mb-2.5">
          <SlotBadge slot={event.slot} />
          <Text className="text-xs font-semibold text-neutral-500 ml-2">
            {event.date}
          </Text>
        </View>

        <Text className="text-lg font-bold text-neutral-900 mb-2 pr-10 leading-6" numberOfLines={2}>
          {event.title}
        </Text>

        <View className="flex-row items-center text-xs text-neutral-600 mb-3">
          <MapPin size={14} color="#64748b" />
          <Text className="text-xs text-neutral-600 ml-1 flex-1" numberOfLines={1}>
            {event.venue.text}
          </Text>
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-neutral-100">
          <View className="flex-row items-center">
            <Text className="text-base font-black text-neutral-900">
              ₹{totalPay || event.payPerPerson}
            </Text>
            <Text className="text-[11px] text-neutral-500 ml-1">est. total</Text>
          </View>
          <View className={`px-2.5 py-1 rounded-full ${isFull ? 'bg-rose-100' : 'bg-[#f1f2f2]'}`}>
            <Text className={`text-[11px] font-bold ${isFull ? 'text-rose-700' : 'text-neutral-700'}`}>
              {isFull ? 'Full' : `${spotsLeft} spots`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid Card Variant (matches exact card layout in user reference images)
  const venueShort = event.venue?.text ? event.venue.text.split(',')[0].trim() : 'Venue TBA';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="bg-white rounded-[26px] p-3.5 mb-3.5 justify-between relative shadow-sm border border-white/50"
      style={{ width: '48.2%', minHeight: 152 }}
    >
      {/* Top row: Title & Venue on left, sharp circular arrow on right */}
      <View className="flex-row justify-between items-start mb-1.5">
        <View className="flex-1 mr-2">
          <Text className="text-[13px] font-black text-neutral-900 leading-tight" numberOfLines={1}>
            {event.title}
          </Text>
          <Text className="text-[10px] text-neutral-500 font-medium mt-0.5" numberOfLines={1}>
            {venueShort}
          </Text>
        </View>

        {/* Circular Arrow Badge matching Image 2 */}
        <View className="w-7 h-7 rounded-full bg-[#f4f4f5] border border-[#e4e4e7] items-center justify-center shrink-0">
          <ArrowUpRight size={15} color="#201d1e" strokeWidth={2.4} />
        </View>
      </View>

      {/* Status indicator row: Colored dot + slot name */}
      <View className="flex-row items-center my-1">
        <View className="w-1.5 h-1.5 rounded-full bg-[#598A31] mr-1.5" />
        <Text className="text-[11px] font-bold text-neutral-800 capitalize">
          {event.slot || 'Shift'}
        </Text>
        <Text className="text-[10px] font-semibold text-neutral-400 ml-auto">
          {spotsLeft} spots
        </Text>
      </View>

      {/* Date row with Calendar icon */}
      <View className="flex-row items-center mb-1">
        <Calendar size={11} color="#71717a" />
        <Text className="text-[10px] font-medium text-neutral-600 ml-1.5" numberOfLines={1}>
          {event.date}
        </Text>
      </View>

      {/* Bottom row: Time + Pay */}
      <View className="pt-2 border-t border-neutral-100 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Clock size={11} color="#71717a" />
          <Text className="text-[10px] font-medium text-neutral-600 ml-1">
            {event.startTime}
          </Text>
        </View>

        <Text className="text-xs font-black text-[#598A31]">
          ₹{event.payPerPerson}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
