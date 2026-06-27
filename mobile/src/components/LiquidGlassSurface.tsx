import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '../context/ThemeContext';
import { useGlassAccessibility } from '../hooks/useGlassAccessibility';
import { COMPOSER_DARK_SURFACE } from '@shared/uiTokens';

export type LiquidGlassVariant = 'regular' | 'clear' | 'composer';

export type GlassEffectStyleName = 'clear' | 'regular' | 'none';

export type LiquidGlassSurfaceProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius: number;
  tintColor?: string;
  variant: LiquidGlassVariant;
  /** Native UIGlassEffect interactive mode (expo `isInteractive`). No visual style change. */
  interactive?: boolean;
};

export { canUseNativeLiquidGlass } from '../logic/glassAvailability';

function fallbackColors(
  isDark: boolean,
  variant: LiquidGlassVariant,
  tintColor?: string
): { backgroundColor: string; borderColor: string } {
  if (tintColor) {
    return {
      backgroundColor: tintColor,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    };
  }
  if (variant === 'composer') {
    return {
      backgroundColor: isDark ? COMPOSER_DARK_SURFACE : 'rgba(255, 255, 255, 0.96)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    };
  }
  if (variant === 'clear') {
    return {
      backgroundColor: isDark ? 'rgba(23, 23, 23, 0.82)' : 'rgba(255, 255, 255, 0.82)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    };
  }
  return {
    backgroundColor: isDark ? 'rgba(23, 23, 23, 0.88)' : 'rgba(255, 255, 255, 0.88)',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
  };
}

/** Stable native glass style — composer always stays `regular` (no idle/focus material swap). */
export function resolveGlassEffectStyle(variant: LiquidGlassVariant): GlassEffectStyleName {
  if (variant === 'clear') return 'clear';
  return 'regular';
}

export default function LiquidGlassSurface({
  children,
  style,
  borderRadius,
  tintColor,
  variant,
  interactive = false,
}: LiquidGlassSurfaceProps) {
  const { isDark } = useTheme();
  const { reduceMotion, nativeGlass } = useGlassAccessibility();

  const shellStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
  };

  const fallback = fallbackColors(isDark, variant, tintColor);

  if (nativeGlass) {
    return (
      <View style={[shellStyle, style]}>
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle={resolveGlassEffectStyle(variant)}
          isInteractive={interactive && !reduceMotion}
          tintColor={tintColor}
          colorScheme={isDark ? 'dark' : 'light'}
        />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        shellStyle,
        {
          backgroundColor: fallback.backgroundColor,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: fallback.borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'relative',
  },
});
