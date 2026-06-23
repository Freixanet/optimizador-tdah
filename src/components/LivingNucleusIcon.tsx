import { useCallback, useId, useRef, type SVGProps } from 'react';
import { useReducedMotion } from 'motion/react';

type LivingNucleusIconProps = {
  className?: string;
  interactive?: boolean;
  ariaLabel?: string;
} & Omit<SVGProps<SVGSVGElement>, 'className'>;

const ORBITS = [
  { tilt: 0, duration: '18s', electronOpacity: 0.9 },
  { tilt: 60, duration: '24s', electronOpacity: 0.75 },
  { tilt: 120, duration: '30s', electronOpacity: 0.65 },
] as const;

export default function LivingNucleusIcon({
  className = 'w-10 h-10',
  interactive = true,
  ariaLabel = 'Núcleo',
  ...props
}: LivingNucleusIconProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLSpanElement>(null);
  const burstTimerRef = useRef<number | null>(null);

  const triggerBurst = useCallback(() => {
    if (reduceMotion || !interactive) return;
    const root = rootRef.current;
    if (!root) return;

    root.classList.remove('nucleus-living--burst');
    void root.offsetWidth;
    root.classList.add('nucleus-living--burst');

    if (burstTimerRef.current !== null) {
      window.clearTimeout(burstTimerRef.current);
    }
    burstTimerRef.current = window.setTimeout(() => {
      root.classList.remove('nucleus-living--burst');
      burstTimerRef.current = null;
    }, 700);
  }, [interactive, reduceMotion]);

  const glowFilterId = `nucleus-glow-${uid}`;
  const electronFilterId = `nucleus-electron-${uid}`;

  const content = (
    <span
      ref={rootRef}
      className={[
        'nucleus-living relative inline-flex items-center justify-center text-[#1A1A1A] dark:text-[#EDEDED]',
        reduceMotion ? 'nucleus-living--reduced' : '',
        interactive ? 'nucleus-living--interactive' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="nucleus-living__ambient" aria-hidden="true" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="nucleus-living__svg relative z-[1] h-full w-full overflow-visible"
        aria-hidden={interactive ? undefined : true}
        {...props}
      >
        <defs>
          <filter id={glowFilterId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={electronFilterId} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="0.55" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ORBITS.map((orbit, index) => (
          <g key={orbit.tilt} transform={`rotate(${orbit.tilt} 12 12)`}>
            <g
              className="nucleus-living__orbit"
              style={{ ['--nucleus-orbit-duration' as string]: orbit.duration }}
            >
              <ellipse
                cx="12"
                cy="12"
                rx="9.2"
                ry="3.7"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                className="nucleus-living__ring"
              />
              <circle
                cx="21.2"
                cy="12"
                r="0.55"
                fill="currentColor"
                filter={`url(#${electronFilterId})`}
                className="nucleus-living__electron"
                style={{ opacity: orbit.electronOpacity }}
              />
              {index === 0 && (
                <circle
                  cx="2.8"
                  cy="12"
                  r="0.45"
                  fill="currentColor"
                  filter={`url(#${electronFilterId})`}
                  className="nucleus-living__electron nucleus-living__electron--counter"
                  style={{ opacity: 0.5 }}
                />
              )}
            </g>
          </g>
        ))}

        <g className="nucleus-living__core-wrap" filter={`url(#${glowFilterId})`}>
          <circle cx="12" cy="12" r="2.75" fill="currentColor" className="nucleus-living__core" />
        </g>
        <circle
          cx="12"
          cy="12"
          r="2.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          className="nucleus-living__burst-ring"
          aria-hidden="true"
        />
      </svg>
    </span>
  );

  if (!interactive) return content;

  return (
    <button
      type="button"
      className="inline-flex rounded-full border-0 bg-transparent p-0 text-inherit outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-app-canvas"
      aria-label={ariaLabel}
      onClick={triggerBurst}
    >
      {content}
    </button>
  );
}
