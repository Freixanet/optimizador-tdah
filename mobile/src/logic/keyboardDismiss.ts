import { Keyboard } from 'react-native';

export function useDismissKeyboardOnScroll() {
  return () => {
    Keyboard.dismiss();
  };
}
