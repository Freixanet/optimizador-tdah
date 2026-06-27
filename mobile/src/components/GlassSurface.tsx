import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { BLUR_INTENSITY } from '@shared/uiTokens';
import { useTheme } from '../context/ThemeContext';
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
};

function mapLiquidVariant(variant: 'default' | 'composer'): LiquidGlassVariant {
  return variant === 'composer' ? 'composer' : 'regular';
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
}: GlassSurfaceProps) {
  const { isDark } = useTheme();

  if (liquid) {
    const tint =
      variant === 'composer'
        ? isDark
          ? 'rgba(38, 38, 38, 0.35)'
          : 'rgba(255, 255, 255, 0.45)'
        : undefined;

    return (
      <View className={className} style={style} onLayout={onShellLayout}>
        <LiquidGlassSurface
          style={StyleSheet.absoluteFill}
          borderRadius={borderRadius}
          variant={mapLiquidVariant(variant)}
          tintColor={tint}
        >
          <View />
        </LiquidGlassSurface>
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
        ? 'bg-neutral-900'
        : 'bg-neutral-50'
      : isDark
        ? 'bg-neutral-900/80'
        : 'bg-white/80');

  return (
    <View className={className} style={style} onLayout={onShellLayout}>
      <View className={`absolute inset-0 overflow-hidden ${className}`}>
        {!solid ? (
          <BlurView
            intensity={resolvedIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
        ) : null}
        <View className={`absolute inset-0 ${overlay}`} />
      </View>
      <View className={`relative z-10 ${contentClassName}`.trim()}>{children}</View>
    </View>
  );
}
