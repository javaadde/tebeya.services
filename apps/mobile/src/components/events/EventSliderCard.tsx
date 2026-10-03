import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowUpRight, MapPin, Clock, CalendarDays, IndianRupee } from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { getSlotImage } from '../../utils/slotImages';

interface EventSliderCardProps {
  event: EventWithStaffMeta;
  onPress: () => void;
  isToday?: boolean;
}

/**
 * Featured Slider Card for Home Feed Carousel:
 * Prominently displays the slot-specific illustration (evening, lunch, etc.)
 */
export const EventSliderCard: React.FC<EventSliderCardProps> = ({
  event,
  onPress,
  isToday = false,
}) => {
  const venueShort = event.venue?.text
    ? event.venue.text.split(',')[0].trim()
    : 'Venue TBA';

  const spotsLeft = Math.max(0, event.headcount - event.filledCount);
  const isFull = event.filledCount >= event.headcount;
  const totalPay = (event.payPerPerson || 0) + (event.estimatedPayout || 0);

  const slotLabel =
    event.slot === 'dinner'
      ? 'Evening Shift'
      : event.slot === 'lunch'
      ? 'Lunch Shift'
      : event.slot === 'breakfast'
      ? 'Breakfast Shift'
      : event.slot === 'snacks'
      ? 'High Tea Shift'
      : 'Special Shift';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="bg-white rounded-[26px] p-3 mr-3.5 shadow-sm border border-neutral-100"
      style={{ width: 280 }}
    >
      {/* Top: Slot illustration image with badges */}
      <View className="w-full h-[124px] rounded-[18px] overflow-hidden bg-neutral-100 relative mb-3">
        <Image
          source={getSlotImage(event.slot, event.startTime)}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Floating Top Left Badge: Slot Name */}
        <View className="absolute top-2.5 left-2.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md">
          <Text className="text-[11px] font-bold text-white">
            {slotLabel}
          </Text>
        </View>

        {/* Floating Top Right: Arrow Button */}
        <View className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 items-center justify-center shadow-sm">
          <ArrowUpRight size={17} color="#18181b" strokeWidth={2.4} />
        </View>

        {/* Floating Bottom Right Badge: Pay */}
        <View className="absolute bottom-2.5 right-2.5 bg-[#df3b20] px-2.5 py-1 rounded-xl flex-row items-center shadow-sm">
          <IndianRupee size={11} color="#ffffff" />
          <Text className="text-xs font-black text-white ml-0.5">
            {totalPay || event.payPerPerson}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text
        className="text-[15px] font-bold text-neutral-900 leading-snug mb-1"
        numberOfLines={1}
      >
        {event.title}
      </Text>

      {/* Venue */}
      <View className="flex-row items-center mb-1">
        <MapPin size={12} color="#64748b" />
        <Text className="text-xs text-neutral-500 ml-1.5 flex-1" numberOfLines={1}>
          {venueShort}
        </Text>
      </View>

      {/* Date & Time Row */}
      <View className="flex-row items-center justify-between pt-2 mt-1 border-t border-neutral-100">
        <View className="flex-row items-center">
          <Clock size={11} color="#71717a" />
          <Text className="text-[11px] font-medium text-neutral-600 ml-1">
            {event.startTime} – {event.endTime}
          </Text>
        </View>

        <View className={`px-2 py-0.5 rounded-full ${isFull ? 'bg-rose-50' : 'bg-neutral-100'}`}>
          <Text className={`text-[10px] font-bold ${isFull ? 'text-rose-600' : 'text-neutral-700'}`}>
            {isFull ? 'Full' : `${spotsLeft} left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
