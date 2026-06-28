import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import GlassBarShell, { GLASS_BAR_BUTTON_RADIUS } from './GlassBarShell';
import GlassSurface from './GlassSurface';
import { useTheme } from '../context/ThemeContext';

/** Fixed height — Atrás and Siguiente must match without flex growth. */
export const STEP_FOOTER_BUTTON_HEIGHT = 52;

type StepFooterGlassButtonProps = {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  iconPlacement?: 'leading' | 'trailing';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function StepFooterGlassButton({
  onPress,
  label,
  variant = 'primary',
  icon,
  iconPlacement = 'trailing',
  style,
  accessibilityLabel,
}: StepFooterGlassButtonProps) {
  const { isDark } = useTheme();
  const isPrimary = variant === 'primary';

  const content = (
    <View style={styles.content}>
      {iconPlacement === 'leading' ? icon : null}
      <Text
        className={
          isPrimary
            ? 'text-lg font-bold text-white'
            : 'text-lg font-bold text-neutral-700 dark:text-neutral-300'
        }
      >
        {label}
      </Text>
      {iconPlacement === 'trailing' ? icon : null}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.pressable, style, pressed ? styles.pressed : null]}
    >
      {isPrimary ? (
        <GlassBarShell
          style={styles.shell}
          tintColor={isDark ? 'rgba(99, 102, 241, 0.52)' : 'rgba(79, 70, 229, 0.46)'}
          overlayClassName={isDark ? 'bg-indigo-500/32' : 'bg-indigo-600/28'}
          contentClassName="h-full w-full items-center justify-center"
        >
          {content}
        </GlassBarShell>
      ) : (
        <GlassSurface
          liquid
          liquidBorder="perimeter"
          borderRadius={GLASS_BAR_BUTTON_RADIUS}
          style={[styles.shell, styles.secondaryShell]}
          contentClassName="h-full w-full items-center justify-center"
        >
          {content}
        </GlassSurface>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  shell: {
    width: '100%',
    height: STEP_FOOTER_BUTTON_HEIGHT,
  },
  content: {
    height: STEP_FOOTER_BUTTON_HEIGHT,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  secondaryShell: {
    borderRadius: GLASS_BAR_BUTTON_RADIUS,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
