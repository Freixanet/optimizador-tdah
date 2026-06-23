import React, { useEffect, useId, useRef, useState } from 'react';

type NucleoIconProps = {
  className?: string;
  energized?: boolean;
  interactive?: boolean;
};

export const NucleoIcon = ({
  className = '',
  energized = false,
  interactive = true,
}: NucleoIconProps) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const rawId = useId();
  const glowId = `nucleo-glow-${rawId.replace(/:/g, '')}`;
  const energySoftId = `nucleo-energy-soft-${rawId.replace(/:/g, '')}`;
  const energyLightId = `nucleo-energy-light-${rawId.replace(/:/g, '')}`;
  const isBursting = isInteracting;
  const Wrapper = interactive ? 'button' : 'span';

  const triggerBurst = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsInteracting(true);

    timeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false);
    }, 700);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Wrapper
      {...(interactive
        ? {
            type: 'button' as const,
            onClick: triggerBurst,
            'aria-label': 'Activar núcleo',
          }
        : { 'aria-hidden': true as const })}
      className={`nucleo-wrapper ${isBursting ? 'is-bursting' : ''} ${energized ? 'is-energized' : ''} ${interactive ? '' : 'is-static'} ${className}`}
    >
      <style>{`
        .nucleo-wrapper {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 72px;
          height: 72px;
          padding: 8px;
          border: 0;
          background: transparent;
          color: currentColor;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nucleo-wrapper:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
          border-radius: 999px;
        }

        .nucleo-wrapper.is-bursting {
          transform: scale(1.12);
        }

        .nucleo-wrapper.is-static {
          cursor: default;
          pointer-events: none;
        }

        .nucleo-svg {
          width: 56px;
          height: 56px;
          overflow: visible;
        }

        .nucleo-halo {
          fill: currentColor;
          opacity: 0.1;
        }

        .nucleo-core {
          fill: currentColor;
          animation: nucleo-core-pulse 2.8s ease-in-out infinite;
        }

        .nucleo-orbit {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          opacity: 0.28;
        }

        .nucleo-energy-glow,
        .nucleo-energy {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 2 1 4 1 6 1 6 1 4 1 2 162;
          animation-name: nucleo-energy-flow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .nucleo-energy-glow {
          stroke-width: 11;
          opacity: 0.22;
          filter: url(#${energySoftId});
        }

        .nucleo-energy {
          stroke-width: 1.8;
          opacity: 0.62;
          filter: url(#${energyLightId});
        }

        .energy-1 .nucleo-energy,
        .energy-1 .nucleo-energy-glow {
          animation-duration: 3.9s;
        }

        .energy-2 .nucleo-energy,
        .energy-2 .nucleo-energy-glow {
          animation-duration: 5.4s;
          animation-delay: -1.1s;
        }

        .energy-2 .nucleo-energy-glow {
          opacity: 0.18;
        }

        .energy-3 .nucleo-energy,
        .energy-3 .nucleo-energy-glow {
          animation-duration: 6.8s;
          animation-delay: -2.2s;
          animation-direction: reverse;
        }

        .energy-3 .nucleo-energy-glow {
          opacity: 0.15;
        }

        .nucleo-wrapper.is-energized .nucleo-energy,
        .nucleo-wrapper.is-energized .nucleo-energy-glow {
          animation-duration: 1.15s;
        }

        .nucleo-burst-ring {
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          opacity: 0;
        }

        .nucleo-wrapper.is-bursting .nucleo-burst-ring {
          animation: nucleo-burst-ring 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nucleo-wrapper.is-bursting .nucleo-core {
          animation: nucleo-core-burst 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nucleo-wrapper.is-bursting .nucleo-energy,
        .nucleo-wrapper.is-bursting .nucleo-energy-glow {
          animation-duration: 1.15s;
        }

        @keyframes nucleo-core-pulse {
          0%, 100% {
            opacity: 0.72;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes nucleo-core-burst {
          0% {
            opacity: 0.84;
          }
          34% {
            opacity: 1;
          }
          100% {
            opacity: 0.84;
          }
        }

        @keyframes nucleo-energy-flow {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -192;
          }
        }

        @keyframes nucleo-burst-ring {
          0% {
            opacity: 0.38;
            stroke-width: 2;
          }
          100% {
            opacity: 0;
            stroke-width: 0.75;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nucleo-core,
          .nucleo-halo,
          .nucleo-energy,
          .nucleo-energy-glow,
          .nucleo-burst-ring {
            animation: none !important;
          }

          .nucleo-wrapper.is-bursting {
            transform: none;
          }

          .nucleo-core {
            opacity: 1;
          }

          .nucleo-halo {
            opacity: 0.1;
          }

          .nucleo-energy,
          .nucleo-energy-glow {
            stroke-dasharray: 2 1 4 1 6 1 6 1 4 1 2 162;
            opacity: 0.35;
          }
        }
      `}</style>

      <svg viewBox="0 0 100 100" className="nucleo-svg" aria-hidden="true">
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={energySoftId} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4.2" />
          </filter>
          <filter id={energyLightId} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="50" cy="50" r="18" className="nucleo-halo" />
        <circle cx="50" cy="50" r="25" className="nucleo-burst-ring" />

        <g>
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
        </g>

        <g transform="rotate(60 50 50)">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
        </g>

        <g transform="rotate(120 50 50)">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
        </g>

        <g className="energy-1">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-energy-glow" />
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-energy" />
        </g>

        <g className="energy-2" transform="rotate(60 50 50)">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-energy-glow" />
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-energy" />
        </g>

        <g className="energy-3" transform="rotate(120 50 50)">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-energy-glow" />
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-energy" />
        </g>

        <circle cx="50" cy="50" r="7" className="nucleo-core" filter={`url(#${glowId})`} />
      </svg>
    </Wrapper>
  );
};

export default NucleoIcon;
