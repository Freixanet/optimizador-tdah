import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, X } from 'lucide-react-native';
import { formatRelativeDate, type HistoryEntry } from '../logic/history';

type HistorySheetProps = {
  visible: boolean;
  entries: HistoryEntry[];
  activeId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function HistorySheet({
  visible,
  entries,
  activeId,
  onClose,
  onSelect,
  onDelete,
}: HistorySheetProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-white/10">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Historial</Text>
          <Pressable
            onPress={onClose}
            className="w-9 h-9 rounded-full items-center justify-center bg-neutral-200/80 dark:bg-white/10"
            accessibilityLabel="Cerrar historial"
          >
            <X size={18} color="#737373" />
          </Pressable>
        </View>

        {entries.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-neutral-600 dark:text-neutral-300 leading-6">
              Aún no hay mapas guardados. Genera una lectura y aparecerá aquí.
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerClassName="px-4 py-4 pb-8">
            {entries.map((entry) => {
              const isActive = entry.id === activeId;
              const stepCount = (entry.session.data as { steps?: unknown[] })?.steps?.length ?? 0;
              const progress = entry.session.isComplete
                ? 'Completado'
                : entry.session.currentStep === 0
                  ? 'Introducción'
                  : `Paso ${entry.session.currentStep} de ${stepCount}`;

              return (
                <View
                  key={entry.id}
                  className={`mb-3 rounded-2xl border flex-row items-center ${
                    isActive
                      ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/60'
                  }`}
                >
                  <Pressable
                    onPress={() => onSelect(entry.id)}
                    className="flex-1 px-4 py-4"
                  >
                    <Text
                      className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
                      numberOfLines={2}
                    >
                      {entry.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-2">
                      <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatRelativeDate(entry.updatedAt)}
                      </Text>
                      <Text className="text-xs text-neutral-400">·</Text>
                      <Text className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {progress}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => onDelete(entry.id)}
                    className="w-11 h-11 mr-2 rounded-full items-center justify-center"
                    accessibilityLabel="Eliminar del historial"
                  >
                    <Trash2 size={16} color="#a3a3a3" />
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
