import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type GlassPerimeterRingProps = {
  diameter: number;
  color: string;
  strokeWidth?: number;
};

/** Vector ring — smoother on small circles than RN View borders. */
export default function GlassPerimeterRing({
  diameter,
  color,
  strokeWidth = 1,
}: GlassPerimeterRingProps) {
  const center = diameter / 2;
  const radius = Math.max(0, center - strokeWidth / 2);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shell]}>
      <Svg width={diameter} height={diameter}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    zIndex: 20,
  },
});
