import React, { useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { File, X } from 'lucide-react-native';
import AttachMenu from '../../components/AttachMenu';
import AttachMenuOverlay from '../../components/AttachMenuOverlay';
import ComposerSendButton from '../../components/ComposerSendButton';
import ComposerSurface from '../../components/ComposerSurface';
import ComposerDock, { COMPOSER_DOCK_GAP, useComposerKeyboardLift } from '../../components/ComposerDock';
import FloatingGlassButton from '../../components/FloatingGlassButton';
import LoadingPreviewButton from '../../components/LoadingPreviewButton';
import MenuTwoLines from '../../components/MenuTwoLines';
import ModelChip from '../../components/ModelChip';
import SessionErrorBanner from '../../components/SessionErrorBanner';
import { SIDEBAR_HEADER_BUTTON_SIZE } from '../../components/sidebarLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAppSession } from '../../context/AppSessionContext';
import { useAttachMenuControl } from '../../hooks/useAttachMenuControl';
import { useDismissKeyboardOnScroll, KeyboardDismissBackdrop } from '../../logic/keyboardDismiss';

export default function ClassicInputScreen() {
  const session = useAppSession();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const canSend = session.canSubmit && session.phase !== 'loading';
  const navIconColor = isDark ? '#d4d4d4' : '#525252';
  const mutedIcon = isDark ? '#a3a3a3' : '#737373';
  const handleScrollBeginDrag = useDismissKeyboardOnScroll();
  const [composerHeight, setComposerHeight] = useState(176);
  const [composerFocused, setComposerFocused] = useState(false);
  const composerInputRef = useRef<TextInput>(null);
  const keyboardLiftStyle = useComposerKeyboardLift();
  const { anchorRef, anchorRect, handleAttachToggle, dismissAttachMenu, clearPendingOpen } =
    useAttachMenuControl({
      attachMenuOpen: session.attachMenuOpen,
      setAttachMenuOpen: session.setAttachMenuOpen,
      composerHeight,
      composerInputRef,
      composerFocused,
      phase: session.phase,
    });
  const onScrollBeginDrag = () => {
    clearPendingOpen();
    handleScrollBeginDrag();
  };
  const scrimBottomInset = composerHeight + Math.max(insets.bottom, COMPOSER_DOCK_GAP);
  const composerPlaceholder = session.uploadedFile?.isImage
    ? 'Añade una indicación (opcional)…'
    : session.uploadedFile
      ? 'Archivo adjunto listo para transformar'
      : 'Pega texto, un enlace de YouTube o una transcripción…';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="flex-1 px-3" style={{ position: 'relative' }}>
          <View className="flex-row items-center gap-2 pt-1 pb-2">
            <FloatingGlassButton
              onPress={() => session.toggleHistoryDrawer()}
              accessibilityLabel={session.historyOpen ? 'Cerrar navegacion' : 'Abrir navegacion'}
              shape="circle"
              size={SIDEBAR_HEADER_BUTTON_SIZE}
            >
              <MenuTwoLines size={17} color={navIconColor} />
            </FloatingGlassButton>
          </View>

          <SessionErrorBanner />

          <Animated.View style={[{ flex: 1 }, keyboardLiftStyle]}>
            <ScrollView
              className="flex-1 bg-transparent"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              alwaysBounceVertical={Platform.OS === 'ios'}
              onScrollBeginDrag={onScrollBeginDrag}
              scrollEnabled={!session.attachMenuOpen && !session.historyOpen}
              contentContainerClassName="items-center px-1 pt-7"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: composerHeight + 16 }}
            >
              <KeyboardDismissBackdrop className="w-full flex-1 items-center">
              <Text
                className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 text-center px-2"
                numberOfLines={2}
              >
                ¿Qué me cuentas?
              </Text>
              <Text className="mt-2.5 text-[15px] text-neutral-500 dark:text-neutral-400 text-center leading-6 max-w-sm px-1">
                Convierte{' '}
                <Text className="font-semibold text-neutral-800 dark:text-neutral-200">caos en mapas de acción</Text>
                . Directo al punto.
              </Text>
              <LoadingPreviewButton onPress={session.previewLoadingScreen} />

              </KeyboardDismissBackdrop>
            </ScrollView>
          </Animated.View>

          <ComposerDock onHeightChange={setComposerHeight}>
            <ComposerSurface focused={composerFocused} inputRef={composerInputRef}>
            <View pointerEvents={session.attachMenuOpen ? 'none' : 'auto'}>
            {session.uploadedFile ? (
              <View className="px-5 pt-4 pb-1">
                {session.uploadedFile.isImage && session.uploadedFile.previewUri ? (
                  <View className="relative self-start">
                    <Image
                      source={{ uri: session.uploadedFile.previewUri }}
                      accessibilityLabel={session.uploadedFile.name}
                      className="w-16 h-16 rounded-xl border border-neutral-200/80 dark:border-white/10"
                    />
                    <Pressable
                      onPress={session.removeUploadedFile}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-neutral-800 dark:bg-neutral-700 items-center justify-center"
                    >
                      <X size={12} color="#fff" />
                    </Pressable>
                  </View>
                ) : (
                  <View
                    className={`flex-row items-center gap-2 self-start max-w-full px-3 py-1.5 rounded-full ${
                      isDark ? 'bg-white/10' : 'bg-neutral-100/90 dark:bg-white/5'
                    }`}
                  >
                    <File size={16} color={mutedIcon} />
                    <Text
                      className={`text-sm flex-shrink ${
                        isDark ? 'text-neutral-200' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                      numberOfLines={1}
                    >
                      {session.uploadedFile.name}
                    </Text>
                    <Pressable onPress={session.removeUploadedFile} className="p-0.5 rounded-full">
                      <X size={14} color={mutedIcon} />
                    </Pressable>
                  </View>
                )}
              </View>
            ) : null}

            {!session.hideTextInput ? (
              <TextInput
                ref={composerInputRef}
                value={session.inputText}
                onChangeText={session.setInputText}
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
                placeholder={composerPlaceholder}
                placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
                multiline
                textAlignVertical="top"
                editable={!session.attachMenuOpen}
                className={`min-h-[96px] max-h-40 px-5 py-4 text-base leading-snug ${
                  isDark ? 'text-neutral-100' : 'text-neutral-800'
                }`}
              />
            ) : null}
            </View>

            <View className="flex-row items-center justify-between px-4 pb-4 pt-1.5" style={{ overflow: 'visible' }}>
              <View className="flex-row items-center gap-2" style={{ overflow: 'visible' }}>
                <AttachMenu
                  anchorRef={anchorRef}
                  open={session.attachMenuOpen}
                  onToggle={handleAttachToggle}
                  disabled={session.phase === 'loading'}
                  darkSurface={isDark}
                />
                <ModelChip
                  value={session.depthPreference}
                  onChange={session.setDepthPreference}
                  disabled={session.phase === 'loading' || session.attachMenuOpen}
                />
              </View>
              <ComposerSendButton
                onPress={() => {
                  clearPendingOpen();
                  void session.handleTransform();
                }}
                disabled={!canSend || session.attachMenuOpen}
                accessibilityLabel="Transformar"
              />
            </View>
            </ComposerSurface>
          </ComposerDock>

          <AttachMenuOverlay
            open={session.attachMenuOpen}
            anchorRect={anchorRect}
            scrimBottomInset={scrimBottomInset}
            onClose={dismissAttachMenu}
            onPickImage={() => void session.handlePickImage()}
            onPickCamera={() => void session.handlePickCamera()}
            onPickFile={() => void session.handlePickFile()}
            darkSurface={isDark}
          />
      </View>
    </SafeAreaView>
  );
}
