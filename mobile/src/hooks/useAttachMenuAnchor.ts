import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, type View } from 'react-native';

export type AttachAnchorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useAttachMenuAnchor(
  open: boolean,
  composerHeight: number,
  onDismiss: () => void
) {
  const anchorRef = useRef<View>(null);
  const [anchorRect, setAnchorRect] = useState<AttachAnchorRect | null>(null);
  const openComposerHeightRef = useRef<number | null>(null);
  const composerHeightRef = useRef(composerHeight);

  composerHeightRef.current = composerHeight;

  const measureAnchor = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchorRect({ x, y, width, height });
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setAnchorRect(null);
      openComposerHeightRef.current = null;
      return;
    }

    const frame = requestAnimationFrame(() => {
      openComposerHeightRef.current = composerHeightRef.current;
      measureAnchor();
    });

    return () => cancelAnimationFrame(frame);
  }, [measureAnchor, open]);

  useEffect(() => {
    if (!open || openComposerHeightRef.current === null) {
      return;
    }

    if (openComposerHeightRef.current !== composerHeight) {
      onDismiss();
    }
  }, [composerHeight, onDismiss, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const dismiss = () => onDismiss();
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, dismiss);
    const hideSub = Keyboard.addListener(hideEvent, dismiss);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [onDismiss, open]);

  return { anchorRef, anchorRect };
}
