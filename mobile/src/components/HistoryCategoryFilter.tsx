import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type HistoryCategoryFilterProps = {
  selectedCategory: string | null;
  categories: string[];
  onSelect: (category: string | null) => void;
};

function FilterItem({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="mr-5 pb-1 active:opacity-70"
    >
      <Text
        className={`text-sm ${
          selected
            ? 'font-semibold text-neutral-900 dark:text-neutral-100'
            : 'font-medium text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {label}
      </Text>
      {selected ? (
        <View className="mt-1.5 h-px bg-neutral-900 dark:bg-neutral-100" />
      ) : (
        <View className="mt-1.5 h-px bg-transparent" />
      )}
    </Pressable>
  );
}

export default function HistoryCategoryFilter({
  selectedCategory,
  categories,
  onSelect,
}: HistoryCategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <View className="px-1 pb-4">
      <Text className="pb-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        Categorías
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row pr-3">
          <FilterItem
            label="Todas"
            selected={selectedCategory === null}
            onPress={() => onSelect(null)}
          />
          {categories.map((category) => (
            <FilterItem
              key={category}
              label={category}
              selected={selectedCategory === category}
              onPress={() => onSelect(category)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
