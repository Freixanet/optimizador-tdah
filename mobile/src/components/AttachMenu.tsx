import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, File, Image as ImageIcon, Plus, X } from 'lucide-react-native';
import GlassSurface from './GlassSurface';
import { useTheme } from '../context/ThemeContext';

type AttachMenuProps = {
  open: boolean;
  onToggle: () => void;
  onPickImage: () => void;
  onPickCamera: () => void;
  onPickFile: () => void;
  disabled?: boolean;
  darkSurface?: boolean;
};

type MenuAnchor = {
  left: number;
  bottom: number;
};

const MENU_WIDTH = 256;
const MENU_GAP = 10;
const SCREEN = Dimensions.get('window');

export default function AttachMenu({
  open,
  onToggle,
  onPickImage,
  onPickCamera,
  onPickFile,
  disabled = false,
  darkSurface = false,
}: AttachMenuProps) {
  const { isDark } = useTheme();
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const onComposer = darkSurface || isDark;
  const iconMuted = onComposer ? '#d4d4d4' : isDark ? '#a3a3a3' : '#737373';
  const iconActive = onComposer ? '#fafafa' : isDark ? '#e5e5e5' : '#404040';
  const textClass = onComposer
    ? 'text-sm font-medium text-neutral-200'
    : 'text-sm font-medium text-neutral-700 dark:text-neutral-200';

  const dismiss = useCallback(() => {
    if (open) onToggle();
  }, [open, onToggle]);

  const updateAnchor = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y) => {
      const left = Math.max(12, Math.min(x, SCREEN.width - MENU_WIDTH - 12));
      setAnchor({ left, bottom: SCREEN.height - y + MENU_GAP });
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setAnchor(null);
      return;
    }
    updateAnchor();
  }, [open, updateAnchor]);

  return (
    <>
      <View ref={anchorRef} collapsable={false} className="relative h-10 w-10">
        <Pressable
          onPress={onToggle}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Adjuntar"
          accessibilityState={{ expanded: open, disabled }}
          className={`absolute inset-0 items-center justify-center rounded-full ${
            open
              ? onComposer
                ? 'bg-white/12'
                : 'bg-neutral-100 dark:bg-white/10'
              : 'bg-transparent active:bg-neutral-100/80 dark:active:bg-white/5'
          } ${disabled ? 'opacity-40' : ''}`}
        >
          {open ? (
            <X size={20} color={iconActive} />
          ) : (
            <Plus size={20} color={iconMuted} />
          )}
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={dismiss}>
        <View style={styles.root}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismiss}
            accessibilityLabel="Cerrar menú de adjuntos"
          />
          {anchor ? (
            <View
              pointerEvents="box-none"
              style={[styles.menuHost, { left: anchor.left, bottom: anchor.bottom, width: MENU_WIDTH }]}
              accessibilityRole="menu"
            >
              <View className="rounded-[20px] overflow-hidden border border-neutral-200/70 dark:border-white/[0.08]">
                <GlassSurface liquid borderRadius={20} className="rounded-[20px]">
                  <View className="p-1.5">
                    <Pressable
                      onPress={onPickImage}
                      accessibilityRole="menuitem"
                      className="flex-row items-center gap-3 px-3 py-3 rounded-[14px] active:bg-neutral-100/70 dark:active:bg-white/[0.06]"
                    >
                      <ImageIcon size={16} color={iconMuted} />
                      <Text className={textClass}>Galería</Text>
                    </Pressable>

                    <Pressable
                      onPress={onPickCamera}
                      accessibilityRole="menuitem"
                      className="flex-row items-center gap-3 px-3 py-3 rounded-[14px] active:bg-neutral-100/70 dark:active:bg-white/[0.06]"
                    >
                      <Camera size={16} color={iconMuted} />
                      <Text className={textClass}>Cámara</Text>
                    </Pressable>

                    <Pressable
                      onPress={onPickFile}
                      accessibilityRole="menuitem"
                      className="flex-row items-center gap-3 px-3 py-3 rounded-[14px] active:bg-neutral-100/70 dark:active:bg-white/[0.06]"
                    >
                      <File size={16} color={iconMuted} />
                      <Text className={textClass}>Archivo</Text>
                    </Pressable>
                  </View>
                </GlassSurface>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  menuHost: {
    position: 'absolute',
  },
});
