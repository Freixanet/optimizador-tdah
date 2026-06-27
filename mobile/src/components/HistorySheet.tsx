import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingGlassButton, { FLOATING_PILL_MIN_HEIGHT } from './FloatingGlassButton';
import HistoryEntryCard from './HistoryEntryCard';
import HistoryEntryGlassMenu, { type HistoryEntryActionAnchor } from './HistoryEntryGlassMenu';
import {
  CheckCircle2,
  ChevronDown,
  Layers,
  List,
  SquarePen,
} from 'lucide-react-native';
import ProfileMenu from './ProfileMenu';
import {
  SidebarBrandHeader,
  SIDEBAR_OCCLUSION,
  sidebarHeaderSolidHeight,
  sidebarListPaddingTop,
} from './SidebarGlassHeader';
import { useTheme } from '../context/ThemeContext';
import {
  sortPinnedEntries,
  type HistoryEntry,
} from '../logic/history';
import type { ActionMapData } from '../logic/contracts';

type HistorySheetProps = {
  visible: boolean;
  entries: HistoryEntry[];
  activeId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  embedded?: boolean;
  canvasColor?: string;
  glassHeaderHeight?: number;
  showIndex?: boolean;
  data?: ActionMapData | null;
  currentStep?: number;
  isComplete?: boolean;
  viewAll?: boolean;
  totalSteps?: number;
  onGoToStep?: (idx: number) => void;
  onToggleViewMode?: () => void;
  onNewMap?: () => void;
};

type ActionMenuState = HistoryEntryActionAnchor | null;

