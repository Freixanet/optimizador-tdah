import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GlassSurface from './GlassSurface';
import LiquidGlassSurface from './LiquidGlassSurface';
import { useTheme } from '../context/ThemeContext';
import type { MapIntent } from '../logic/contracts';

type IntentSelectorProps = {
  value: MapIntent;
  onChange: (intent: MapIntent) => void;
  disabled?: boolean;
};

const OPTIONS: Array<{ id: Extract<MapIntent, 'understand' | 'apply'>; label: string }> = [
  { id: 'understand', label: 'Entender' },
  { id: 'apply', label: 'Aplicar' },
];

const PADDING = 4;
const SEGMENT_HEIGHT = 36;
const MIN_SEGMENT_WIDTH = 96;
const SPRING = { damping: 24, stiffness: 360, mass: 0.78 };
const PRESS_SPRING = { damping: 20, stiffness: 460, mass: 0.62 };

function selectedIndex(value: MapIntent): number {
  return value === 'apply' ? 1 : 0;
}

function triggerHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function IntentSelector({ value, onChange, disabled = false }: IntentSelectorProps) {
  const { isDark } = useTheme();
  const activeIndex = selectedIndex(value);
  const [segmentWidth, setSegmentWidth] = useState(0);

  const thumbX = useSharedValue(0);
  const thumbScale = useSharedValue(1);
  const thumbStretch = useSharedValue(1);
  const dragStartX = useSharedValue(0);
  const hoverIndex = useSharedValue(activeIndex);
  const segmentWidthShared = useSharedValue(0);

  const activeColor = isDark ? '#c7d2fe' : '#312e81';
  const mutedColor = isDark ? '#a3a3a3' : '#525252';

  const commitIndex = useCallback(
    (index: number) => {
      const option = OPTIONS[index];
      if (!option) return;
      if (selectedIndex(value) !== index) {
        onChange(option.id);
        triggerHaptic();
      }
    },
    [onChange, value]
  );

  const selectSegment = useCallback(
    (index: number) => {
      const max = segmentWidthShared.value || segmentWidth;
      if (max <= 0) return;
      hoverIndex.value = index;
      thumbX.value = withSpring(index * max, SPRING);
      commitIndex(index);
    },
    [commitIndex, hoverIndex, segmentWidth, segmentWidthShared, thumbX]
  );

  useEffect(() => {
    hoverIndex.value = activeIndex;
    if (segmentWidth > 0) {
      thumbX.value = withSpring(activeIndex * segmentWidth, SPRING);
    }
  }, [activeIndex, hoverIndex, segmentWidth, thumbX]);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width / OPTIONS.length;
    const nextWidth = Math.max(MIN_SEGMENT_WIDTH, width);
    setSegmentWidth(nextWidth);
    segmentWidthShared.value = nextWidth;
    thumbX.value = withSpring(activeIndex * nextWidth, SPRING);
  };

  const segmentTapGestures = OPTIONS.map((_, index) =>
    Gesture.Tap()
      .enabled(!disabled)
      .onEnd(() => {
        runOnJS(selectSegment)(index);
      })
  );

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(8)
    .onBegin(() => {
      dragStartX.value = thumbX.value;
      thumbScale.value = withSpring(1.08, PRESS_SPRING);
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      const max = segmentWidthShared.value;
      if (max <= 0) return;

      const next = clamp(dragStartX.value + event.translationX, 0, max);
      thumbX.value = next;

      const nextIndex = next >= max * 0.5 ? 1 : 0;
      if (nextIndex !== hoverIndex.value) {
        hoverIndex.value = nextIndex;
        runOnJS(triggerHaptic)();
      }

      const velocityStretch = Math.min(Math.abs(event.velocityX) / 2600, 0.14);
      const edgeStretch =
        next <= 6 || next >= max - 6 ? 0.06 : 0;
      thumbStretch.value = 1 + velocityStretch + edgeStretch;
    })
    .onEnd((event) => {
      const max = segmentWidthShared.value;
      if (max <= 0) return;

      let index = thumbX.value >= max * 0.5 ? 1 : 0;

      if (Math.abs(event.velocityX) > 450) {
        index = event.velocityX > 0 ? 1 : 0;
      }

      hoverIndex.value = index;
      thumbX.value = withSpring(index * max, SPRING);
      thumbScale.value = withSpring(1, SPRING);
      thumbStretch.value = withSpring(1, SPRING);
      runOnJS(commitIndex)(index);
    })
    .onFinalize(() => {
      thumbScale.value = withSpring(1, SPRING);
      thumbStretch.value = withSpring(1, SPRING);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    width: segmentWidthShared.value,
    height: SEGMENT_HEIGHT,
    transform: [
      { translateX: thumbX.value },
      { scale: thumbScale.value },
      { scaleX: thumbStretch.value },
    ],
  }));

  const understandLabelStyle = useAnimatedStyle(() => {
    const max = segmentWidthShared.value || 1;
    const blend = 1 - thumbX.value / max;
    return {
      color: interpolateColor(blend, [0, 1], [mutedColor, activeColor]),
      opacity: interpolate(blend, [0, 1], [0.72, 1]),
    };
  });

  const applyLabelStyle = useAnimatedStyle(() => {
    const max = segmentWidthShared.value || 1;
    const blend = thumbX.value / max;
    return {
      color: interpolateColor(blend, [0, 1], [mutedColor, activeColor]),
      opacity: interpolate(blend, [0, 1], [0.72, 1]),
    };
  });

  const labelStyles = [understandLabelStyle, applyLabelStyle];

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[styles.shell, disabled ? styles.disabled : null]}
        accessibilityRole="tablist"
      >
        <GlassSurface liquid borderRadius={999} className="rounded-full">
          <View style={styles.pad}>
            <View style={styles.track} onLayout={handleTrackLayout}>
              <Animated.View style={[styles.thumb, thumbStyle]} pointerEvents="none">
                <LiquidGlassSurface
                  borderRadius={999}
                  variant="regular"
                  style={StyleSheet.absoluteFill}
                >
                  <View />
                </LiquidGlassSurface>
                <View
                  pointerEvents="none"
                  className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-400/15"
                />
              </Animated.View>

              <View style={styles.labels}>
                {OPTIONS.map((option, index) => (
                  <GestureDetector key={option.id} gesture={segmentTapGestures[index]}>
                    <Animated.View
                      style={[styles.segment, segmentWidth > 0 ? { width: segmentWidth } : null]}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: activeIndex === index }}
                      accessibilityLabel={option.label}
                    >
                      <Animated.Text style={[styles.label, labelStyles[index]]}>
                        {option.label}
                      </Animated.Text>
                    </Animated.View>
                  </GestureDetector>
                ))}
              </View>
            </View>
          </View>
        </GlassSurface>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  shell: {
    minWidth: MIN_SEGMENT_WIDTH * OPTIONS.length + PADDING * 2,
  },
  disabled: {
    opacity: 0.4,
  },
  pad: {
    padding: PADDING,
  },
  track: {
    position: 'relative',
    minHeight: SEGMENT_HEIGHT,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 999,
    overflow: 'hidden',
  },
  labels: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  segment: {
    minWidth: MIN_SEGMENT_WIDTH,
    height: SEGMENT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
