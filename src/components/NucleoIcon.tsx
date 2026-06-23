import React, { useState } from 'react';

export const NucleoIcon = ({ className = '' }) => {
  const [isInteracting, setIsInteracting] = useState(false);

  const handleInteraction = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 700);
  };

  return (
    <div
      onClick={handleInteraction}
      className={`nucleo-wrapper ${isInteracting ? 'is-bursting' : ''} ${className}`}
      role="button"
      aria-label="Animación del núcleo"
      tabIndex={0}
    >
      <style>{`
        .nucleo-wrapper {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 8px;
        }
        
        .nucleo-wrapper.is-bursting {
          transform: scale(1.2);
        }
        
        .nucleo-svg {
          width: 56px; 
          height: 56px;
          color: #000;
          overflow: visible;
        }

        .nucleo-core {
          transform-origin: center;
          animation: core-pulse 3s ease-in-out infinite alternate;
        }

        .nucleo-orbit {
          fill: none;
          stroke: currentColor;
          stroke-width: 2.5;
          opacity: 0.25;
        }

        @keyframes core-pulse {
          from { 
            transform: scale(0.9); 
            opacity: 0.8;
            filter: drop-shadow(0 0 2px currentColor); 
          }
          to { 
            transform: scale(1.1); 
            opacity: 1;
            filter: drop-shadow(0 0 6px currentColor); 
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nucleo-core { animation: none; filter: drop-shadow(0 0 4px currentColor); }
          .nucleo-wrapper.is-bursting { transform: none; }
        }
      `}</style>

      <svg viewBox="0 0 100 100" className="nucleo-svg" aria-hidden="true">
        <circle cx="50" cy="50" r="7" className="nucleo-core" />

        <g>
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
        </g>

        <g transform="rotate(60 50 50)">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
        </g>

        <g transform="rotate(120 50 50)">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
        </g>
      </svg>
    </div>
  );
};

export default NucleoIcon;
