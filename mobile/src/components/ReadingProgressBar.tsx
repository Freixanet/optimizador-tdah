import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Layers, List } from 'lucide-react-native';
import MenuTwoLines from './MenuTwoLines';

type ReadingProgressBarProps = {
  viewAll: boolean;
  isComplete: boolean;
  stepProgress: number;
  progressLabel: string;
  onToggleSidebar: () => void;
  onToggleViewMode?: () => void;
  scrollProgress?: number;
};

export default function ReadingProgressBar({
  viewAll,
  isComplete,
  stepProgress,
  progressLabel,
  onToggleSidebar,
  onToggleViewMode,
  scrollProgress = 0,
}: ReadingProgressBarProps) {
  const progress = useSharedValue(viewAll ? scrollProgress : stepProgress / 100);
  const [shownPercent, setShownPercent] = useState(
    viewAll ? Math.round(scrollProgress * 100) : Math.round(stepProgress)
  );

  useEffect(() => {
    const target = viewAll ? scrollProgress : stepProgress / 100;
    progress.value = withSpring(target, { damping: 38, stiffness: 320, mass: 0.24 });
    setShownPercent(viewAll ? Math.round(scrollProgress * 100) : Math.round(stepProgress));
  }, [progress, scrollProgress, stepProgress, viewAll]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progress.value * 100))}%`,
  }));

  return (
    <View className="shrink-0 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/5">
      <View className="flex-row items-center justify-between gap-3 py-2.5 px-3">
        <View className="flex-row min-w-0 items-center gap-2 flex-1">
          <Pressable
            onPress={onToggleSidebar}
            className="ml-1 w-8 h-8 rounded-full bg-neutral-500/10 items-center justify-center"
            accessibilityLabel="Abrir navegación"
          >
            <MenuTwoLines size={18} color="#525252" />
          </Pressable>
          <Text
            className="flex-1 text-xs font-bold text-neutral-800 dark:text-neutral-100"
            numberOfLines={1}
          >
            {progressLabel}
          </Text>
        </View>
        {!isComplete && onToggleViewMode ? (
          <Pressable
            onPress={onToggleViewMode}
            className={`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
              viewAll
                ? 'bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
                : 'border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60'
            }`}
            accessibilityLabel={viewAll ? 'Cambiar a paso a paso' : 'Cambiar a vista completa'}
          >
            {viewAll ? <List size={14} color="#4f46e5" /> : <Layers size={14} color="#737373" />}
            <Text
              className={`text-[11px] font-semibold ${
                viewAll ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {viewAll ? 'Paso a paso' : 'Vista completa'}
            </Text>
          </Pressable>
        ) : null}
        <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{shownPercent}%</Text>
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
