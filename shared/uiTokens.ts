export const LIQUID_GLASS_BORDER_LIGHT = 'border border-neutral-200/70';
export const LIQUID_GLASS_BORDER_BOTTOM_LIGHT = 'border-b border-neutral-200/70';

/** Floating liquid-glass shells: no perimeter border in dark; light neutral border. */
export function liquidGlassShellClasses(
  isDark: boolean,
  className = '',
  mode: 'perimeter' | 'bottom' | 'none' = 'perimeter'
): string {
  const border =
    mode === 'none'
      ? ''
      : mode === 'bottom'
        ? isDark
          ? ''
          : LIQUID_GLASS_BORDER_BOTTOM_LIGHT
        : isDark
          ? ''
          : LIQUID_GLASS_BORDER_LIGHT;
  return [border, 'overflow-hidden', className].filter(Boolean).join(' ');
}

/** Perimeter shell shape; dark highlight matches FloatingGlassButton / ComposerSendButton. */
export function liquidGlassFloatingShellClass(isDark: boolean, shapeClass: string): string {
  return isDark ? `${shapeClass} border border-white/10` : shapeClass;
}

export const APP_DARK_BACKGROUND = '#181A1F';
/** RGB components for translucent dark surfaces (matches APP_DARK_BACKGROUND). */
export const APP_DARK_BACKGROUND_RGB = '24, 26, 31';

export const RADII = { sm: 12, md: 16, lg: 20, xl: 28, pill: 9999 } as const;
export const HAIRLINE = 1;
export const INSET_HIGHLIGHT_LIGHT = 'inset 0 1px 1px rgba(255,255,255,0.6)';
export const INSET_HIGHLIGHT_DARK = 'inset 0 1px 1px rgba(255,255,255,0.08)';
export const BLUR_INTENSITY = 24;
export const DRAWER_CORNER_RADIUS = RADII.xl;
export const COMPOSER_CORNER_RADIUS = 22;
export const COMPOSER_DARK_SURFACE = '#3E4041';
export const COMPOSER_DARK_INSET =
  '0 2px 24px rgba(0,0,0,0.25), inset 0 1px 0.5px #626463, inset 0 -1px 0.5px #626463';
