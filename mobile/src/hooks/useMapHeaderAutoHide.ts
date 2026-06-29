import { useCallback, useEffect, useRef } from 'react';
import { InteractionManager, type LayoutChangeEvent } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { READING_PROGRESS_BAR_HEIGHT } from '../components/ReadingProgressBar';

export const MAP_HEADER_CONTENT_TOP_PADDING = 76;
export const READING_PROGRESS_LINE_HEIGHT = 8;
const HEADER_HIDE_HYSTERESIS = 6;

type UseMapHeaderAutoHideOptions = {
  hideProgressLine: boolean;
  /** Map identity — clears anchor measurement when this changes. */
  mapKey: string;
  /** Step / view mode — scrolls to top and shows header when this changes. */
  resetKey: string;
  scrollProgress?: SharedValue<number>;
  onScrollReport?: (scrollY: number, contentHeight: number) => void;
};

function computeHideThreshold(metaAnchorHeight: number, headerBottom: number): number {
  if (metaAnchorHeight <= 0) return 0;
  return Math.max(0, MAP_HEADER_CONTENT_TOP_PADDING + metaAnchorHeight - headerBottom);
}

export function useMapHeaderAutoHide({
  hideProgressLine,
  mapKey,
  resetKey,
  scrollProgress,
  onScrollReport,
}: UseMapHeaderAutoHideOptions) {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const lastMapKeyRef = useRef(mapKey);
  const headerVisible = useSharedValue(true);
  const mapMetaAnchorHeight = useSharedValue(0);
  const headerBottomHeight = useSharedValue(
    READING_PROGRESS_BAR_HEIGHT + (hideProgressLine ? 0 : READING_PROGRESS_LINE_HEIGHT)
  );
  const hideScrollThreshold = useSharedValue(0);

  useEffect(() => {
    const bottom =
      READING_PROGRESS_BAR_HEIGHT + (hideProgressLine ? 0 : READING_PROGRESS_LINE_HEIGHT);
    headerBottomHeight.value = bottom;
    hideScrollThreshold.value = computeHideThreshold(mapMetaAnchorHeight.value, bottom);
  }, [hideProgressLine, headerBottomHeight, hideScrollThreshold, mapMetaAnchorHeight]);

  useEffect(() => {
    if (lastMapKeyRef.current !== mapKey) {
      lastMapKeyRef.current = mapKey;
      mapMetaAnchorHeight.value = 0;
      hideScrollThreshold.value = 0;
    }
    headerVisible.value = true;
    // Keep mapMetaAnchorHeight across step changes — title/metadata block is stable and
    // onLayout often does not re-fire after we zero the height, leaving hide broken.
    const task = InteractionManager.runAfterInteractions(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    return () => task.cancel();
  }, [mapKey, resetKey, headerVisible, hideScrollThreshold, mapMetaAnchorHeight]);

  const handleMapMetaAnchorLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      if (height <= 0) return;
      mapMetaAnchorHeight.value = height;
      hideScrollThreshold.value = computeHideThreshold(height, headerBottomHeight.value);
    },
    [headerBottomHeight, hideScrollThreshold, mapMetaAnchorHeight]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const maxScroll = event.contentSize.height - event.layoutMeasurement.height;
      const threshold = hideScrollThreshold.value;

      if (currentY <= 0 || mapMetaAnchorHeight.value <= 0) {
        headerVisible.value = true;
      } else if (currentY > threshold + HEADER_HIDE_HYSTERESIS) {
        headerVisible.value = false;
      } else if (currentY < threshold - HEADER_HIDE_HYSTERESIS) {
        headerVisible.value = true;
      }

      if (scrollProgress) {
        scrollProgress.value =
          maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, currentY / maxScroll));
      }

      if (onScrollReport) {
        runOnJS(onScrollReport)(currentY, event.contentSize.height);
      }
    },
  });

  return {
    scrollRef,
    headerVisible,
    handleMapMetaAnchorLayout,
    scrollHandler,
  };
}
