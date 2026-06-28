import React from 'react';
import { View } from 'react-native';
import { isSkiaAvailable } from '../logic/skiaAvailability';
import type { LiquidGlassOrbProps } from './liquidGlassOrbShared';

export type { LiquidGlassOrbProps, LiquidGlassOrbIntensity, LiquidGlassOrbVariant } from './liquidGlassOrbShared';

type SkiaRenderer = React.ComponentType<LiquidGlassOrbProps>;

let cachedSkiaRenderer: SkiaRenderer | null | undefined;

function getSkiaRenderer(): SkiaRenderer | null {
  if (cachedSkiaRenderer !== undefined) return cachedSkiaRenderer;
  if (!isSkiaAvailable()) {
    cachedSkiaRenderer = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedSkiaRenderer = require('./LiquidGlassOrbSkia').LiquidGlassOrbSkia as SkiaRenderer;
  } catch {
    cachedSkiaRenderer = null;
  }
  return cachedSkiaRenderer;
}

export function LiquidGlassOrb(props: LiquidGlassOrbProps) {
  const { size = 156, style } = props;
  const SkiaRenderer = getSkiaRenderer();
  if (SkiaRenderer) {
    return <SkiaRenderer {...props} />;
  }
  return <View style={[{ width: size, height: size, backgroundColor: 'transparent' }, style]} />;
}

export default LiquidGlassOrb;
