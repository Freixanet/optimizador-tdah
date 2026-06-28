import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Keyboard, Platform, type TextInput } from 'react-native';
import { useAttachMenuAnchor } from './useAttachMenuAnchor';

const OPEN_AFTER_KEYBOARD_MS = 120; // 120ms to allow layout to settle after keyboard dismiss

type UseAttachMenuControlArgs = {
  attachMenuOpen: boolean;
  setAttachMenuOpen: (open: boolean) => void;
  composerHeight: number;
  composerInputRef: RefObject<TextInput | null>;
  composerFocused: boolean;
  phase: string;
};

export function useAttachMenuControl({
  attachMenuOpen,
  setAttachMenuOpen,
  composerHeight,
  composerInputRef,
  composerFocused,
  phase,
}: UseAttachMenuControlArgs) {
  const pendingOpenRef = useRef(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardVisibleRef = useRef(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const clearPendingOpen = useCallback(() => {
    pendingOpenRef.current = false;
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const dismissAttachMenu = useCallback(() => {
    clearPendingOpen();
    setAttachMenuOpen(false);
  }, [clearPendingOpen, setAttachMenuOpen]);

  const { anchorRef, anchorRect } = useAttachMenuAnchor(
    attachMenuOpen,
    composerHeight,
    dismissAttachMenu
  );

  const scheduleOpenAfterKeyboard = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
    }

    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      if (!pendingOpenRef.current) {
        return;
      }
      pendingOpenRef.current = false;
      setAttachMenuOpen(true);
    }, OPEN_AFTER_KEYBOARD_MS);
  }, [setAttachMenuOpen]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const onShow = () => {
      keyboardVisibleRef.current = true;
      setKeyboardVisible(true);
      clearPendingOpen();
    };

    const onHide = () => {
      keyboardVisibleRef.current = false;
      setKeyboardVisible(false);
      if (pendingOpenRef.current) {
        // Cancel safety fallback timer and schedule immediate settled open
        if (openTimerRef.current) {
          clearTimeout(openTimerRef.current);
          openTimerRef.current = null;
        }
        requestAnimationFrame(() => {
          scheduleOpenAfterKeyboard();
        });
      }
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
      clearPendingOpen();
    };
  }, [clearPendingOpen, scheduleOpenAfterKeyboard]);

  useEffect(() => {
    if (phase === 'loading') {
      clearPendingOpen();
    }
  }, [clearPendingOpen, phase]);

  const isKeyboardVisible = useCallback(() => {
    return keyboardVisibleRef.current || keyboardVisible || composerFocused;
  }, [composerFocused, keyboardVisible]);

  const handleAttachToggle = useCallback(() => {
    if (phase === 'loading') {
      return;
    }

    if (attachMenuOpen) {
      dismissAttachMenu();
      return;
    }

    if (pendingOpenRef.current) {
      clearPendingOpen();
      composerInputRef.current?.blur();
      Keyboard.dismiss();
      return;
    }

    if (isKeyboardVisible()) {
      pendingOpenRef.current = true;
      composerInputRef.current?.blur();
      Keyboard.dismiss();

      // Safety fallback: if keyboardDidHide fails to fire, force open after 380ms
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        if (pendingOpenRef.current) {
          pendingOpenRef.current = false;
          setAttachMenuOpen(true);
        }
      }, 380);
      return;
    }

    setAttachMenuOpen(true);
  }, [
    attachMenuOpen,
    composerInputRef,
    dismissAttachMenu,
    clearPendingOpen,
    isKeyboardVisible,
    phase,
    setAttachMenuOpen,
  ]);

  return {
    anchorRef,
    anchorRect,
    handleAttachToggle,
    dismissAttachMenu,
    clearPendingOpen,
  };
}
