// components/current-dominance-widget/PieChart.tsx
// Pie chart component for displaying market dominance

import { StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS, PIE_CIRCUMFERENCE, PIE_RADIUS, PIE_SIZE, PIE_STROKE_WIDTH } from './constants';
import type { PieChartProps } from './types';

export function PieChart({ data }: PieChartProps) {
  const segments = [
    { percentage: data.btc.dominance, color: COLORS.BTC.light },
    { percentage: data.eth.dominance, color: COLORS.ETH.light },
    { percentage: data.stablecoins.dominance, color: COLORS.STABLECOINS.light },
    { percentage: data.others.dominance, color: COLORS.OTHERS.light },
  ];

  let currentAngle = -90; // Start from top

  return (
    <Svg width={PIE_SIZE} height={PIE_SIZE}>
      <G rotation={0} origin={`${PIE_SIZE / 2}, ${PIE_SIZE / 2}`}>
        {segments.map((segment, index) => {
          const strokeDasharray = `${
            (segment.percentage / 100) * PIE_CIRCUMFERENCE
          } ${PIE_CIRCUMFERENCE}`;
          const rotation = currentAngle;
          currentAngle += (segment.percentage / 100) * 360;

          return (
            <Circle
              key={index}
              cx={PIE_SIZE / 2}
              cy={PIE_SIZE / 2}
              r={PIE_RADIUS}
              stroke={segment.color}
              strokeWidth={PIE_STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              rotation={rotation}
              origin={`${PIE_SIZE / 2}, ${PIE_SIZE / 2}`}
            />
          );
        })}
      </G>
    </Svg>
  );
}

