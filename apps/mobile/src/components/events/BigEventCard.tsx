import React from 'react';
import { View, ScrollView } from 'react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { EventSliderCard, DEFAULT_CARD_WIDTH } from './EventSliderCard';

export interface BigEventCardProps {
  events?: EventWithStaffMeta[];
  event?: EventWithStaffMeta;
  onPress?: () => void;
  onPressEvent?: (event: EventWithStaffMeta) => void;
  cardWidth?: number;
}

const CARD_GAP = 14;

/**
 * BigEventCard / Card Slider:
 * Renders the horizontal card slider on the home page matching the exact design reference (slide=3.png):
 * - Forest Green (#598A31) organic stepped shape with precise notch fillets
 * - Top-right white date notch badge ("02 OCT") with subtle border (#C7C0C0)
 * - Bottom-left 3-image carousel with counter (3/3), chevrons (< >), and pagination pills
 * - Stacked right info boxes: TIME ("11:00 AM") and PLACE ("Poolside")
 * - Smooth snapping horizontal carousel
 */
export const BigEventCard: React.FC<BigEventCardProps> = ({
  events = [],
  event,
  onPress,
  onPressEvent,
  cardWidth = DEFAULT_CARD_WIDTH,
}) => {
  const displayEvents =
    events && events.length > 0 ? events : event ? [event] : [];

  if (displayEvents.length === 0) {
    return null;
  }

  const handlePress = (ev: EventWithStaffMeta) => {
    if (onPressEvent) {
      onPressEvent(ev);
    } else if (onPress) {
      onPress();
    }
  };

  // If only 1 event, render a single card
  if (displayEvents.length === 1) {
    return (
      <View style={{ marginBottom: 16, alignSelf: 'flex-start' }}>
        <EventSliderCard
          event={displayEvents[0]}
          width={cardWidth}
          onPress={() => handlePress(displayEvents[0])}
        />
      </View>
    );
  }

  // Multiple events: Horizontal Card Slider with smooth snap
  return (
    <View style={{ marginHorizontal: -16, marginBottom: 16 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + CARD_GAP}
        snapToAlignment="start"
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
      >
        {displayEvents.map((ev, index) => {
          const isLast = index === displayEvents.length - 1;
          return (
            <View
              key={ev.id || index}
              style={{ marginRight: isLast ? 0 : CARD_GAP }}
            >
              <EventSliderCard
                event={ev}
                width={cardWidth}
                onPress={() => handlePress(ev)}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
