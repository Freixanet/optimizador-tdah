import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { ArrowUp } from 'lucide-react-native';
import GlassSurface from './GlassSurface';
import { useTheme } from '../context/ThemeContext';

const SIZE = 38;
const ICON_SIZE = 17;

type ComposerSendButtonProps = {
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel?: string;
};

export default function ComposerSendButton({
  onPress,
  disabled,
  accessibilityLabel = 'Enviar',
}: ComposerSendButtonProps) {
  const { isDark } = useTheme();

  const iconColor = disabled
    ? isDark
      ? '#737373'
      : '#a3a3a3'
    : isDark
      ? '#e8eaff'
      : '#3730a3';

  const strokeColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [pressed && !disabled ? styles.pressed : null]}
    >
      {disabled ? (
        <View
          style={[
            styles.shell,
            isDark ? styles.disabledShellDark : styles.disabledShellLight,
          ]}
        >
          <ArrowUp size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />
        </View>
      ) : (
        <GlassSurface
          liquid
          liquidBorder="none"
          borderRadius={SIZE / 2}
          style={styles.shell}
          tintColor={isDark ? 'rgba(99, 102, 241, 0.52)' : 'rgba(79, 70, 229, 0.46)'}
          overlayClassName={isDark ? 'bg-indigo-500/32' : 'bg-indigo-600/28'}
          perimeterStrokeColor={strokeColor}
          perimeterRingDiameter={SIZE}
          contentClassName="h-full w-full items-center justify-center"
        >
          <ArrowUp size={ICON_SIZE} color={iconColor} strokeWidth={2.25} />
        </GlassSurface>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledShellLight: {
    backgroundColor: 'rgba(115, 115, 115, 0.08)',
  },
  disabledShellDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
