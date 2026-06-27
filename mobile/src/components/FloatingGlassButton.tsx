import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import GlassSurface from './GlassSurface';
import { useTheme } from '../context/ThemeContext';

type FloatingGlassButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  shape?: 'circle' | 'pill';
  tone?: 'neutral' | 'accent';
  /** Circle diameter in points. Defaults to {@link FLOATING_CIRCLE_SIZE}. */
  size?: number;
};

export const FLOATING_CIRCLE_SIZE = 52;
export const FLOATING_PILL_MIN_HEIGHT = 48;

export function FloatingGlassShell({
  children,
  shape = 'pill',
  tone = 'neutral',
  size = FLOATING_CIRCLE_SIZE,
}: Pick<FloatingGlassButtonProps, 'children' | 'shape' | 'tone' | 'size'>) {
  const { isDark } = useTheme();
  const isAccent = tone === 'accent';
  const isCircle = shape === 'circle';

  const circleSizeStyle = {
    width: size,
    height: size,
  };

  if (isAccent) {
    return (
      <View
        style={[
          styles.shadow,
          styles.accentShadow,
          isCircle ? [circleSizeStyle, styles.circleShell] : styles.pillShell,
          { backgroundColor: isDark ? '#6366f1' : '#4f46e5' },
        ]}
      >
        <View style={isCircle ? styles.circleContent : styles.pillContent}>{children}</View>
      </View>
    );
  }

  if (isCircle) {
    return (
      <View style={[styles.shadow, circleSizeStyle]}>
        <GlassSurface
          liquid
          borderRadius={size / 2}
          className={`h-full w-full overflow-hidden rounded-full border ${
            isDark ? 'border-white/10' : 'border-white/60'
          }`}
          contentClassName="h-full w-full items-center justify-center"
        >
          <View style={styles.circleContent}>{children}</View>
        </GlassSurface>
      </View>
    );
  }

  return (
    <View style={styles.shadow}>
      <GlassSurface
        liquid
        borderRadius={9999}
        className={`overflow-hidden rounded-full border ${
          isDark ? 'border-white/10' : 'border-white/60'
        }`}
        contentClassName="items-center justify-center"
      >
        <View style={styles.pillContent}>{children}</View>
      </GlassSurface>
    </View>
  );
}

export default function FloatingGlassButton({
  onPress,
  accessibilityLabel,
  children,
  shape = 'pill',
  tone = 'neutral',
  size = FLOATING_CIRCLE_SIZE,
}: FloatingGlassButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <FloatingGlassShell shape={shape} tone={tone} size={size}>
        {children}
      </FloatingGlassShell>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  accentShadow: {
    shadowColor: '#4f46e5',
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  circleShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillShell: {
    minHeight: FLOATING_PILL_MIN_HEIGHT,
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(129, 140, 248, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
