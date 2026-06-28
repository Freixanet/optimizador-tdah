import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { BLUR_INTENSITY, COMPOSER_DARK_SURFACE, liquidGlassShellClasses } from '@shared/uiTokens';
import { useTheme } from '../context/ThemeContext';
import { useDeferredGlassMount } from '../hooks/useDeferredGlassMount';
import GlassPerimeterRing from './GlassPerimeterRing';
import LiquidGlassSurface, { type LiquidGlassVariant } from './LiquidGlassSurface';

type GlassSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  overlayClassName?: string;
  variant?: 'default' | 'composer';
  solid?: boolean;
  contentClassName?: string;
  onShellLayout?: (event: import('react-native').LayoutChangeEvent) => void;
  /** Native iOS 26 Liquid Glass (floating UI only). */
  liquid?: boolean;
  borderRadius?: number;
  /** Perimeter border in light mode only; `bottom` for sheet headers; `none` to opt out. */
  liquidBorder?: 'perimeter' | 'bottom' | 'none';
  /** Overrides default liquid-glass material tint. */
  tintColor?: string;
  /** Hairline ring drawn over the glass (avoids layout border gaps on rounded rects). */
  perimeterStrokeColor?: string;
  /** When set, draws a vector ring (best for small circles). */
  perimeterRingDiameter?: number;
  /** Pull native glass slightly inward so its edge does not fight the outer ring. */
  glassInset?: number;
  /** Native liquid-glass material (`clear` is softer on small controls). */
  liquidMaterial?: 'regular' | 'clear';
  /** Bumps native glass remount when value changes (e.g. stream finished). */
  glassRefreshKey?: unknown;
};

function mapLiquidVariant(
  variant: 'default' | 'composer',
  liquidMaterial: 'regular' | 'clear'
): LiquidGlassVariant {
  if (liquidMaterial === 'clear') return 'clear';
  return variant === 'composer' ? 'composer' : 'regular';
}

function perimeterStrokeStyle(borderRadius: number, color: string): ViewStyle {
  const strokeWidth = 1;
  const inset = strokeWidth / 2;
  return {
    position: 'absolute',
    top: inset,
    left: inset,
    right: inset,
    bottom: inset,
    borderRadius: Math.max(0, borderRadius - inset),
    borderWidth: strokeWidth,
    borderColor: color,
  };
}

function glassInsetStyle(inset: number): ViewStyle {
  return {
    position: 'absolute',
    top: inset,
    left: inset,
    right: inset,
    bottom: inset,
  };
}

export default function GlassSurface({
  children,
  className = '',
  style,
  intensity,
  overlayClassName,
  variant = 'default',
  solid = false,
  contentClassName = '',
  onShellLayout,
  liquid = false,
  borderRadius = 20,
  liquidBorder = 'perimeter',
  tintColor,
  perimeterStrokeColor,
  perimeterRingDiameter,
  glassInset = 0,
  liquidMaterial = 'regular',
  glassRefreshKey,
}: GlassSurfaceProps) {
  const { isDark } = useTheme();
  const deferredGlass = useDeferredGlassMount(glassRefreshKey);

  if (liquid) {
    const resolvedTint =
      tintColor ??
      (variant === 'composer'
        ? isDark
          ? COMPOSER_DARK_SURFACE
          : 'rgba(255, 255, 255, 0.45)'
        : undefined);

    const innerRadius = Math.max(0, borderRadius - glassInset);

    return (
      <View
        className={liquidGlassShellClasses(isDark, className, liquidBorder)}
        style={[
          { borderRadius, overflow: 'hidden' },
          Platform.OS === 'ios' ? { borderCurve: 'continuous' } : null,
          style,
        ]}
        collapsable={false}
        onLayout={(event) => {
          deferredGlass.onShellLayout(event);
          onShellLayout?.(event);
        }}
      >
        <LiquidGlassSurface
          style={glassInset > 0 ? glassInsetStyle(glassInset) : StyleSheet.absoluteFill}
          borderRadius={innerRadius}
          variant={mapLiquidVariant(variant, liquidMaterial)}
          tintColor={resolvedTint}
          glassEnabled={deferredGlass.glassActive}
          glassMountKey={deferredGlass.glassMountKey}
        >
          <View />
        </LiquidGlassSurface>
        {overlayClassName ? (
          <View
            pointerEvents="none"
            className={`absolute inset-0 ${overlayClassName}`}
            style={{ borderRadius, overflow: 'hidden' }}
          />
        ) : null}
        {perimeterStrokeColor && perimeterRingDiameter ? (
          <GlassPerimeterRing diameter={perimeterRingDiameter} color={perimeterStrokeColor} />
        ) : perimeterStrokeColor ? (
          <View
            pointerEvents="none"
            style={perimeterStrokeStyle(borderRadius, perimeterStrokeColor)}
          />
        ) : null}
        <View className={`relative z-10 ${contentClassName}`.trim()}>{children}</View>
      </View>
    );
  }

  const resolvedIntensity =
    intensity ?? (variant === 'composer' ? (isDark ? 28 : 24) : BLUR_INTENSITY);
  const overlay =
    overlayClassName ??
    (variant === 'composer'
      ? isDark
        ? 'bg-[#3E4041]'
        : 'bg-neutral-50'
      : isDark
        ? 'bg-neutral-900/80'
        : 'bg-white/80');

  return (
    <View className={className} style={[{ borderRadius }, style]} onLayout={onShellLayout}>
      <View className="absolute inset-0 overflow-hidden" style={{ borderRadius }}>
        {!solid ? (
          <BlurView
            intensity={resolvedIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View className={`absolute inset-0 ${overlay}`} />
      </View>
      <View className={`relative z-10 ${contentClassName}`.trim()}>{children}</View>
    </View>
  );
}
