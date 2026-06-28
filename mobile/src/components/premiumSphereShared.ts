import { ViewStyle } from 'react-native';
import type { LiquidGlassAtomOrbProps, LiquidGlassIntensity, LiquidGlassVariant } from './liquidGlassAtomOrbShared';

export type { LiquidGlassAtomOrbProps, LiquidGlassIntensity, LiquidGlassVariant };
export type SphereVariant = LiquidGlassVariant;

export type PremiumSphereProps = LiquidGlassAtomOrbProps & {
  /** @deprecated Maps to intensity="subtle" when false. */
  glow?: boolean;
  style?: ViewStyle;
  /** When <= 0.92, orb radius uses s * 0.37 for clipped embed contexts. */
  radiusRatio?: number;
  /** When true, hides the internal atom (glass shell only). */
  shellOnly?: boolean;
};

/** @deprecated Legacy palette helper — kept for PremiumSphereFallback. */
export type SpherePalette = {
  hot: string;
  light: string;
  mid: string;
  deep: string;
  core: string;
  glow: string;
  glowOuter: string;
};

/** @deprecated Legacy palette helper — kept for PremiumSphereFallback. */
export function buildPalette(variant: SphereVariant, isDark: boolean): SpherePalette {
  if (variant === 'blue') {
    return {
      hot: isDark ? '#F0F9FF' : '#FFFFFF',
      light: isDark ? '#7DD3FC' : '#BAE6FD',
      mid: isDark ? '#38BDF8' : '#0EA5E9',
      deep: isDark ? '#1E3A8A' : '#1D4ED8',
      core: isDark ? '#020617' : '#0F172A',
      glow: isDark ? 'rgba(56, 189, 248, 0.55)' : 'rgba(14, 165, 233, 0.42)',
      glowOuter: 'transparent',
    };
  }

  if (variant === 'mono') {
    return {
      hot: isDark ? '#F9FAFB' : '#FFFFFF',
      light: isDark ? '#D1D5DB' : '#E5E7EB',
      mid: isDark ? '#9CA3AF' : '#6B7280',
      deep: isDark ? '#374151' : '#4B5563',
      core: isDark ? '#030712' : '#111827',
      glow: isDark ? 'rgba(156, 163, 175, 0.4)' : 'rgba(107, 114, 128, 0.28)',
      glowOuter: 'transparent',
    };
  }

  return {
    hot: isDark ? '#F5F3FF' : '#FFFFFF',
    light: isDark ? '#C4B5FD' : '#DDD6FE',
    mid: isDark ? '#8B5CF6' : '#7C3AED',
    deep: isDark ? '#312E81' : '#4338CA',
    core: isDark ? '#050816' : '#1E1B4B',
    glow: isDark ? 'rgba(139, 92, 246, 0.52)' : 'rgba(124, 58, 237, 0.38)',
    glowOuter: 'transparent',
  };
}

/** @deprecated Legacy metrics helper — kept for PremiumSphereFallback. */
export function buildSphereMetrics(size: number, radiusRatio: number) {
  const center = size / 2;
  const half = center;
  const sphereRadius = half * radiusRatio;
  const glowRadius = half * Math.min(radiusRatio + 0.06, 0.98);

  return {
    center,
    sphereRadius,
    glowRadius,
    glowBlur: size * 0.14,
    highlight: {
      cx: center - sphereRadius * 0.34,
      cy: center - sphereRadius * 0.38,
      r: sphereRadius * 0.42,
    },
    depth: {
      cx: center + sphereRadius * 0.12,
      cy: center + sphereRadius * 0.58,
      r: sphereRadius * 0.72,
    },
    spec: {
      cx: center - sphereRadius * 0.62,
      cy: center - sphereRadius * 0.64,
      r: sphereRadius * 0.08,
    },
    body: {
      cx: center - half * 0.16,
      cy: center - half * 0.18,
      r: sphereRadius * 1.08,
    },
  };
}
