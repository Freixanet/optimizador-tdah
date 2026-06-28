import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import {
  buildPalette,
  buildSphereMetrics,
  type PremiumSphereProps,
} from './premiumSphereShared';

/** SVG fallback when Skia native module is not linked (Expo Go / stale dev client). */
export function PremiumSphereFallback({
  size = 120,
  variant = 'purple',
  glow = true,
  style,
  radiusRatio = 0.88,
  shellOnly = false,
}: PremiumSphereProps) {
  const { isDark } = useTheme();
  const gradientId = React.useId().replace(/:/g, '');

  const palette = useMemo(() => buildPalette(variant, isDark), [isDark, variant]);
  const metrics = useMemo(() => buildSphereMetrics(size, radiusRatio), [radiusRatio, size]);

  const bodyGradId = `sphere-body-${gradientId}`;
  const glowGradId = `sphere-glow-${gradientId}`;
  const highlightGradId = `sphere-highlight-${gradientId}`;
  const depthGradId = `sphere-depth-${gradientId}`;

  return (
    <View style={[{ width: size, height: size, backgroundColor: 'transparent' }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          {glow ? (
            <RadialGradient
              id={glowGradId}
              cx={metrics.center}
              cy={metrics.center}
              rx={metrics.glowRadius}
              ry={metrics.glowRadius}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor={palette.glow} />
              <Stop offset="52%" stopColor={palette.deep} stopOpacity={isDark ? 0.35 : 0.22} />
              <Stop offset="100%" stopColor={palette.glowOuter} stopOpacity={0} />
            </RadialGradient>
          ) : null}

          <RadialGradient
            id={bodyGradId}
            cx={metrics.body.cx}
            cy={metrics.body.cy}
            rx={metrics.body.r}
            ry={metrics.body.r}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={palette.hot} />
            <Stop offset="12%" stopColor={palette.light} />
            <Stop offset="38%" stopColor={palette.mid} />
            <Stop offset="74%" stopColor={palette.deep} />
            <Stop offset="100%" stopColor={palette.core} />
          </RadialGradient>

          <RadialGradient
            id={highlightGradId}
            cx={metrics.highlight.cx - metrics.highlight.r * 0.12}
            cy={metrics.highlight.cy - metrics.highlight.r * 0.12}
            rx={metrics.highlight.r}
            ry={metrics.highlight.r}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
            <Stop offset="42%" stopColor="rgba(255,255,255,0.18)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </RadialGradient>

          <RadialGradient
            id={depthGradId}
            cx={metrics.depth.cx}
            cy={metrics.depth.cy}
            rx={metrics.depth.r}
            ry={metrics.depth.r}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
            <Stop offset="55%" stopColor="rgba(0,0,0,0.12)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
        </Defs>

        {glow ? (
          <Circle
            cx={metrics.center}
            cy={metrics.center}
            r={metrics.glowRadius}
            fill={`url(#${glowGradId})`}
            opacity={isDark ? 0.62 : 0.48}
          />
        ) : null}

        <Circle
          cx={metrics.center}
          cy={metrics.center}
          r={metrics.sphereRadius}
          fill={`url(#${bodyGradId})`}
        />

        {!shellOnly ? (
          <>
            <Circle
              cx={metrics.highlight.cx}
              cy={metrics.highlight.cy}
              r={metrics.highlight.r}
              fill={`url(#${highlightGradId})`}
              opacity={isDark ? 0.38 : 0.46}
            />

            <Circle
              cx={metrics.depth.cx}
              cy={metrics.depth.cy}
              r={metrics.depth.r}
              fill={`url(#${depthGradId})`}
              opacity={isDark ? 0.42 : 0.28}
            />

            <Circle
              cx={metrics.spec.cx}
              cy={metrics.spec.cy}
              r={metrics.spec.r}
              fill="rgba(255,255,255,0.75)"
              opacity={isDark ? 0.35 : 0.42}
            />
          </>
        ) : null}
      </Svg>
    </View>
  );
}
