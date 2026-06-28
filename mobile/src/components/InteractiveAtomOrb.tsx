import React from 'react';
import { StyleSheet, View } from 'react-native';
import AtomCanvasIcon from './AtomCanvasIcon';

type InteractiveAtomOrbProps = {
  size?: number;
  offsetY?: number;
};

export default function InteractiveAtomOrb({
  size = 64,
  offsetY = 0,
}: InteractiveAtomOrbProps) {
  return (
    <View style={{ transform: [{ translateY: offsetY }] }} pointerEvents="box-none">
      <View
        style={[styles.shell, { width: size, height: size }]}
        pointerEvents="box-none"
        accessibilityRole="image"
        accessibilityLabel="Orbe del átomo. Arrastra para rotarlo."
      >
        <AtomCanvasIcon size={size} interactive />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
