import React from 'react';
import { Pressable, Text } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      className="w-10 h-10 rounded-full items-center justify-center border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80"
      accessibilityLabel={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? <Moon size={18} color="#525252" /> : <Sun size={18} color="#525252" />}
    </Pressable>
  );
}
