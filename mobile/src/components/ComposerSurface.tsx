import React from 'react';
import { View } from 'react-native';
import GlassSurface from './GlassSurface';
import { useTheme } from '../context/ThemeContext';

type ComposerSurfaceProps = {
  children: React.ReactNode;
};

export default function ComposerSurface({ children }: ComposerSurfaceProps) {
  const { isDark } = useTheme();

  return (
    <View className="relative rounded-[26px]">
      <View
        pointerEvents="none"
        className="absolute inset-0 overflow-hidden rounded-[26px] border border-neutral-200/70 dark:border-white/[0.08]"
      >
        <GlassSurface
          variant="composer"
          solid
          className="h-full rounded-[26px]"
          overlayClassName={isDark ? 'bg-neutral-800/95' : 'bg-white'}
        >
          {null}
        </GlassSurface>
      </View>
      <View className="relative">{children}</View>
    </View>
  );
}
