import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Camera, FileText, Image as ImageIcon, Plus } from 'lucide-react-native';

type AttachMenuProps = {
  open: boolean;
  onToggle: () => void;
  onPickImage: () => void;
  onPickCamera: () => void;
  onPickPdf: () => void;
  disabled?: boolean;
};

export default function AttachMenu({
  open,
  onToggle,
  onPickImage,
  onPickCamera,
  onPickPdf,
  disabled = false,
}: AttachMenuProps) {
  return (
    <View className="relative">
      <Pressable
        onPress={onToggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Adjuntar"
        accessibilityState={{ expanded: open, disabled }}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          open
            ? 'bg-neutral-100 dark:bg-white/10'
            : 'bg-transparent active:bg-neutral-100 dark:active:bg-white/5'
        } ${disabled ? 'opacity-40' : ''}`}
      >
        <Plus
          size={20}
          color={open ? '#404040' : '#737373'}
          style={{ transform: [{ rotate: open ? '45deg' : '0deg' }] }}
        />
      </Pressable>

      {open ? (
        <View
          className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-xl p-2 z-50"
          accessibilityRole="menu"
        >
          <Pressable
            onPress={onPickImage}
            accessibilityRole="menuitem"
            className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-neutral-100 dark:active:bg-white/5"
          >
            <ImageIcon size={16} color="#737373" />
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Galería
            </Text>
          </Pressable>

          <Pressable
            onPress={onPickCamera}
            accessibilityRole="menuitem"
            className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-neutral-100 dark:active:bg-white/5"
          >
            <Camera size={16} color="#737373" />
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Cámara
            </Text>
          </Pressable>

          <Pressable
            onPress={onPickPdf}
            accessibilityRole="menuitem"
            className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-neutral-100 dark:active:bg-white/5"
          >
            <FileText size={16} color="#737373" />
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              PDF
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
