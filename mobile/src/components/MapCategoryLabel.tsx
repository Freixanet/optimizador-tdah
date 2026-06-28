import React from 'react';
import { Text } from 'react-native';

type MapCategoryLabelProps = {
  category: string;
  size?: 'sm' | 'md';
};

export default function MapCategoryLabel({ category, size = 'sm' }: MapCategoryLabelProps) {
  const textClass =
    size === 'md'
      ? 'text-[13px] font-medium tracking-wide text-neutral-600 dark:text-neutral-300'
      : 'text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400';

  return (
    <Text className={textClass} numberOfLines={1}>
      {category}
    </Text>
  );
}
