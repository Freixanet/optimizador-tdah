import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Layers, List } from 'lucide-react-native';
import FloatingGlassButton from './FloatingGlassButton';
import MenuTwoLines from './MenuTwoLines';
import { SIDEBAR_HEADER_BUTTON_SIZE } from './sidebarLayout';
import { useTheme } from '../context/ThemeContext';

type ReadingProgressBarProps = {
  viewAll: boolean;
  isComplete: boolean;
  stepProgress: number;
  progressLabel: string;
  onToggleSidebar: () => void;
  onToggleViewMode?: () => void;
  /** UI-thread scroll ratio for fluid view-all progress (0–1). */
  scrollProgressShared?: SharedValue<number>;
};

export default function ReadingProgressBar({
  viewAll,
  isComplete,
  stepProgress,
  progressLabel,
  onToggleSidebar,
  onToggleViewMode,
  scrollProgressShared,
}: ReadingProgressBarProps) {
  const { isDark } = useTheme();
  const navIconColor = isDark ? '#d4d4d4' : '#525252';
  const stepProgressValue = useSharedValue(stepProgress / 100);

  useEffect(() => {
    if (viewAll) return;
    stepProgressValue.value = withTiming(stepProgress / 100, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [stepProgress, stepProgressValue, viewAll]);

  const barStyle = useAnimatedStyle(() => {
    const ratio = viewAll && scrollProgressShared ? scrollProgressShared.value : stepProgressValue.value;
    return {
      width: `${Math.min(100, Math.max(0, ratio * 100))}%`,
    };
  });

  const viewModeIconColor = viewAll ? (isDark ? '#a5b4fc' : '#4f46e5') : isDark ? '#a3a3a3' : '#737373';
  const viewModeLabelClass = viewAll
    ? 'text-indigo-700 dark:text-indigo-300'
    : 'text-neutral-600 dark:text-neutral-300';

  return (
    <View className="shrink-0 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/5">
      <View className="flex-row items-center justify-between gap-3 px-3 py-2.5">
        <View className="min-w-0 flex-1 flex-row items-center gap-4">
          <FloatingGlassButton
            onPress={onToggleSidebar}
            accessibilityLabel="Abrir navegación"
            shape="circle"
            size={SIDEBAR_HEADER_BUTTON_SIZE}
          >
            <MenuTwoLines size={17} color={navIconColor} />
          </FloatingGlassButton>
          <Text
            className="flex-1 text-sm font-bold text-neutral-800 dark:text-neutral-100"
            numberOfLines={1}
          >
            {progressLabel}
          </Text>
        </View>
        {!isComplete && onToggleViewMode ? (
          <FloatingGlassButton
            onPress={onToggleViewMode}
            accessibilityLabel={viewAll ? 'Cambiar a paso a paso' : 'Cambiar a vista completa'}
            shape="rounded"
          >
            {viewAll ? <List size={14} color={viewModeIconColor} /> : <Layers size={14} color={viewModeIconColor} />}
            <Text className={`text-[11px] font-semibold ${viewModeLabelClass}`}>
              {viewAll ? 'Paso a paso' : 'Vista completa'}
            </Text>
          </FloatingGlassButton>
        ) : null}
      </View>
      <View className="h-2 bg-neutral-200 dark:bg-neutral-800">
        <Animated.View
          style={barStyle}
          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-r-full"
          accessibilityRole="progressbar"
        />
      </View>
    </View>
  );
}
