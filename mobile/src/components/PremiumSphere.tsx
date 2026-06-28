import React from 'react';
import LiquidGlassOrb from './LiquidGlassOrb';
import type { PremiumSphereProps, SphereVariant } from './premiumSphereShared';

export type { PremiumSphereProps, SphereVariant };

/** @deprecated Use LiquidGlassOrb. */
export function PremiumSphere(props: PremiumSphereProps) {
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

export default PremiumSphere;
