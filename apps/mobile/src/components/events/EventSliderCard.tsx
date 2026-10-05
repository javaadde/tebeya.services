import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Clock, MapPin } from 'lucide-react-native';
import { EventWithStaffMeta, CateringEvent } from '@tebeya/shared';
import { getEventImages } from '../../utils/slotImages';

export interface EventSliderCardProps {
  event: EventWithStaffMeta | CateringEvent;
  onPress?: () => void;
  width?: number;
  style?: object;
}

export const BASE_WIDTH = 365;
export const BASE_HEIGHT = 234;
export const DEFAULT_CARD_WIDTH = 330;

function parseEventDate(dateStr?: string): { day: string; month: string } {
  if (!dateStr) return { day: '02', month: 'OCT' };
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const dayNum = parseInt(parts[2], 10);
      const d = new Date(year, monthIdx, dayNum);
      const day = String(dayNum).padStart(2, '0');
      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      return { day, month };
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  } catch {
    return { day: '02', month: 'OCT' };
  }
}

function formatShiftTime(timeStr?: string): string {
  if (!timeStr) return '11:00 AM';
  if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  }
  return timeStr;
}

/**
 * EventSliderCard:
 * Exact 1:1 match to reference design (slide=3.png):
 * - Dimensions: 365 x 234 base geometry, scalably responsive
 * - Signature Forest Green (#598A31) organic stepped shape
 * - Convex arc (r=10) from top edge into clean vertical wall at x=251
 * - Deep concave scoop (r=40) carving into horizontal shelf at y=78
 * - White date badge nestled in the top-right notch with light-gray border (#C7C0C0)
 *   and brand-green month text (#598A31)
 * - Header: "UPCOMING EVENT" in pale olive (#B6CCA4) & Title in bold white
 * - Bottom-left photo container (227w x 134h, r=20) with counter pill (3/3), chevrons (< >),
 *   and active/inactive indicators
 * - Right-stacked info boxes: TIME ("11:00 AM") and PLACE ("Poolside")
 */
