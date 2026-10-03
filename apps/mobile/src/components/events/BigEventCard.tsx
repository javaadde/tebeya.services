import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Clock, IndianRupee, Sparkles } from 'lucide-react-native';
import { EventWithStaffMeta } from '@tebeya/shared';
import { getSlotImage, BUFFET_IMAGE } from '../../utils/slotImages';

interface BigEventCardProps {
  events?: EventWithStaffMeta[];
  event?: EventWithStaffMeta;
  onPress?: () => void;
  onPressEvent?: (event: EventWithStaffMeta) => void;
}

function formatTabDate(dateStr?: string): string {
  if (!dateStr) return '17 sep';
  const todayIso = new Date().toISOString().split('T')[0];
  if (dateStr === todayIso) return 'Today';
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    return `${day} ${month}`;
  } catch {
    return dateStr;
  }
}

/**
 * BigEventCard:
 * Exact match to user's design reference:
 * - Rich Terracotta Red background (#cf452c)
 * - Top-right white date tab ("17 sep") nestled in the concave stepped notch
 * - Swipeable image carousel with 3 horizontal indicator pills
 * - Swiping image instantly changes active shift details across all pills
 * - High-contrast, clean typography with soft terracotta pill backgrounds
 */
export const BigEventCard: React.FC<BigEventCardProps> = ({
  events = [],
  event,
  onPress,
  onPressEvent,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayEvents =
    events && events.length > 0 ? events : event ? [event] : [];

  if (displayEvents.length === 0) {
    return null;
  }

  const currentEvent = displayEvents[activeIndex] || displayEvents[0];

  const handlePress = (ev: EventWithStaffMeta) => {
    if (onPressEvent) {
      onPressEvent(ev);
    } else if (onPress) {
      onPress();
    }
  };

  // Dimensions & responsive geometry
  const cardWidth = Math.min(windowWidth - 32, 380);
  const cardHeight = 236;

  // Geometry for stepped shape
  const imageWidth = Math.round(cardWidth * 0.59);
  const imageHeight = 132;
  const stepStart = imageWidth + 18;
  const stepEnd = Math.min(cardWidth - 45, stepStart + 46);
  const stepY = 78;

  const rTL = 32;
  const rBL = 32;
  const rBR = 32;
  const rTR = 24;

  // S-curve control points for smooth concave fillet
  const cp1x = stepStart + (stepEnd - stepStart) * 0.5;
  const cp2x = stepEnd - (stepEnd - stepStart) * 0.5;

  const pathD =
    `M ${rTL} 0 ` +
    `L ${stepStart} 0 ` +
    `C ${cp1x.toFixed(1)} 0 ${cp2x.toFixed(1)} ${stepY} ${stepEnd} ${stepY} ` +
    `L ${cardWidth - rTR} ${stepY} ` +
    `A ${rTR} ${rTR} 0 0 1 ${cardWidth} ${stepY + rTR} ` +
    `L ${cardWidth} ${cardHeight - rBR} ` +
    `A ${rBR} ${rBR} 0 0 1 ${cardWidth - rBR} ${cardHeight} ` +
    `L ${rBL} ${cardHeight} ` +
    `A ${rBL} ${rBL} 0 0 1 0 ${cardHeight - rBL} ` +
    `L 0 ${rTL} ` +
    `A ${rTL} ${rTL} 0 0 1 ${rTL} 0 Z`;

  // Calculated values for current event details
  const spotsLeft = Math.max(
    0,
    (currentEvent.headcount || 1) - (currentEvent.filledCount || 0)
  );
  const isFull = (currentEvent.filledCount || 0) >= (currentEvent.headcount || 1);
  const totalPay =
    (currentEvent.payPerPerson || 0) + (currentEvent.estimatedPayout || 0);

  const slotLabel =
    currentEvent.slot === 'dinner'
      ? 'Evening'
      : currentEvent.slot === 'lunch'
      ? 'Lunch'
      : currentEvent.slot === 'breakfast'
      ? 'Breakfast'
      : currentEvent.slot === 'snacks'
      ? 'High Tea'
      : 'Special';

  // Always show at least 3 indicators (matching reference design)
  const indicatorCount = Math.max(3, displayEvents.length);
  const indicators = Array.from({ length: indicatorCount });

  // Right section layout
  const rightX = imageWidth + 24;
  const rightWidth = Math.max(90, cardWidth - rightX - 14);

  return (
    <View
      style={{
        width: cardWidth,
        height: cardHeight,
        alignSelf: 'center',
        position: 'relative',
        marginBottom: 16,
      }}
    >
      {/* Top-Right White Date Tab ("17 sep") nestled in the stepped notch */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: rightWidth + 14,
          height: stepY,
          backgroundColor: '#ffffff',
          borderTopRightRadius: 28,
          borderTopLeftRadius: 24,
          borderBottomRightRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 1,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: -0.2,
          }}
        >
          {formatTabDate(currentEvent.date)}
        </Text>
      </View>

      {/* Main Terracotta Red Card Shape (#cf452c) */}
      <Svg width={cardWidth} height={cardHeight} style={StyleSheet.absoluteFill}>
        <Path d={pathD} fill="#cf452c" />
      </Svg>

      {/* Top Left Capsule: Event Title & Slot */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handlePress(currentEvent)}
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          width: imageWidth,
          height: 44,
          backgroundColor: '#d8614c',
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          <Sparkles size={12} color="#ffffff" />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            {currentEvent.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 10,
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.85)',
              marginTop: 1,
            }}
          >
            {slotLabel} Shift · {currentEvent.startTime}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Left Image Carousel: Touch Swipe to Change Image & Event Details */}
      <View
        style={{
          position: 'absolute',
          top: 66,
          left: 14,
          width: imageWidth,
          height: imageHeight,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: '#b83b24',
        }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            const nextIdx = Math.round(e.nativeEvent.contentOffset.x / imageWidth);
            if (nextIdx >= 0 && nextIdx < displayEvents.length) {
              setActiveIndex(nextIdx);
            }
          }}
          onScrollEndDrag={(e) => {
            const nextIdx = Math.round(e.nativeEvent.contentOffset.x / imageWidth);
            if (nextIdx >= 0 && nextIdx < displayEvents.length) {
              setActiveIndex(nextIdx);
            }
          }}
        >
          {displayEvents.map((ev, idx) => (
            <TouchableOpacity
              key={ev.id || idx}
              activeOpacity={0.92}
              onPress={() => handlePress(ev)}
              style={{ width: imageWidth, height: imageHeight }}
            >
              <Image
                source={
                  idx === 0
                    ? BUFFET_IMAGE
                    : getSlotImage(ev.slot, ev.startTime)
                }
                style={{ width: imageWidth, height: imageHeight }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 3 Horizontal Pill Indicators pinned to bottom */}
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            bottom: 8,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {indicators.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => {
                  if (idx < displayEvents.length) {
                    scrollRef.current?.scrollTo({
                      x: idx * imageWidth,
                      animated: true,
                    });
                    setActiveIndex(idx);
                  }
                }}
                style={{
                  width: 34,
                  height: 8,
                  borderRadius: 999,
                  marginHorizontal: 3,
                  backgroundColor: isActive
                    ? '#2c2c2e'
                    : 'rgba(235, 235, 240, 0.75)',
                  borderWidth: isActive ? 1 : 0,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
              />
            );
          })}
        </View>
      </View>

      {/* Right Pill 1: Time & Shift Slot */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handlePress(currentEvent)}
        style={{
          position: 'absolute',
          top: 88,
          left: rightX,
          width: rightWidth,
          height: 44,
          backgroundColor: '#d8614c',
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
        }}
      >
        <Clock size={13} color="#ffffff" />
        <View style={{ marginLeft: 6, alignItems: 'flex-start' }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            {currentEvent.startTime || '18:00'}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 9,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.85)',
              textTransform: 'uppercase',
            }}
          >
            {slotLabel}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right Pill 2: Pay & Spots Left */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handlePress(currentEvent)}
        style={{
          position: 'absolute',
          top: 140,
          left: rightX,
          width: rightWidth,
          height: 44,
          backgroundColor: '#d8614c',
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
        }}
      >
        <IndianRupee size={13} color="#ffffff" />
        <View style={{ marginLeft: 4, alignItems: 'flex-start' }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 11,
              fontWeight: '800',
              color: '#ffffff',
            }}
          >
            ₹{totalPay || currentEvent.payPerPerson || 850}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 9,
              fontWeight: '700',
              color: isFull ? '#ffe4e6' : 'rgba(255, 255, 255, 0.85)',
            }}
          >
            {isFull ? 'Full' : `${spotsLeft} left`}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
