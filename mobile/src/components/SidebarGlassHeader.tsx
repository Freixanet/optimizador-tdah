import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppIcon from './AppIcon';

/** Mirrors web CSS vars on .mobile-sidebar */
export const SIDEBAR_OCCLUSION = {
  headerBelowSafeArea: 52,
  bodyBelowSafeArea: 72,
  fade: 24,
  listTopExtra: 10,
  listBottomMin: 120,
} as const;

export const SIDEBAR_BRAND_ROW_HEIGHT = 56;

export function sidebarHeaderSolidHeight(insetTop: number) {
  return insetTop + SIDEBAR_OCCLUSION.headerBelowSafeArea;
}

export function sidebarTopOcclusion(insetTop: number) {
  return insetTop + SIDEBAR_OCCLUSION.bodyBelowSafeArea;
}

export function sidebarListPaddingTop(insetTop: number) {
  return sidebarTopOcclusion(insetTop) + SIDEBAR_OCCLUSION.listTopExtra;
}

/** @deprecated Use sidebarTopOcclusion */
export function sidebarGlassHeaderHeight(insetTop: number) {
  return sidebarTopOcclusion(insetTop);
}

type SidebarBrandHeaderProps = {
  height: number;
  insetTop: number;
  backgroundColor: string;
  isDark: boolean;
  onPress: () => void;
};

export function SidebarBrandHeader({
  height,
  insetTop,
  backgroundColor,
  isDark,
  onPress,
}: SidebarBrandHeaderProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.brandHeader, { height, backgroundColor }]}
      collapsable={false}
    >
      <View style={[styles.brandShell, { paddingTop: insetTop + 10 }]}>
        <Pressable
          onPress={onPress}
          style={styles.brandPressable}
          accessibilityRole="button"
          accessibilityLabel="Ir a inicio"
        >
          <AppIcon size={32} color={isDark ? '#EDEDED' : '#1A1A1A'} />
          <Text style={[styles.brandLabel, isDark ? styles.brandLabelDark : styles.brandLabelLight]}>
            Nucleo
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  brandShell: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    paddingBottom: 0,
  },
  brandPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLabel: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  brandLabelLight: {
    color: '#171717',
  },
  brandLabelDark: {
    color: '#f5f5f5',
  },
});
