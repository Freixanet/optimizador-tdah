import React, { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { formatRelativeDate, type HistoryEntry } from '../logic/history';

export const HISTORY_ENTRY_CARD_HEIGHT = 84;

type HistoryEntryCardProps = {
  entry: HistoryEntry;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onCommitRename: () => void;
  onSelect: (id: string) => void;
  onLongPress: (
    entry: HistoryEntry,
    anchor: { x: number; y: number; width: number; height: number }
  ) => void;
};

export default function HistoryEntryCard({
  entry,
  isActive,
  isRenaming,
  renameValue,
  onRenameValueChange,
  onCommitRename,
  onSelect,
  onLongPress,
}: HistoryEntryCardProps) {
  const cardRef = useRef<View>(null);
  const suppressPressRef = useRef(false);

  const handleLongPress = () => {
    suppressPressRef.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    cardRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress(entry, { x, y, width, height });
    });
  };

  return (
    <View
      ref={cardRef}
      collapsable={false}
      className={`mb-2 rounded-2xl px-3 py-3 justify-center ${
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-500/10'
          : 'bg-white dark:bg-white/[0.03]'
      }`}
      style={{ height: HISTORY_ENTRY_CARD_HEIGHT }}
    >
      {isRenaming ? (
        <View className="flex-row items-center gap-2">
          <TextInput
            value={renameValue}
            onChangeText={onRenameValueChange}
            autoFocus
            className="flex-1 text-base text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2"
            onSubmitEditing={onCommitRename}
          />
          <Pressable onPress={onCommitRename} className="px-3 py-2">
            <Text className="font-semibold text-indigo-600">OK</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => {
            if (suppressPressRef.current) {
              suppressPressRef.current = false;
              return;
            }
            onSelect(entry.id);
          }}
          onLongPress={handleLongPress}
          delayLongPress={420}
          className="flex-1 justify-center"
          accessibilityRole="button"
          accessibilityLabel={entry.title}
        >
          <Text
            className="text-base font-semibold leading-5 text-neutral-900 dark:text-neutral-100"
            numberOfLines={2}
            style={{ height: 40 }}
          >
            {entry.title}
          </Text>
          <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
            {formatRelativeDate(entry.updatedAt)}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
