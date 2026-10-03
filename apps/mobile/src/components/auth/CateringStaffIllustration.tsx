import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Ellipse,
  G,
} from 'react-native-svg';

interface CateringStaffIllustrationProps {
  width?: number;
  height?: number;
}

export const CateringStaffIllustration: React.FC<CateringStaffIllustrationProps> = ({
  width = 220,
  height = 180,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 180" fill="none">
      {/* Background warm ambiance rings */}
      <Circle cx="110" cy="90" r="72" stroke="#FEECE8" strokeWidth="2" />
      <Circle cx="110" cy="90" r="82" stroke="#FFF5F2" strokeWidth="1" strokeDasharray="4 4" />

      {/* Decorative stars / service sparkles */}
      <Path
        d="M36 60 L38 66 L44 68 L38 70 L36 76 L34 70 L28 68 L34 66 Z"
        fill="#DF3B20"
        opacity={0.8}
      />
      <Path
        d="M185 45 L187 49 L191 50 L187 51 L185 55 L183 51 L179 50 L183 49 Z"
        fill="#DF3B20"
        opacity={0.8}
      />
      <Path
        d="M192 110 L193.5 113.5 L197 114.5 L193.5 115.5 L192 119 L190.5 115.5 L187 114.5 L190.5 113.5 Z"
        fill="#DF3B20"
        opacity={0.6}
      />

      {/* Ground shadow */}
      <Ellipse cx="110" cy="168" rx="55" ry="4" fill="#F1F2F4" />

      {/* ---------------- SERVER HEAD & FACE ---------------- */}
      {/* Hair (slicked neat banquet style) */}
      <Path
        d="M96 46 C96 32, 106 26, 118 26 C128 26, 134 32, 134 42 C134 46, 132 49, 130 52 C126 50, 114 47, 102 52 Z"
        fill="#1F241F"
      />

      {/* Face outline */}
      <Path
        d="M100 48 C100 62, 107 70, 115 70 C123 70, 130 62, 130 48"
        fill="#FFFFFF"
        stroke="#1F241F"
        strokeWidth="1.8"
      />

      {/* Ears */}
      <Path d="M97 50 C95 50, 95 55, 98 56" stroke="#1F241F" strokeWidth="1.6" fill="#FFFFFF" />
      <Path d="M130 50 C132 50, 132 55, 129 56" stroke="#1F241F" strokeWidth="1.6" fill="#FFFFFF" />

      {/* Eyes */}
      <Circle cx="108" cy="52" r="1.8" fill="#1F241F" />
      <Circle cx="122" cy="52" r="1.8" fill="#1F241F" />

      {/* Eyebrows */}
      <Path d="M105 47 Q108 45 111 47" stroke="#1F241F" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M119 47 Q122 45 125 47" stroke="#1F241F" strokeWidth="1.2" strokeLinecap="round" />

      {/* Polite welcoming smile */}
      <Path
        d="M111 60 Q115 64 119 60"
        stroke="#1F241F"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* ---------------- UNIFORM & TIE ---------------- */}
      {/* Neck */}
      <Path d="M111 70 V77 H119 V70" stroke="#1F241F" strokeWidth="1.6" fill="#FFFFFF" />

      {/* White shirt collar */}
      <Path d="M109 77 L115 82 L121 77" fill="#FFFFFF" stroke="#1F241F" strokeWidth="1.6" />

      {/* Bowtie (Brand Orange `#DF3B20` accent!) */}
      <Path
        d="M110 78 L115 80 L110 82 Z"
        fill="#DF3B20"
        stroke="#DF3B20"
        strokeWidth="0.8"
      />
      <Path
        d="M120 78 L115 80 L120 82 Z"
        fill="#DF3B20"
        stroke="#DF3B20"
        strokeWidth="0.8"
      />
      <Circle cx="115" cy="80" r="1.8" fill="#DF3B20" />

      {/* Banquet Vest / Waistcoat (Black fitted vest) */}
      <Path
        d="M98 84 L107 84 L115 96 L123 84 L132 84 L136 132 L115 137 L94 132 Z"
        fill="#1F241F"
        stroke="#1F241F"
        strokeWidth="1.6"
      />

      {/* White shirt visible in V-neck opening */}
      <Path
        d="M107 84 L115 96 L123 84 Z"
        fill="#FFFFFF"
        stroke="#1F241F"
        strokeWidth="1.2"
      />

      {/* Vest buttons */}
      <Circle cx="115" cy="104" r="1.4" fill="#FFFFFF" />
      <Circle cx="115" cy="113" r="1.4" fill="#FFFFFF" />
      <Circle cx="115" cy="122" r="1.4" fill="#FFFFFF" />

      {/* ---------------- LEGS / TROUSERS ---------------- */}
      <Path
        d="M97 134 L99 166 H112 L113 137 H117 L118 166 H131 L133 134"
        fill="#1F241F"
        stroke="#1F241F"
        strokeWidth="1.2"
      />

      {/* ---------------- LEFT ARM & SERVICE TOWEL ---------------- */}
      {/* Left arm bent politely at side holding waiter service towel */}
      <Path
        d="M98 86 C88 94, 86 106, 88 120 C92 120, 96 114, 98 108"
        fill="#FFFFFF"
        stroke="#1F241F"
        strokeWidth="1.6"
      />
      {/* Service towel draped over arm */}
      <Path
        d="M84 108 C84 104, 92 104, 92 108 L91 130 C91 133, 85 133, 85 130 Z"
        fill="#F4F5F4"
        stroke="#1F241F"
        strokeWidth="1.4"
      />

      {/* ---------------- RIGHT ARM HOLDING BANQUET PLATTER & CLOCHE ---------------- */}
      {/* Right arm extended forward to balance cloche tray */}
      <Path
        d="M132 86 C140 92, 146 100, 154 105 C154 110, 146 112, 138 106"
        fill="#FFFFFF"
        stroke="#1F241F"
        strokeWidth="1.6"
      />
      {/* Waiter's hand holding platter */}
      <Ellipse cx="156" cy="106" rx="4" ry="2.5" fill="#FFFFFF" stroke="#1F241F" strokeWidth="1.4" />

      {/* Silver Serving Platter / Tray */}
      <Path
        d="M134 105 C134 103, 178 103, 178 105 L174 108 H138 Z"
        fill="#E5E7EB"
        stroke="#1F241F"
        strokeWidth="1.6"
      />

      {/* Domed Banquet Cloche (Food Cover) */}
      <Path
        d="M140 103 C140 85, 172 85, 172 103 Z"
        fill="#FFFFFF"
        stroke="#1F241F"
        strokeWidth="1.8"
      />

      {/* Cloche Top Handle */}
      <Circle cx="156" cy="83" r="3" fill="#DF3B20" stroke="#1F241F" strokeWidth="1.2" />

      {/* Cloche silver sheen reflection */}
      <Path
        d="M147 99 C147 91, 158 90, 161 90"
        stroke="#E5E7EB"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
};
