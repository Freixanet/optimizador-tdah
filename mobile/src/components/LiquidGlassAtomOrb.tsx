import React from 'react';
import LiquidGlassOrb from './LiquidGlassOrb';
import type { LiquidGlassAtomOrbProps } from './liquidGlassAtomOrbShared';
import type { PremiumSphereProps } from './premiumSphereShared';

export type { LiquidGlassAtomOrbProps };

/** @deprecated Use LiquidGlassOrb — atom rendering removed in current iteration. */
export function LiquidGlassAtomOrb(props: LiquidGlassAtomOrbProps & Partial<PremiumSphereProps>) {
  const { size, variant, intensity, style } = props;
  return (
    <LiquidGlassOrb
      size={size}
      variant={variant}
      intensity={intensity}
      style={style}
    />
  );
}

export default LiquidGlassAtomOrb;
