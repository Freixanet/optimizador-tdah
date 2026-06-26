import React from 'react';
import Svg, { Ellipse, Circle } from 'react-native-svg';

type AppIconProps = {
  className?: string;
  size?: number;
  color?: string;
};

export default function AppIcon({ size = 24, color = 'currentColor' }: AppIconProps) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      aria-hidden={true}
    >
      <Ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.7"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <Ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.7"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
        transform="rotate(60 12 12)"
      />
      <Ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.7"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
        transform="rotate(120 12 12)"
      />
      <Circle cx="12" cy="12" r="2.75" fill={color} />
    </Svg>
  );
}
