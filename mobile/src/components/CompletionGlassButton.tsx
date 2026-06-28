import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RADII } from '@shared/uiTokens';
import GlassSurface from './GlassSurface';
import { useTheme } from '../context/ThemeContext';

type CompletionGlassButtonProps = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: 'neutral' | 'accent';
  accessibilityLabel?: string;
};

export default function CompletionGlassButton({
  label,
  onPress,
  icon,
  variant = 'neutral',
  accessibilityLabel,
}: CompletionGlassButtonProps) {
  const { isDark } = useTheme();
  const isAccent = variant === 'accent';

  const accentTint = isDark ? 'rgba(99, 102, 241, 0.52)' : 'rgba(79, 70, 229, 0.46)';
  const accentOverlay = isDark ? 'bg-indigo-500/32' : 'bg-indigo-600/28';
  const neutralOverlay = isDark ? 'bg-white/[0.05]' : 'bg-white/45';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : null]}
    >
      <GlassSurface
        liquid
        liquidBorder="none"
        borderRadius={RADII.md}
        style={styles.shell}
        tintColor={isAccent ? accentTint : undefined}
        overlayClassName={isAccent ? accentOverlay : neutralOverlay}
        contentClassName="w-full items-center justify-center"
      >
        <View style={styles.content}>
          {icon}
          <Text
            className={
              isAccent
                ? 'text-center font-semibold text-white'
                : 'text-center font-semibold text-neutral-700 dark:text-neutral-300'
            }
          >
            {label}
          </Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    alignSelf: 'flex-start',
  },
  shell: {
    width: '100%',
    borderRadius: RADII.md,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 52,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