export default function HistorySheet({
  visible,
  entries,
  activeId,
  onClose,
  onSelect,
  onDelete,
  onRename,
  onTogglePin,
  embedded = false,
  canvasColor,
  showIndex = false,
  data,
  currentStep = 0,
  isComplete = false,
  viewAll = false,
  totalSteps = 0,
  onGoToStep,
  onToggleViewMode,
  onNewMap,
}: HistorySheetProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [actionMenu, setActionMenu] = useState<ActionMenuState>(null);
  const [indexExpanded, setIndexExpanded] = useState(true);
  const insets = useSafeAreaInsets();
  const floatingActionsBottom = Math.max(insets.bottom, 12);
  const listBottomInset = floatingActionsBottom + FLOATING_PILL_MIN_HEIGHT + 20;
  const { isDark } = useTheme();

  const pinnedEntries = useMemo(
    () => sortPinnedEntries(entries.filter((entry) => entry.pinned)),
    [entries]
  );
  const regularEntries = useMemo(
    () => entries.filter((entry) => !entry.pinned),
    [entries]
  );
  const listData = useMemo(
    () => [
      ...(pinnedEntries.length ? [{ type: 'header' as const, id: 'pinned-header', title: 'Fijados' }] : []),
      ...pinnedEntries.map((entry) => ({ type: 'entry' as const, entry })),
      ...(regularEntries.length ? [{ type: 'header' as const, id: 'recent-header', title: 'Recientes' }] : []),
      ...regularEntries.map((entry) => ({ type: 'entry' as const, entry })),
    ],
    [pinnedEntries, regularEntries]
  );

  const startRename = useCallback((entry: HistoryEntry) => {
    setRenamingId(entry.id);
    setRenameValue(entry.title);
    setActionMenu(null);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    onRename(renamingId, renameValue);
    setRenamingId(null);
    setRenameValue('');
  }, [onRename, renameValue, renamingId]);

  const openEntryMenu = useCallback(
    (entry: HistoryEntry, anchor: { x: number; y: number; width: number; height: number }) => {
      setActionMenu({
        entry,
        top: anchor.y + anchor.height + 8,
        left: anchor.x,
        width: anchor.width,
      });
    },
    []
  );

  const handleDeleteEntry = useCallback(
    (entry: HistoryEntry) => {
      Alert.alert('Eliminar mapa', '¿Seguro que quieres eliminar este mapa?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(entry.id),
        },
      ]);
    },
    [onDelete]
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => {
      if (item.type === 'header') {
        const isRecentHeader = item.id === 'recent-header';
        return (
          <Text
            className={`px-1 pb-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 ${
              isRecentHeader ? 'pt-8' : 'pt-1'
            }`}
          >
            {item.title}
          </Text>
        );
      }

      const entry = item.entry;
      const isActive = entry.id === activeId;

      return (
        <HistoryEntryCard
          entry={entry}
          isActive={isActive}
          isRenaming={renamingId === entry.id}
          renameValue={renameValue}
          onRenameValueChange={setRenameValue}
          onCommitRename={commitRename}
          onSelect={onSelect}
          onLongPress={openEntryMenu}
        />
      );
    },
    [activeId, commitRename, onSelect, openEntryMenu, renameValue, renamingId]
  );

  const listHeaderComponent = useMemo(() => {
    if (!showIndex || !data) return null;

    return (
      <View className="mb-2">
        <Pressable
          onPress={() => setIndexExpanded((value) => !value)}
          className="flex-row items-center gap-2 mb-3 px-1 py-1"
          accessibilityState={{ expanded: indexExpanded }}
        >
          <ChevronDown
            size={16}
            color="#a3a3a3"
            style={{ transform: [{ rotate: indexExpanded ? '0deg' : '-90deg' }] }}
          />
          <Text className="text-xs font-bold tracking-widest uppercase text-neutral-400">Índice</Text>
        </Pressable>

        {indexExpanded ? (
          <View className="mb-4">
            <Pressable
              onPress={() => {
                onGoToStep?.(0);
                onClose();
              }}
              className={`px-4 py-3 rounded-lg mb-1 ${
                currentStep === 0 && !isComplete ? 'bg-indigo-100/50 dark:bg-indigo-500/10' : ''
              }`}
            >
              <Text
                className={`font-semibold ${
                  currentStep === 0 && !isComplete
                    ? 'text-indigo-700 dark:text-indigo-400'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Idea central
              </Text>
            </Pressable>

            {data.steps?.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum && !isComplete;
              const isPast = currentStep > stepNum || isComplete;
              return (
                <Pressable
                  key={step.id || stepNum}
                  onPress={() => {
                    onGoToStep?.(stepNum);
                    onClose();
                  }}
                  className={`px-4 py-3 rounded-lg mb-1 flex-row items-center justify-between ${
                    isActive ? 'bg-indigo-100/50 dark:bg-indigo-500/10' : ''
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-white/10 items-center justify-center">
                      <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                        {stepNum}
                      </Text>
                    </View>
                    <Text
                      className={`flex-1 font-semibold ${
                        isActive
                          ? 'text-indigo-700 dark:text-indigo-400'
                          : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                      numberOfLines={1}
                    >
                      {step.shortNav || step.title}
                    </Text>
                  </View>
                  <CheckCircle2 size={16} color={isPast ? '#4f46e5' : '#a3a3a3'} />
                </Pressable>
              );
            })}

            {!isComplete && onToggleViewMode ? (
              <Pressable
                onPress={onToggleViewMode}
                className={`mt-3 flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-xl ${
                  viewAll ? 'bg-indigo-100 dark:bg-indigo-500/10' : 'bg-white/60 dark:bg-neutral-800/60'
                }`}
              >
                {viewAll ? <List size={16} color="#4f46e5" /> : <Layers size={16} color="#737373" />}
                <Text
                  className={`text-sm font-semibold ${
                    viewAll ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {viewAll ? 'Paso a paso' : 'Vista completa'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }, [
    currentStep,
    data,
    indexExpanded,
    isComplete,
    onClose,
    onGoToStep,
    onToggleViewMode,
    showIndex,
    viewAll,
  ]);

  const listEmptyComponent = useMemo(
    () => (
      <View className="py-8 px-2">
        <Text className="text-center text-neutral-600 dark:text-neutral-300 leading-6">
          Aún no hay mapas guardados. Genera una lectura y aparecerá aquí.
        </Text>
      </View>
    ),
    []
  );

  const headerSolidHeight = sidebarHeaderSolidHeight(insets.top);
  const listTopInset = sidebarListPaddingTop(insets.top);
  const listBottomPadding = Math.max(SIDEBAR_OCCLUSION.listBottomMin, listBottomInset);
  const sheetBackground = canvasColor ?? (isDark ? '#171717' : '#f0f0f0');

  const content = (
    <View
      className={isDark ? 'dark flex-1' : 'flex-1'}
      style={[styles.sheetRoot, { backgroundColor: sheetBackground }]}
    >
      <View style={styles.sheetBody}>
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => ('entry' in item ? item.entry.id : item.id)}
          ListHeaderComponent={listHeaderComponent}
          ListEmptyComponent={listEmptyComponent}
          contentContainerStyle={{
            paddingTop: listTopInset,
            paddingBottom: listBottomPadding,
            paddingHorizontal: 16,
          }}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
        <SidebarBrandHeader
          height={headerSolidHeight}
          insetTop={insets.top}
          backgroundColor={sheetBackground}
          isDark={isDark}
          onPress={() => {
            onNewMap?.();
            onClose();
          }}
        />
      </View>

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 flex-row items-center justify-between px-5"
        style={{ bottom: floatingActionsBottom }}
      >
        <ProfileMenu placement="bottomLeft" floating />
        <FloatingGlassButton
          onPress={() => {
            onNewMap?.();
            onClose();
          }}
          accessibilityLabel="Nuevo mapa"
          shape="pill"
          tone="accent"
        >
          <SquarePen size={18} color="#ffffff" />
          <Text className="text-[15px] font-bold text-white">Nuevo mapa</Text>
        </FloatingGlassButton>
      </View>

      <HistoryEntryGlassMenu
        menu={actionMenu}
        onClose={() => setActionMenu(null)}
        onRename={startRename}
        onTogglePin={(entry) => onTogglePin(entry.id)}
        onDelete={handleDeleteEntry}
      />
    </View>
  );

  if (embedded) {
    return visible ? content : null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetRoot: {
    flex: 1,
    overflow: 'hidden',
  },
  sheetBody: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  list: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});
