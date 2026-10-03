import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { getSlotImage } from '../../utils/slotImages';

interface EventCardProps {
  event: EventWithStaffMeta;
  onPress: () => void;
}

/**
 * Horizontal event card matching the reference design:
 * - Rounded image thumbnail on the left (based on event slot)
 * - Title + description text on the right
 * - Arrow-up-right icon in top-right corner
 */
export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const venueShort = event.venue?.text
    ? event.venue.text.split(',')[0].trim()
    : 'Venue TBA';

  const spotsLeft = Math.max(0, event.headcount - event.filledCount);
  const isFull = event.filledCount >= event.headcount;
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

  const totalPay = (event.payPerPerson || 0) + (event.estimatedPayout || 0);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="bg-white rounded-[26px] p-3.5 mb-3 flex-row items-center shadow-sm border border-neutral-100"
      style={{ minHeight: 96 }}
    >
      {/* Left: Event Slot Image */}
      <View className="w-[108px] h-[82px] rounded-[18px] overflow-hidden bg-neutral-100 mr-3.5">
        <Image
          source={getSlotImage(event.slot, event.startTime)}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Middle: Event Info (matching 3-line layout in reference) */}
      <View className="flex-1 justify-center mr-2">
        <Text
          className="text-[16px] font-bold text-neutral-900 leading-tight tracking-tight"
          numberOfLines={1}
        >
          {event.title}
        </Text>
        <View className="mt-1">
          <Text className="text-[12px] text-neutral-600 font-normal leading-[17px]" numberOfLines={1}>
            {slotLabel} · {event.date}
          </Text>
          <Text className="text-[12px] text-neutral-500 font-normal leading-[17px]" numberOfLines={1}>
            {venueShort}
          </Text>
          <Text className="text-[12px] text-neutral-600 font-medium leading-[17px]" numberOfLines={1}>
            {event.startTime} – {event.endTime} · ₹{totalPay || event.payPerPerson} {isFull ? '(Full)' : `(${spotsLeft} left)`}
          </Text>
        </View>
      </View>

      {/* Right: Arrow Icon */}
      <View className="w-8 h-8 rounded-full items-center justify-center self-start mt-0.5">
        <ArrowUpRight size={22} color="#18181b" strokeWidth={2.2} />
      </View>
    </TouchableOpacity>
  );
};
