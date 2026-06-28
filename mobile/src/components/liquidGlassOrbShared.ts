import { ViewStyle } from 'react-native';

export type LiquidGlassOrbVariant = 'purple' | 'blue' | 'mono';
export type LiquidGlassOrbIntensity = 'subtle' | 'balanced' | 'strong';

export type LiquidGlassOrbProps = {
  size?: number;
  variant?: LiquidGlassOrbVariant;
  intensity?: LiquidGlassOrbIntensity;
  style?: ViewStyle;
};

export type LiquidGlassOrbPalette = {
  glowA: string;
  glowB: string;
  glassHot: string;
  glassLight: string;
  glassMid: string;
  glassDeep: string;
  glassDark: string;
  rimA: string;
  rimB: string;
  rimC: string;
  shadow: string;
  highlight: string;
  highlightSoft: string;
};

const PURPLE_PALETTE: LiquidGlassOrbPalette = {
  glowA: 'rgba(139, 92, 246, 0.30)',
  glowB: 'rgba(49, 46, 129, 0.08)',
  glassHot: 'rgba(255, 255, 255, 0.38)',
  glassLight: 'rgba(221, 214, 254, 0.26)',
  glassMid: 'rgba(139, 92, 246, 0.14)',
  glassDeep: 'rgba(49, 46, 129, 0.22)',
  glassDark: 'rgba(5, 8, 22, 0.30)',
  rimA: 'rgba(255, 255, 255, 0.56)',
  rimB: 'rgba(255, 255, 255, 0.10)',
  rimC: 'rgba(255, 255, 255, 0.03)',
  shadow: 'rgba(0, 0, 0, 0.30)',
  highlight: 'rgba(255, 255, 255, 0.72)',
  highlightSoft: 'rgba(255, 255, 255, 0.18)',
};

const BLUE_PALETTE: LiquidGlassOrbPalette = {
  glowA: 'rgba(56, 189, 248, 0.28)',
  glowB: 'rgba(30, 58, 138, 0.08)',
  glassHot: 'rgba(255, 255, 255, 0.36)',
  glassLight: 'rgba(186, 230, 253, 0.24)',
  glassMid: 'rgba(56, 189, 248, 0.13)',
  glassDeep: 'rgba(30, 58, 138, 0.20)',
  glassDark: 'rgba(2, 6, 23, 0.30)',
  rimA: 'rgba(255, 255, 255, 0.54)',
  rimB: 'rgba(255, 255, 255, 0.10)',
  rimC: 'rgba(255, 255, 255, 0.03)',
  shadow: 'rgba(0, 0, 0, 0.30)',
  highlight: 'rgba(255, 255, 255, 0.70)',
  highlightSoft: 'rgba(255, 255, 255, 0.17)',
};

const MONO_PALETTE: LiquidGlassOrbPalette = {
  glowA: 'rgba(156, 163, 175, 0.24)',
  glowB: 'rgba(55, 65, 81, 0.08)',
  glassHot: 'rgba(255, 255, 255, 0.34)',
  glassLight: 'rgba(229, 231, 235, 0.22)',
  glassMid: 'rgba(156, 163, 175, 0.12)',
  glassDeep: 'rgba(55, 65, 81, 0.20)',
  glassDark: 'rgba(3, 7, 18, 0.30)',
  rimA: 'rgba(255, 255, 255, 0.50)',
  rimB: 'rgba(255, 255, 255, 0.09)',
  rimC: 'rgba(255, 255, 255, 0.03)',
  shadow: 'rgba(0, 0, 0, 0.30)',
  highlight: 'rgba(255, 255, 255, 0.66)',
  highlightSoft: 'rgba(255, 255, 255, 0.16)',
};

export function getLiquidGlassOrbPalette(variant: LiquidGlassOrbVariant): LiquidGlassOrbPalette {
  if (variant === 'blue') return BLUE_PALETTE;
  if (variant === 'mono') return MONO_PALETTE;
  return PURPLE_PALETTE;
}

export function getLiquidGlassOrbIntensityScale(intensity: LiquidGlassOrbIntensity): number {
  if (intensity === 'subtle') return 0.84;
  if (intensity === 'strong') return 1.08;
  return 1;
}