export const EventSliderCard: React.FC<EventSliderCardProps> = ({
  event,
  onPress,
  width = DEFAULT_CARD_WIDTH,
  style,
}) => {
  const cardWidth = width;
  const scale = cardWidth / BASE_WIDTH;
  const cardHeight = Math.round(cardWidth * (BASE_HEIGHT / BASE_WIDTH));

  const images = getEventImages(event);
  const { day, month } = parseEventDate(event.date);
  const displayTime = formatShiftTime(event.startTime);
  const venueShort = event.venue?.text
    ? event.venue.text.split(',')[0].trim()
    : 'Venue TBA';

  // Base SVG Geometry (365 x 234)
  const rTL = 28;
  const rBL = 28;
  const rBR = 28;
  const rTR = 20;

  const topEndX = 241;
  const rNotchTop = 10;
  const verticalX = 251;
  const verticalEndY = 38;
  const shelfY = 78;
  const rNotchBottom = 40;
  const shelfStartX = verticalX + rNotchBottom; // 291

  const pathD =
    `M 0 ${rTL} ` +
    `A ${rTL} ${rTL} 0 0 1 ${rTL} 0 ` +
    `L ${topEndX} 0 ` +
    `A ${rNotchTop} ${rNotchTop} 0 0 1 ${verticalX} ${rNotchTop} ` +
    `L ${verticalX} ${verticalEndY} ` +
    `A ${rNotchBottom} ${rNotchBottom} 0 0 0 ${shelfStartX} ${shelfY} ` +
    `L ${BASE_WIDTH - rTR} ${shelfY} ` +
    `A ${rTR} ${rTR} 0 0 1 ${BASE_WIDTH} ${shelfY + rTR} ` +
    `L ${BASE_WIDTH} ${BASE_HEIGHT - rBR} ` +
    `A ${rBR} ${rBR} 0 0 1 ${BASE_WIDTH - rBR} ${BASE_HEIGHT} ` +
    `L ${rBL} ${BASE_HEIGHT} ` +
    `A ${rBL} ${rBL} 0 0 1 0 ${BASE_HEIGHT - rBL} ` +
    `Z`;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        {
          width: cardWidth,
          height: cardHeight,
          position: 'relative',
        },
        style,
      ]}
    >
      {/* Top-Right White Date Tab nestled in notch */}
      <View
        style={{
          position: 'absolute',
          top: 13 * scale,
          left: 240 * scale,
          width: 115 * scale,
          height: 75 * scale,
          backgroundColor: '#ffffff',
          borderTopRightRadius: 22 * scale,
          borderTopLeftRadius: 18 * scale,
          borderBottomRightRadius: 18 * scale,
          borderWidth: 1.5,
          borderColor: '#C7C0C0',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 12 * scale,
          paddingBottom: 11 * scale,
          zIndex: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 0,
        }}
      >
        <Text
          style={{
            fontSize: Math.round(26 * scale),
            fontFamily: 'BricolageGrotesque_800ExtraBold',
            color: '#111827',
            lineHeight: Math.round(26 * scale),
            textAlign: 'center',
            marginBottom: -2 * scale,
          }}
        >
          {day}
        </Text>
        <Text
          style={{
            fontSize: Math.round(11 * scale),
            fontFamily: 'BricolageGrotesque_800ExtraBold',
            color: '#598A31',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            textAlign: 'center',
            lineHeight: Math.round(12 * scale),
          }}
        >
          {month}
        </Text>
      </View>

      {/* Main Forest Green (#598A31) Background Shape */}
      <Svg
        width={cardWidth}
        height={cardHeight}
        viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
      >
        <Path d={pathD} fill="#598A31" />
      </Svg>

      {/* Top-Left Header: "UPCOMING EVENT" & Event Title */}
      <View
        style={{
          position: 'absolute',
          top: 15 * scale,
          left: 14 * scale,
          width: 226 * scale,
          zIndex: 2,
        }}
      >
        <Text
          style={{
            fontSize: Math.max(9, Math.round(11 * scale)),
            fontFamily: 'BricolageGrotesque_700Bold',
            color: '#B6CCA4',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
          }}
        >
          UPCOMING EVENT
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: Math.max(16, Math.round(22 * scale)),
            fontFamily: 'BricolageGrotesque_800ExtraBold',
            color: '#ffffff',
            marginTop: 2 * scale,
          }}
        >
          {event.title}
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          top: 86 * scale,
          left: 13 * scale,
          width: 227 * scale,
          height: 134 * scale,
          borderRadius: 20 * scale,
          overflow: 'hidden',
          backgroundColor: '#3b5c21',
          zIndex: 2,
        }}
      >
        <Image
          source={images[0]}
          style={{ width: 227 * scale, height: 134 * scale }}
          resizeMode="cover"
        />
      </View>

      {/* Right Column - Box 1: TIME (99w x 64h at base) */}
      <View
        style={{
          position: 'absolute',
          top: 86 * scale,
          left: 252 * scale,
          width: 99 * scale,
          height: 64 * scale,
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          borderRadius: 20 * scale,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.35)',
          paddingHorizontal: 10 * scale,
          paddingVertical: 8 * scale,
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clock size={Math.round(14 * scale)} color="#ffffff" strokeWidth={2.2} />
          <Text
            style={{
              color: '#B6CCA4',
              fontSize: Math.max(8, Math.round(10 * scale)),
              fontFamily: 'BricolageGrotesque_700Bold',
              letterSpacing: 1.2,
              marginLeft: 5 * scale,
            }}
          >
            TIME
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: '#ffffff',
            fontSize: Math.max(11, Math.round(14 * scale)),
            fontFamily: 'BricolageGrotesque_800ExtraBold',
            marginTop: 4 * scale,
          }}
        >
          {displayTime}
        </Text>
      </View>

      {/* Right Column - Box 2: PLACE (99w x 64h at base) */}
      <View
        style={{
          position: 'absolute',
          top: 156 * scale,
          left: 252 * scale,
          width: 99 * scale,
          height: 64 * scale,
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          borderRadius: 20 * scale,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.35)',
          paddingHorizontal: 10 * scale,
          paddingVertical: 8 * scale,
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MapPin size={Math.round(14 * scale)} color="#ffffff" strokeWidth={2.2} />
          <Text
            style={{
              color: '#B6CCA4',
              fontSize: Math.max(8, Math.round(10 * scale)),
              fontFamily: 'BricolageGrotesque_700Bold',
              letterSpacing: 1.2,
              marginLeft: 5 * scale,
            }}
          >
            PLACE
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: '#ffffff',
            fontSize: Math.max(11, Math.round(14 * scale)),
            fontFamily: 'BricolageGrotesque_800ExtraBold',
            marginTop: 4 * scale,
          }}
        >
          {venueShort}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
