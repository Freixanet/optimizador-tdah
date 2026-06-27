import React from 'react';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ComposerDockProps = {
  children: React.ReactNode;
  gap?: number;
  onHeightChange?: (height: number) => void;
};

export default function ComposerDock({
  children,
  gap = 12,
  onHeightChange,
}: ComposerDockProps) {
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const insetBottom = insets.bottom;

  const animatedStyle = useAnimatedStyle(() => {
    const closedBottom = Math.max(insetBottom, gap);
    const bottom = Math.max(keyboard.height.value + gap, closedBottom);
    return { bottom };
  }, [insetBottom, gap]);

  return (
    <Animated.View
      className="absolute left-0 right-0 px-4"
      style={animatedStyle}
      onLayout={(event) => onHeightChange?.(event.nativeEvent.layout.height)}
    >
      {children}
    </Animated.View>
  );
}
