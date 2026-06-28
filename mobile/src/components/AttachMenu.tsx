import React from 'react';
import { Pressable, View, type View as ViewType } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

type AttachMenuProps = {
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  darkSurface?: boolean;
  anchorRef: React.RefObject<ViewType | null>;
};

export default function AttachMenu({
  open,
  onToggle,
  disabled = false,
  darkSurface = false,
  anchorRef,
}: AttachMenuProps) {
  const { isDark } = useTheme();
  const onComposer = darkSurface || isDark;
  const iconMuted = onComposer ? '#d4d4d4' : isDark ? '#a3a3a3' : '#737373';
  const iconActive = onComposer ? '#fafafa' : isDark ? '#e5e5e5' : '#404040';

  return (
    <View ref={anchorRef} collapsable={false} className="h-10 w-10">
      <Pressable
        onPress={onToggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Cerrar adjuntos' : 'Adjuntar'}
        accessibilityState={{ expanded: open, disabled }}
        className={`absolute inset-0 items-center justify-center rounded-full ${
          open
            ? onComposer
              ? 'bg-white/12'
              : 'bg-neutral-100 dark:bg-white/10'
            : 'bg-transparent active:bg-neutral-100/80 dark:active:bg-white/5'
        } ${disabled ? 'opacity-40' : ''}`}
      >
        {open ? <X size={20} color={iconActive} /> : <Plus size={20} color={iconMuted} />}
      </Pressable>
    </View>
  );
}
