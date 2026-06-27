import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import HistorySheet from './HistorySheet';
import { useTheme } from '../context/ThemeContext';
import type { ActionMapData } from '../logic/contracts';
import type { HistoryEntry } from '../logic/history';
import type { AppPhase } from '../context/AppSessionContext';

export const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.76, 340);

const SCREEN = Dimensions.get('window');
/** Radio de esquina izquierda ~ proporción del display en iPhone moderno. */
export const MAIN_SHEET_CORNER_RADIUS = Math.round(
  Math.min(Math.max(Math.min(SCREEN.width, SCREEN.height) * 0.138, 52), 62)
);

type HistoryDrawerProps = {
  open: boolean;
  entries: HistoryEntry[];
  activeId: string | null;
  phase: AppPhase;
  data: ActionMapData | null;
  currentStep: number;
  isComplete: boolean;
  viewAll: boolean;
  totalSteps: number;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  onOpen: () => void;
  onGoToStep: (idx: number) => void;
  onToggleViewMode: () => void;
  onNewMap: () => void;
  enableEdgeSwipe?: boolean;
  children: React.ReactNode;
};

function triggerOpenHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function HistoryDrawer({
  open,
  entries,
  activeId,
  phase,
  data,
  currentStep,
  isComplete,
  viewAll,
  totalSteps,
  onClose,
  onSelect,
  onDelete,
  onRename,
  onTogglePin,
  onOpen,
  onGoToStep,
  onToggleViewMode,
  onNewMap,
  enableEdgeSwipe = true,
  children,
}: HistoryDrawerProps) {
  const { isDark } = useTheme();
  const offsetX = useSharedValue(open ? DRAWER_WIDTH : 0);
  const openShared = useSharedValue(open);
  const dragStartX = useSharedValue(0);

  useEffect(() => {
    openShared.value = open;
    offsetX.value = withSpring(open ? DRAWER_WIDTH : 0, { damping: 26, stiffness: 280 });
    if (open) triggerOpenHaptic();
  }, [open, offsetX, openShared]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-16, 16])
    .onBegin(() => {
      dragStartX.value = offsetX.value;
    })
    .onUpdate((event) => {
      const next = dragStartX.value + event.translationX;
      offsetX.value = Math.max(0, Math.min(DRAWER_WIDTH, next));
    })
    .onEnd((event) => {
      const current = offsetX.value;
      const opening = dragStartX.value < DRAWER_WIDTH * 0.5;
      const velocity = event.velocityX;

      if (opening) {
        const shouldOpen = current > DRAWER_WIDTH * 0.35 || velocity > 650;
        offsetX.value = withSpring(shouldOpen ? DRAWER_WIDTH : 0, { damping: 26, stiffness: 280 });
        if (shouldOpen && !openShared.value) runOnJS(onOpen)();
        if (!shouldOpen && openShared.value) runOnJS(onClose)();
        return;
      }

      const shouldClose = current < DRAWER_WIDTH * 0.65 || velocity < -650;
      offsetX.value = withSpring(shouldClose ? 0 : DRAWER_WIDTH, { damping: 26, stiffness: 280 });
      if (shouldClose && openShared.value) runOnJS(onClose)();
      if (!shouldClose && !openShared.value) runOnJS(onOpen)();
    });

  const tapGesture = Gesture.Tap()
    .maxDistance(12)
    .onEnd(() => {
      if (!openShared.value) return;
      offsetX.value = withSpring(0, { damping: 26, stiffness: 280 });
      runOnJS(onClose)();
    });

  const mainGesture = Gesture.Exclusive(panGesture, tapGesture);

  const edgeOpenGesture = Gesture.Pan()
    .activeOffsetX(12)
    .onUpdate((event) => {
      offsetX.value = Math.max(0, Math.min(DRAWER_WIDTH, event.translationX));
    })
    .onEnd((event) => {
      const shouldOpen = offsetX.value > DRAWER_WIDTH * 0.35 || event.velocityX > 650;
      offsetX.value = withSpring(shouldOpen ? DRAWER_WIDTH : 0, { damping: 26, stiffness: 280 });
      if (shouldOpen) {
        runOnJS(onOpen)();
      }
    });

  const mainSheetStyle = useAnimatedStyle(() => {
    const progress = offsetX.value / DRAWER_WIDTH;
    const radius = offsetX.value > 0 ? MAIN_SHEET_CORNER_RADIUS : 0;
    const shadowOpacity = interpolate(progress, [0, 1], [0, isDark ? 0.55 : 0.22], Extrapolation.CLAMP);

    return {
      transform: [{ translateX: offsetX.value }],
      borderTopLeftRadius: radius,
      borderBottomLeftRadius: radius,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      shadowColor: '#000000',
      shadowOffset: { width: -10, height: 0 },
      shadowOpacity,
      shadowRadius: 24,
      elevation: progress > 0.01 ? 16 : 0,
    };
  });

  const mainLightenOverlayStyle = useAnimatedStyle(() => {
    const progress = offsetX.value / DRAWER_WIDTH;
    const opacity = interpolate(
      progress,
      [0, 1],
      [0, isDark ? 0.1 : 0.22],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  const underlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offsetX.value, [0, DRAWER_WIDTH], [0, 1], Extrapolation.CLAMP),
  }));

  const canvasColor = isDark ? '#171717' : '#fafafa';
  /** Sidebar stays on base canvas; root uses a slightly deeper gray when drawer is active. */
  const sidebarCanvasColor = isDark ? '#171717' : '#f0f0f0';

  return (
    <View
      className={isDark ? 'dark' : undefined}
      style={[styles.root, { backgroundColor: sidebarCanvasColor }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.underlay,
          underlayStyle,
          { backgroundColor: sidebarCanvasColor },
        ]}
      />

      <View style={[styles.sidebar, { width: DRAWER_WIDTH, backgroundColor: sidebarCanvasColor }]}>
        <HistorySheet
          visible
          embedded
          canvasColor={sidebarCanvasColor}
          entries={entries}
          activeId={activeId}
          onClose={onClose}
          onSelect={onSelect}
          onDelete={onDelete}
          onRename={onRename}
          onTogglePin={onTogglePin}
          showIndex={phase === 'result' && Boolean(data)}
          data={data}
          currentStep={currentStep}
          isComplete={isComplete}
          viewAll={viewAll}
          totalSteps={totalSteps}
          onGoToStep={onGoToStep}
          onToggleViewMode={onToggleViewMode}
          onNewMap={onNewMap}
        />
      </View>

      <GestureDetector gesture={mainGesture}>
        <Animated.View
          style={[styles.mainSheet, mainSheetStyle, { backgroundColor: canvasColor }]}
        >
          {children}
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.mainLightenOverlay, mainLightenOverlayStyle]}
          />
        </Animated.View>
      </GestureDetector>

      {enableEdgeSwipe && !open ? (
        <GestureDetector gesture={edgeOpenGesture}>
          <View style={styles.edgeHitSlop} />
        </GestureDetector>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  underlay: {
    zIndex: 0,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  mainSheet: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    overflow: 'hidden',
  },
  mainLightenOverlay: {
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  edgeHitSlop: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    zIndex: 20,
  },
});
