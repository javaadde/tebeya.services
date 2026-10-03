import { EventSlot } from '@tebeya/shared';
import { ImageSourcePropType } from 'react-native';

/**
 * Maps each EventSlot to its corresponding illustration image.
 * These images are used in the event cards on both the Calendar and Home pages.
 */
const SLOT_IMAGES: Record<EventSlot, ImageSourcePropType> = {
  breakfast: require('../../assets/events/breakfast.jpg'),
  lunch: require('../../assets/events/lunch.jpg'),
  snacks: require('../../assets/events/snacks.jpg'),
  dinner: require('../../assets/events/dinner.jpg'),
  custom: require('../../assets/events/custom.jpg'),
};

/**
 * Returns the local image source for an event.
 * If event has slot 'dinner' or starts at/after 16:00 (4 PM), it uses the evening event image.
 * If event has slot 'lunch' or starts between 11:00 and 16:00, it uses the lunch event image.
 * If event has slot 'breakfast', it uses the breakfast event image.
 * If event has slot 'snacks', it uses the snacks event image.
 */
export function getSlotImage(slot?: EventSlot, startTime?: string): ImageSourcePropType {
  if (slot === 'dinner') return SLOT_IMAGES.dinner;
  if (slot === 'lunch') return SLOT_IMAGES.lunch;
  if (slot === 'breakfast') return SLOT_IMAGES.breakfast;
  if (slot === 'snacks') return SLOT_IMAGES.snacks;

  // If custom or undefined, infer from start time
  if (startTime) {
    const hour = parseInt(startTime.split(':')[0], 10);
    if (!isNaN(hour)) {
      if (hour >= 16 || hour <= 4) return SLOT_IMAGES.dinner;
      if (hour >= 11 && hour < 16) return SLOT_IMAGES.lunch;
      if (hour >= 5 && hour < 11) return SLOT_IMAGES.breakfast;
    }
  }

  return SLOT_IMAGES.custom;
}
