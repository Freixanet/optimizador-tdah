import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useTheme } from '../context/ThemeContext';

export type LiquidGlassVariant = 'regular' | 'clear' | 'composer';

export type LiquidGlassSurfaceProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius: number;
  tintColor?: string;
  variant: LiquidGlassVariant;
};

export function canUseNativeLiquidGlass(reduceTransparency: boolean): boolean {
  if (Platform.OS !== 'ios') return false;
  if (Number(Platform.Version) < 26) return false;
  if (reduceTransparency) return false;
  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

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
      backgroundColor: isDark ? 'rgba(38, 38, 38, 0.95)' : 'rgba(255, 255, 255, 0.96)',
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

function glassEffectStyle(variant: LiquidGlassVariant) {
  return variant === 'clear' ? 'clear' : 'regular';
}

export default function LiquidGlassSurface({
  children,
  style,
  borderRadius,
  tintColor,
  variant,
}: LiquidGlassSurfaceProps) {
  const { isDark } = useTheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const transparencySub = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency
    );
    const motionSub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      transparencySub.remove();
      motionSub.remove();
    };
  }, []);

  const shellStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
  };

  const nativeGlass = canUseNativeLiquidGlass(reduceTransparency);
  const fallback = fallbackColors(isDark, variant, tintColor);

  if (nativeGlass) {
    const styleKey = glassEffectStyle(variant);
    return (
      <View style={[shellStyle, style]}>
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle={
            reduceMotion ? styleKey : { style: styleKey, animate: false }
          }
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
