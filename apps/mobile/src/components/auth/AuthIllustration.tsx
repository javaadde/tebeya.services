import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Ellipse,
  G,
} from 'react-native-svg';

interface AuthIllustrationProps {
  width?: number;
  height?: number;
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({
  width = 240,
  height = 200,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 200" fill="none">
      {/* Background delicate arc motion lines */}
      <Path
        d="M30 145 C 50 110, 80 90, 120 90 C 160 90, 190 110, 210 145"
        stroke="#EAEAEA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M20 160 C 50 140, 75 135, 120 135 C 165 135, 190 140, 220 160"
        stroke="#F0F0F0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Ground lines and small accent dashes */}
      <Ellipse cx="72" cy="172" rx="22" ry="7" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
      <Ellipse cx="168" cy="172" rx="22" ry="7" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
      <Path d="M68 182 H 78" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M162 182 H 174" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />

      {/* Headphone band arching above head */}
      <Path
        d="M93 72 C 90 48, 105 38, 120 38 C 135 38, 150 48, 147 72"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Headphone ear pads */}
      <Rect x="87" y="66" width="7" height="15" rx="3.5" fill="#1A1A1A" />
      <Rect x="146" y="66" width="7" height="15" rx="3.5" fill="#1A1A1A" />

      {/* Fluffy curly hair (solid black stylized clusters) */}
      <Circle cx="120" cy="56" r="13" fill="#1A1A1A" />
      <Circle cx="108" cy="56" r="11" fill="#1A1A1A" />
      <Circle cx="132" cy="56" r="11" fill="#1A1A1A" />
      <Circle cx="99" cy="64" r="10" fill="#1A1A1A" />
      <Circle cx="141" cy="64" r="10" fill="#1A1A1A" />
      <Circle cx="114" cy="48" r="9" fill="#1A1A1A" />
      <Circle cx="126" cy="48" r="9" fill="#1A1A1A" />

      {/* Face outline */}
      <Path
        d="M104 69 C 104 84, 111 93, 120 93 C 129 93, 136 84, 136 69"
        fill="#FFFFFF"
        stroke="#1A1A1A"
        strokeWidth="1.8"
      />

      {/* Glasses */}
      <Circle cx="113" cy="74" r="5.5" stroke="#1A1A1A" strokeWidth="1.6" fill="#FFFFFF" />
      <Circle cx="127" cy="74" r="5.5" stroke="#1A1A1A" strokeWidth="1.6" fill="#FFFFFF" />
      <Path d="M118.5 74 H 121.5" stroke="#1A1A1A" strokeWidth="1.6" />
      {/* Eyes behind glasses */}
      <Circle cx="113" cy="74" r="1.5" fill="#1A1A1A" />
      <Circle cx="127" cy="74" r="1.5" fill="#1A1A1A" />

      {/* Smile */}
      <Path
        d="M117 83 Q 120 86 123 83"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Neck */}
      <Path d="M116 93 V 100 H 124 V 93" stroke="#1A1A1A" strokeWidth="1.6" fill="#FFFFFF" />

      {/* Torso / Shirt */}
      <Path
        d="M102 104 C 110 101, 130 101, 138 104 L 148 135 H 92 Z"
        fill="#FFFFFF"
        stroke="#1A1A1A"
        strokeWidth="1.8"
      />
      {/* Collar lines */}
      <Path
        d="M114 100 Q 120 106 126 100"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left arm (resting toward laptop) */}
      <Path
        d="M102 104 C 95 112, 90 120, 85 130 C 86 134, 100 134, 105 130"
        stroke="#1A1A1A"
        strokeWidth="1.8"
        fill="#FFFFFF"
      />

      {/* Right arm waving */}
      <Path
        d="M138 104 C 148 102, 158 95, 162 82 C 160 80, 154 82, 150 87"
        stroke="#1A1A1A"
        strokeWidth="1.8"
        fill="#FFFFFF"
      />
      {/* Waving hand fingers */}
      <Path
        d="M162 82 C 164 78, 168 76, 169 79 C 170 82, 167 85, 165 87"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="#FFFFFF"
      />
      <Path
        d="M166 76 C 168 74, 172 75, 171 78 C 170 80, 168 83, 166 84"
        stroke="#1A1A1A"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="#FFFFFF"
      />

      {/* Open Laptop */}
      {/* Laptop Screen (black trapezoid facing user/viewer) */}
      <Path
        d="M86 128 L 154 128 L 148 164 L 92 164 Z"
        fill="#1A1A1A"
        stroke="#1A1A1A"
        strokeWidth="1"
      />
      {/* Laptop center white logo dot */}
      <Circle cx="120" cy="144" r="3.5" fill="#FFFFFF" />

      {/* Laptop keyboard base / bottom edge */}
      <Path
        d="M82 164 L 158 164 L 154 167 L 86 167 Z"
        fill="#333333"
        stroke="#1A1A1A"
        strokeWidth="1.5"
      />

      {/* Minimal shadow / surface reflection under laptop */}
      <Ellipse cx="120" cy="168" rx="42" ry="2.5" fill="#E2E2E2" />
    </Svg>
  );
};
