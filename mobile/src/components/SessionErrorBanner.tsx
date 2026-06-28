import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useAppSession } from '../context/AppSessionContext';
import { useTheme } from '../context/ThemeContext';

const CLOSE_HIT_SLOP = { top: 14, right: 14, bottom: 14, left: 14 };

type SessionErrorBannerProps = {
  className?: string;
};

export default function SessionErrorBanner({ className = '' }: SessionErrorBannerProps) {
  const session = useAppSession();
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (!session.error || session.transformIncomplete) {
    return null;
  }

  const isLong = session.error.length > 120;

  return (
    <View
      className={`mb-2 ${className}`.trim()}
      accessibilityLiveRegion="polite"
    >
      <View
        className={`flex-row items-start gap-3 rounded-2xl border px-4 py-3 ${
          isDark
            ? 'border-red-500/25 bg-neutral-900/95'
            : 'border-red-200/80 bg-neutral-50/95'
        }`}
        style={styles.banner}
      >
        <Text
          className={`flex-1 text-sm leading-5 ${
            isDark ? 'text-red-100' : 'text-red-900'
          }`}
          numberOfLines={expanded ? undefined : 4}
        >
          {session.error}
        </Text>
        <Pressable
          onPress={() => session.setError(null)}
          hitSlop={CLOSE_HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full active:opacity-70"
        >
          <X size={16} color={isDark ? '#fca5a5' : '#991b1b'} />
        </Pressable>
      </View>
      {isLong && !expanded ? (
        <Pressable
          onPress={() => setExpanded(true)}
          className="mt-1 self-start px-1 py-1 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Ver error completo"
        >
          <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Ver más
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
