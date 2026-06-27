import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Check, Sparkles, X } from 'lucide-react-native';
import GlassSurface from './GlassSurface';
import { DEPTH_OPTIONS, type DepthPreference } from '../logic/depthPreference';
import { stepHaptic } from '../context/AppSessionContext';
import { useTheme } from '../context/ThemeContext';

type ModelChipProps = {
  value: DepthPreference;
  onChange: (value: DepthPreference) => void;
  disabled?: boolean;
};

export default function ModelChip({ value, onChange, disabled = false }: ModelChipProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const activeOption = DEPTH_OPTIONS.find((option) => option.id === value) ?? DEPTH_OPTIONS[1];
  const iconMuted = isDark ? '#a3a3a3' : '#737373';

  return (
    <>
      <Pressable
        onPress={() => {
          if (disabled) return;
          setOpen(true);
          stepHaptic();
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Modo: ${activeOption.label}`}
        className={`flex-row items-center gap-1.5 rounded-full px-3 h-9 ${
          disabled ? 'opacity-40' : 'active:opacity-80'
        } bg-neutral-500/[0.08] dark:bg-white/[0.08]`}
      >
        <Sparkles size={13} color={iconMuted} />
        <Text className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300">
          {activeOption.label}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <GlassSurface
              liquid
              borderRadius={22}
              className="rounded-t-[22px] mx-0"
            >
              <View className="px-4 pt-4 pb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Modo
                  </Text>
                  <Pressable
                    onPress={() => setOpen(false)}
                    className="w-9 h-9 rounded-full items-center justify-center bg-neutral-500/10 dark:bg-white/10"
                    accessibilityLabel="Cerrar selector de modo"
                  >
                    <X size={16} color={iconMuted} />
                  </Pressable>
                </View>
                <ScrollView className="max-h-72">
                  {DEPTH_OPTIONS.map((option) => {
                    const isActive = option.id === value;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          onChange(option.id);
                          setOpen(false);
                        }}
                        className={`px-3 py-3 rounded-xl mb-1 flex-row items-start gap-2 ${
                          isActive ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                        }`}
                      >
                        <View className="flex-1">
                          <Text
                            className={`text-sm font-semibold ${
                              isActive
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-neutral-800 dark:text-neutral-200'
                            }`}
                          >
                            {option.label}
                          </Text>
                          <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {option.hint}
                          </Text>
                        </View>
                        {isActive ? <Check size={16} color="#4f46e5" /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </GlassSurface>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
