import { useCallback, useId, useRef, type SVGProps } from 'react';
import { useReducedMotion } from 'motion/react';

type LivingNucleusIconProps = {
  className?: string;
  interactive?: boolean;
  ariaLabel?: string;
} & Omit<SVGProps<SVGSVGElement>, 'className'>;

const ORBITS = [
  { tilt: 0, duration: 18, electronOpacity: 0.92 },
  { tilt: 60, duration: 24, electronOpacity: 0.78 },
  { tilt: 120, duration: 30, electronOpacity: 0.68 },
] as const;

const CENTER = 12;
const BURST_MS = 700;

export default function LivingNucleusIcon({
  className = 'w-10 h-10',
  interactive = true,
  ariaLabel = 'Núcleo',
  ...props
}: LivingNucleusIconProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const burstTimerRef = useRef<number | null>(null);

  const triggerBurst = useCallback(() => {
    if (reduceMotion || !interactive) return;
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;

    root.classList.remove('nucleus-living--burst');
    void root.offsetWidth;
    root.classList.add('nucleus-living--burst');

    svg.querySelectorAll<SVGAnimateTransformElement>('animateTransform[data-orbit]').forEach((node) => {
      const base = Number(node.dataset.baseDur || node.getAttribute('dur')?.replace('s', '') || 18);
      node.setAttribute('dur', `${Math.max(base * 0.28, 4)}s`);
    });

    if (burstTimerRef.current !== null) {
      window.clearTimeout(burstTimerRef.current);
    }
    burstTimerRef.current = window.setTimeout(() => {
      root.classList.remove('nucleus-living--burst');
      svg.querySelectorAll<SVGAnimateTransformElement>('animateTransform[data-orbit]').forEach((node) => {
        const base = node.dataset.baseDur;
        if (base) node.setAttribute('dur', `${base}s`);
      });
      burstTimerRef.current = null;
    }, BURST_MS);
  }, [interactive, reduceMotion]);

  const glowFilterId = `nucleus-glow-${uid}`;

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
        ref={svgRef}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="nucleus-living__svg relative z-[1] h-full w-full overflow-visible"
        aria-hidden={interactive ? undefined : true}
        {...props}
      >
        <defs>
          <filter id={glowFilterId} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ORBITS.map((orbit) => (
          <g key={orbit.tilt} transform={`rotate(${orbit.tilt} ${CENTER} ${CENTER})`}>
            <g>
              {!reduceMotion && (
                <animateTransform
                  data-orbit="true"
                  data-base-dur={orbit.duration}
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${CENTER} ${CENTER}`}
                  to={`360 ${CENTER} ${CENTER}`}
                  dur={`${orbit.duration}s`}
                  repeatCount="indefinite"
                />
              )}
              <ellipse
                cx={CENTER}
                cy={CENTER}
                rx="9.2"
                ry="3.7"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                className="nucleus-living__ring"
              />
              <circle
                cx="21.2"
                cy={CENTER}
                r="0.55"
                fill="currentColor"
                className="nucleus-living__electron"
                style={{ opacity: orbit.electronOpacity }}
              />
            </g>
          </g>
        ))}

        <g filter={`url(#${glowFilterId})`}>
          <circle cx={CENTER} cy={CENTER} r="2.75" fill="currentColor" className="nucleus-living__core">
            {!reduceMotion && (
              <>
                <animate
                  attributeName="r"
                  values="2.75;2.95;2.75"
                  dur="3.4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.92;1;0.92"
                  dur="3.4s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
        </g>

        <circle
          cx={CENTER}
          cy={CENTER}
          r="2.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.55"
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
