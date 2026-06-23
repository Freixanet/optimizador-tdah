import React, { useEffect, useId, useRef, useState } from 'react';

export const NucleoIcon = ({ className = '' }) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const rawId = useId();
  const glowId = `nucleo-glow-${rawId.replace(/:/g, '')}`;

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
    <button
      type="button"
      onClick={triggerBurst}
      className={`nucleo-wrapper ${isInteracting ? 'is-bursting' : ''} ${className}`}
      aria-label="Activar núcleo"
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

        .nucleo-svg {
          width: 56px;
          height: 56px;
          overflow: visible;
        }

        .nucleo-halo {
          fill: currentColor;
          opacity: 0.075;
          transform-origin: 50px 50px;
          transform-box: fill-box;
          animation: nucleo-halo-breathe 4.2s ease-in-out infinite;
        }

        .nucleo-core {
          fill: currentColor;
          animation: nucleo-core-pulse 2.8s ease-in-out infinite;
        }

        .nucleo-orbit {
          fill: none;
          stroke: currentColor;
          stroke-width: 2.35;
          stroke-linecap: round;
          opacity: 0.18;
        }

        .nucleo-energy-glow,
        .nucleo-energy {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-dasharray: 15 177;
          animation-name: nucleo-energy-flow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .nucleo-energy-glow {
          stroke-width: 7;
          opacity: 0.13;
          filter: url(#${glowId});
        }

        .nucleo-energy {
          stroke-width: 2.6;
          opacity: 0.86;
          filter: drop-shadow(0 0 5px currentColor);
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

        .energy-2 .nucleo-energy {
          opacity: 0.68;
          stroke-width: 2.35;
        }

        .energy-2 .nucleo-energy-glow {
          opacity: 0.1;
        }

        .energy-3 .nucleo-energy,
        .energy-3 .nucleo-energy-glow {
          animation-duration: 6.8s;
          animation-delay: -2.2s;
          animation-direction: reverse;
        }

        .energy-3 .nucleo-energy {
          opacity: 0.52;
          stroke-width: 2.1;
        }

        .energy-3 .nucleo-energy-glow {
          opacity: 0.08;
        }

        .nucleo-burst-ring {
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          opacity: 0;
          transform-origin: 50px 50px;
          transform-box: fill-box;
        }

        .nucleo-wrapper.is-bursting .nucleo-burst-ring {
          animation: nucleo-burst-ring 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nucleo-wrapper.is-bursting .nucleo-core {
          animation: nucleo-core-burst 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nucleo-wrapper.is-bursting .nucleo-energy,
        .nucleo-wrapper.is-bursting .nucleo-energy-glow {
          stroke-dasharray: 24 168;
          animation-duration: 1.15s;
        }

        .nucleo-wrapper.is-bursting .nucleo-energy {
          opacity: 1;
          filter: drop-shadow(0 0 8px currentColor);
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

        @keyframes nucleo-halo-breathe {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.055;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.14;
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
            transform: scale(0.55);
            opacity: 0.42;
          }
          100% {
            transform: scale(1.55);
            opacity: 0;
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
            stroke-dasharray: 10 182;
            opacity: 0.45;
          }
        }
      `}</style>

      <svg viewBox="0 0 100 100" className="nucleo-svg" aria-hidden="true">
        <defs>
          <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
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
    </button>
  );
};

export default NucleoIcon;
