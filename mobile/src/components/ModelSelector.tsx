import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { DEPTH_OPTIONS, type DepthPreference } from '../logic/depthPreference';

type ModelSelectorProps = {
  value: DepthPreference;
  onChange: (value: DepthPreference) => void;
};

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {DEPTH_OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            className={`px-3 py-2 rounded-full border ${
              active
                ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10'
                : 'border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                active ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
