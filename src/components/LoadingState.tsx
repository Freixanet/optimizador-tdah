import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import NucleoIcon from './NucleoIcon';

const PHASES = [
  'Leyendo la fuente',
  'Detectando la estructura',
  'Destilando el núcleo',
  'Generando los pasos',
] as const;

const SKELETON_BASE =
  'bg-zinc-200/70 dark:bg-zinc-800/70 border border-indigo-500/[0.06] dark:border-indigo-400/[0.08]';
const SHIMMER_VIA = 'via-indigo-400/30 dark:via-indigo-500/15';
const PHASE_TEXT = 'text-indigo-600 dark:text-indigo-400';

type LoadingStateProps = {
  className?: string;
};

function ShimmerBlock({
  className = '',
  reduceMotion,
  shimmerDelay = 0,
}: {
  className?: string;
  reduceMotion: boolean | null;
  shimmerDelay?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md ${SKELETON_BASE} ${className}`}
      aria-hidden="true"
    >
      {!reduceMotion && (
        <motion.div
          className={`absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent ${SHIMMER_VIA} to-transparent`}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'linear',
            delay: shimmerDelay,
          }}
        />
      )}
    </div>
  );
}

function AppIconGlow({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <span className="relative inline-flex items-center justify-center w-11 h-11 shrink-0">
      {!reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/60 to-indigo-600/40 dark:from-indigo-500/50 dark:to-indigo-400/30 blur-md"
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}
      <NucleoIcon
        energized={!reduceMotion}
        interactive={false}
        className={`scale-[0.45] origin-center ${PHASE_TEXT}`}
      />
    </span>
  );
}

function PhaseDots({ reduceMotion }: { reduceMotion: boolean | null }) {
  if (reduceMotion) {
    return (
      <span className="text-neutral-400 dark:text-neutral-500" aria-hidden="true">
        …
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}

function StaggerReveal({
  index,
  reduceMotion,
  children,
}: {
  index: number;
  reduceMotion: boolean | null;
  children: React.ReactNode;
}) {
  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function LoadingState({ className = '' }: LoadingStateProps) {
  const reduceMotion = useReducedMotion();
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (phaseIndex >= PHASES.length - 1) return;

    const timer = window.setInterval(() => {
      setPhaseIndex((current) => Math.min(current + 1, PHASES.length - 1));
    }, 1500);

    return () => window.clearInterval(timer);
  }, [phaseIndex]);

  const currentPhase = PHASES[phaseIndex];

  return (
    <div
      className={`max-w-3xl mx-auto px-6 py-8 pb-32 w-full ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mb-12">
        <ShimmerBlock className="h-3 w-2/5 max-w-xs" reduceMotion={reduceMotion} shimmerDelay={0} />
      </div>

      <div className="mb-10 flex items-center gap-3 min-h-[1.5rem]">
        <AppIconGlow reduceMotion={reduceMotion} />
        {reduceMotion ? (
          <p className={`text-sm font-medium ${PHASE_TEXT}`}>
            {currentPhase}{' '}
            <PhaseDots reduceMotion={reduceMotion} />
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPhase}
              className={`text-sm font-medium ${PHASE_TEXT} flex items-center gap-3`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {currentPhase}
              <PhaseDots reduceMotion={reduceMotion} />
            </motion.p>
          </AnimatePresence>
        )}
      </div>

      <div className="content-column">
        <div className="mb-16">
          <div className="mb-6">
            <ShimmerBlock className="h-3 w-24" reduceMotion={reduceMotion} shimmerDelay={0.15} />
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-app-canvas p-6 sm:p-8 space-y-4">
            <ShimmerBlock className="h-8 w-[90%]" reduceMotion={reduceMotion} shimmerDelay={0.3} />
            <ShimmerBlock className="h-6 w-[70%]" reduceMotion={reduceMotion} shimmerDelay={0.45} />
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-white/5 pt-12 pb-8">
          <ShimmerBlock className="h-3 w-48 mb-10" reduceMotion={reduceMotion} shimmerDelay={0.6} />

          <div className="grid gap-10">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i}>
                <StaggerReveal index={i} reduceMotion={reduceMotion}>
                <div className="flex gap-6 items-start">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-white/10 ${SKELETON_BASE}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1 space-y-3">
                    <ShimmerBlock
                      className="h-5 w-1/2"
                      reduceMotion={reduceMotion}
                      shimmerDelay={0.75 + i * 0.15}
                    />
                    <ShimmerBlock
                      className="h-4 w-4/5"
                      reduceMotion={reduceMotion}
                      shimmerDelay={0.9 + i * 0.15}
                    />
                  </div>
                </div>
                </StaggerReveal>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-white/5 pt-12 space-y-8">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i}>
              <StaggerReveal index={i} reduceMotion={reduceMotion}>
              <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-app-canvas p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <ShimmerBlock
                    className="h-5 w-8 rounded-full"
                    reduceMotion={reduceMotion}
                    shimmerDelay={1.35 + i * 0.15}
                  />
                  <ShimmerBlock
                    className="h-4 w-16 rounded-full"
                    reduceMotion={reduceMotion}
                    shimmerDelay={1.5 + i * 0.15}
                  />
                </div>
                <ShimmerBlock
                  className="h-8 w-3/4 mb-8"
                  reduceMotion={reduceMotion}
                  shimmerDelay={1.65 + i * 0.15}
                />
                <div className="space-y-3">
                  <ShimmerBlock
                    className="h-4 w-full"
                    reduceMotion={reduceMotion}
                    shimmerDelay={1.8 + i * 0.15}
                  />
                  <ShimmerBlock
                    className="h-4 w-5/6"
                    reduceMotion={reduceMotion}
                    shimmerDelay={1.95 + i * 0.15}
                  />
                </div>
              </div>
              </StaggerReveal>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
