import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AttachAnchorRect } from '../hooks/useAttachMenuAnchor';
import AttachMenuPopover, { ATTACH_MENU_WIDTH } from './AttachMenuPopover';

const MENU_GAP = 10;

type AttachMenuOverlayProps = {
  open: boolean;
  anchorRect: AttachAnchorRect | null;
  /** Distance from the screen bottom reserved for the composer (scrim stops above it). */
  scrimBottomInset: number;
  onClose: () => void;
  onPickImage: () => void;
  onPickCamera: () => void;
  onPickFile: () => void;
  darkSurface?: boolean;
};

export default function AttachMenuOverlay({
  open,
  anchorRect,
  scrimBottomInset,
  onClose,
  onPickImage,
  onPickCamera,
  onPickFile,
  darkSurface = false,
}: AttachMenuOverlayProps) {
  const insets = useSafeAreaInsets();

  if (!open || !anchorRect) {
    return null;
  }

  const screenHeight = Dimensions.get('window').height;
  const menuBottom = screenHeight - anchorRect.y + MENU_GAP;

  const runPick = (pick: () => void) => {
    onClose();
    pick();
  };

  return (
    <View style={styles.host} pointerEvents="box-none">
      <Animated.View
        entering={FadeIn.duration(160)}
        exiting={FadeOut.duration(120)}
        style={[
          StyleSheet.absoluteFill,
          {
            top: -insets.top,
            left: -12,
            right: -12,
            bottom: -insets.bottom - 100,
          },
        ]}
      >
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityLabel="Cerrar menú de adjuntos"
        />
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        style={[
          styles.menu,
          {
            left: anchorRect.x,
            bottom: menuBottom,
            width: ATTACH_MENU_WIDTH,
          },
        ]}
        accessibilityRole="menu"
      >
        <AttachMenuPopover
          darkSurface={darkSurface}
          onPickImage={() => runPick(onPickImage)}
          onPickCamera={() => runPick(onPickCamera)}
          onPickFile={() => runPick(onPickFile)}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.11)',
    zIndex: 100,
  },
  menu: {
    position: 'absolute',
    zIndex: 110,
  },
});
