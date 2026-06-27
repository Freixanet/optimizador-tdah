import React from 'react';
import GlassSurface from './GlassSurface';

type ComposerSurfaceProps = {
  children: React.ReactNode;
};

export default function ComposerSurface({ children }: ComposerSurfaceProps) {
  return (
    <GlassSurface
      liquid
      borderRadius={26}
      variant="composer"
      className="rounded-[26px] border border-neutral-200/70 dark:border-white/[0.08]"
    >
      {children}
    </GlassSurface>
  );
}
