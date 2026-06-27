import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import AtomCanvasIcon from './AtomCanvasIcon';

const PHASES = [
  'Leyendo la fuente',
  'Detectando la estructura',
  'Destilando el núcleo',
  'Generando los pasos',
] as const;

type LoadingStateProps = {
  onCancel: () => void;
};

function ShimmerBlock({
  className = '',
  reduceMotion,
  delay = 0,
}: {
  className?: string;
  reduceMotion: boolean;
  delay?: number;
}) {
  const translateX = useSharedValue(-120);

  useEffect(() => {
    if (reduceMotion) return;
    translateX.value = withRepeat(
      withTiming(240, { duration: 1600, easing: Easing.linear }),
      -1,
      false
    );
  }, [delay, reduceMotion, translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className={`overflow-hidden rounded-md bg-zinc-200/70 dark:bg-zinc-800/70 border border-indigo-500/10 ${className}`}>
      {!reduceMotion ? (
        <Animated.View
          style={shimmerStyle}
          className="absolute inset-y-0 w-1/2 bg-indigo-400/20 dark:bg-indigo-500/10"
        />
      ) : null}
    </View>
  );
}

export default function LoadingState({ onCancel }: LoadingStateProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((current) => (current + 1) % PHASES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center px-6 bg-neutral-50 dark:bg-neutral-900">
      <View className="w-full max-w-md">
        <View className="flex-row items-center gap-3 mb-8">
          <AtomCanvasIcon size={44} />
          <Text className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {PHASES[phaseIndex]}
          </Text>
        </View>

        <View className="gap-3">
          <ShimmerBlock className="h-4 w-3/4" reduceMotion={reduceMotion} />
          <ShimmerBlock className="h-4 w-full" reduceMotion={reduceMotion} delay={100} />
          <ShimmerBlock className="h-4 w-5/6" reduceMotion={reduceMotion} delay={200} />
          <View className="mt-4 gap-3">
            <ShimmerBlock className="h-24 w-full rounded-2xl" reduceMotion={reduceMotion} delay={300} />
            <ShimmerBlock className="h-16 w-full rounded-2xl" reduceMotion={reduceMotion} delay={400} />
          </View>
        </View>

        <Pressable
          onPress={onCancel}
          className="mt-10 self-center px-5 py-3 rounded-xl border border-neutral-200 dark:border-white/10"
        >
          <Text className="text-neutral-700 dark:text-neutral-300 font-semibold">Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}
