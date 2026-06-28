import React, { useCallback, useEffect, useRef } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import LiquidGlassSurface, { type LiquidGlassVariant } from './LiquidGlassSurface';
import { useGlassAccessibility } from '../hooks/useGlassAccessibility';
import { useTheme } from '../context/ThemeContext';
import { COMPOSER_DARK_SURFACE, liquidGlassShellClasses } from '@shared/uiTokens';

/**
 * Composer-only glass motion shell.
 *
 * **Native (expo-glass-effect):** stable `regular` material + optional `isInteractive`.
 * Material does NOT change on focus — motion is overlay/wrapper only.
 *
 * **Reanimated:** scale pulse, ring flash, sheen sweep. Never GlassView opacity.
 */
type LiquidGlassMotionShellProps = {
  children: React.ReactNode;
  borderRadius: number;
  variant?: LiquidGlassVariant;
  tintColor?: string;
  focused?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  className?: string;
  style?: StyleProp<ViewStyle>;
  contentClassName?: string;
};

const PEAK_SCALE = 1.018;
const FOCUSED_IDLE_SCALE = 1.006;
const PEAK_SPRING = { damping: 15, stiffness: 430, mass: 0.68 };
const SETTLE_SPRING = { damping: 18, stiffness: 340, mass: 0.78 };
const BLUR_SPRING = { damping: 20, stiffness: 320, mass: 0.85 };

const RING_PEAK_MS = 100;
const RING_FADE_MS = 160;
const SHEEN_MS = 180;
const PULSE_DEBOUNCE_MS = 140;

function triggerHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function LiquidGlassMotionShell({
  children,
  borderRadius,
  variant = 'composer',
  tintColor,
  focused = false,
  inputRef,
  className = '',
  style,
  contentClassName = '',
}: LiquidGlassMotionShellProps) {
  const { isDark } = useTheme();
  const { reduceMotion } = useGlassAccessibility();

  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);
  const sheenProgress = useSharedValue(0);
  const shellWidth = useSharedValue(0);
  const lastPulseAt = useRef(0);

  const resolvedTint =
    tintColor ??
    (variant === 'composer'
      ? isDark
        ? COMPOSER_DARK_SURFACE
        : 'rgba(255, 255, 255, 0.45)'
      : undefined);

  const settleScale = useCallback(
    (isFocused: boolean) => (isFocused ? FOCUSED_IDLE_SCALE : 1),
    []
  );

  const firePulse = useCallback(
    (isFocused: boolean, withHaptic: boolean) => {
      if (withHaptic) triggerHaptic();

      if (reduceMotion) {
        scale.value = settleScale(isFocused);
        ringOpacity.value = isFocused ? 0.18 : 0;
        sheenProgress.value = 0;
        return;
      }

      scale.value = withSequence(
        withSpring(PEAK_SCALE, PEAK_SPRING),
        withSpring(settleScale(isFocused), SETTLE_SPRING)
      );

      ringOpacity.value = withSequence(
        withTiming(0.42, { duration: RING_PEAK_MS, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: RING_FADE_MS, easing: Easing.out(Easing.cubic) })
      );

      sheenProgress.value = 0;
      sheenProgress.value = withTiming(1, {
        duration: SHEEN_MS,
        easing: Easing.out(Easing.cubic),
      });
    },
    [reduceMotion, ringOpacity, scale, settleScale, sheenProgress]
  );

  const requestPulse = useCallback(
    (isFocused: boolean, withHaptic: boolean) => {
      const now = Date.now();
      if (now - lastPulseAt.current < PULSE_DEBOUNCE_MS) return;
      lastPulseAt.current = now;
      firePulse(isFocused, withHaptic);
    },
    [firePulse]
  );

  const handlePressIn = useCallback(() => {
    requestPulse(focused, true);
    inputRef?.current?.focus();
  }, [focused, inputRef, requestPulse]);

  useEffect(() => {
    if (focused) {
      requestPulse(true, true);
      return;
    }

    if (reduceMotion) {
      scale.value = 1;
      ringOpacity.value = 0;
      sheenProgress.value = 0;
      return;
    }

    scale.value = withSpring(1, BLUR_SPRING);
    ringOpacity.value = withTiming(0, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [focused, reduceMotion, requestPulse, ringOpacity, scale, sheenProgress]);

  const shellMotionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const sheenStyle = useAnimatedStyle(() => {
    const width = shellWidth.value || 1;
    return {
      opacity: interpolate(sheenProgress.value, [0, 0.2, 0.65, 1], [0, 0.12, 0.08, 0]),
      transform: [
        { skewX: '-14deg' },
        { translateX: interpolate(sheenProgress.value, [0, 1], [-width * 0.6, width]) },
      ],
    };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    shellWidth.value = event.nativeEvent.layout.width;
  };

  const ringColor = isDark ? 'rgba(199, 210, 254, 0.72)' : 'rgba(99, 102, 241, 0.45)';
  const sheenColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.22)';

  return (
    <Animated.View style={shellMotionStyle} onLayout={handleLayout}>
      <Pressable onPressIn={handlePressIn} accessibilityRole="none">
        <View
          className={liquidGlassShellClasses(isDark, className)}
          style={[styles.shell, { borderRadius }, style]}
        >
          <LiquidGlassSurface
            style={StyleSheet.absoluteFill}
            borderRadius={borderRadius}
            variant={variant}
            tintColor={resolvedTint}
            interactive={focused}
          >
            <View />
          </LiquidGlassSurface>

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.ring,
              { borderRadius, borderColor: ringColor },
              ringStyle,
            ]}
          />

          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.sheenClip, { borderRadius }]}
          >
            <Animated.View style={[styles.sheenBand, { backgroundColor: sheenColor }, sheenStyle]} />
          </View>

          <View className={`relative ${contentClassName}`.trim()}>{children}</View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
    overflow: 'hidden',
  },
  ring: {
    borderWidth: 1,
  },
  sheenClip: {
    overflow: 'hidden',
  },
  sheenBand: {
    position: 'absolute',
    top: -16,
    bottom: -16,
    width: '28%',
  },
});
