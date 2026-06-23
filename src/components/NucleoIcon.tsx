import React, { useState } from 'react';

export const NucleoIcon = ({ className = '' }) => {
  const [isInteracting, setIsInteracting] = useState(false);

  const handleInteraction = () => {
    // Evita solapar clics si ya está en animación
    if (isInteracting) return;
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 700);
  };

  // Ajuste drástico de velocidad durante los 700ms del clic
  const orbit1Duration = isInteracting ? '0.8s' : '8s';
  const orbit2Duration = isInteracting ? '1s' : '12s';

  return (
    <div
      onClick={handleInteraction}
      className={`nucleo-container ${isInteracting ? 'is-bursting' : ''} ${className}`}
      role="button"
      aria-label="Animación del núcleo"
      tabIndex={0}
    >
      <style>{`
        .nucleo-container {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          /* Curva de aceleración estilo iOS (spring) */
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nucleo-container.is-bursting {
          transform: scale(1.15);
        }
        
        .nucleo-svg {
          width: 64px; /* Ajustable vía props/padre */
          height: 64px;
          color: currentColor;
          overflow: visible;
        }

        /* Animaciones base */
        .nucleo-core {
          transform-origin: center;
          animation: core-breathe 3s ease-in-out infinite alternate;
        }
        .nucleo-ring {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.5;
          opacity: 0.15;
          transform-origin: center;
        }
        .nucleo-ring-1 {
          animation: ring-sway 15s ease-in-out infinite alternate;
        }
        .nucleo-ring-2 {
          animation: ring-sway-reverse 20s ease-in-out infinite alternate;
        }
        .nucleo-particle {
          fill: currentColor;
          filter: drop-shadow(0 0 3px currentColor);
        }

        /* Keyframes */
        @keyframes core-breathe {
          from { 
            transform: scale(0.95); 
            filter: drop-shadow(0 0 2px currentColor); 
            opacity: 0.8;
          }
          to { 
            transform: scale(1.15); 
            filter: drop-shadow(0 0 8px currentColor); 
            opacity: 1;
          }
        }
        @keyframes ring-sway {
          from { transform: rotate(-5deg) scale(0.98); }
          to { transform: rotate(5deg) scale(1.02); }
        }
        @keyframes ring-sway-reverse {
          from { transform: rotate(5deg) scale(0.98); }
          to { transform: rotate(-5deg) scale(1.02); }
        }

        /* Accesibilidad: Reducción de movimiento */
        @media (prefers-reduced-motion: reduce) {
          .nucleo-core, .nucleo-ring-1, .nucleo-ring-2 {
            animation: none;
          }
          .nucleo-container.is-bursting {
            transform: none;
          }
          .nucleo-core {
            filter: drop-shadow(0 0 4px currentColor);
          }
          .particle-anim {
            display: none;
          }
        }
      `}</style>

      <svg viewBox="0 0 100 100" className="nucleo-svg" aria-hidden="true">
        {/* NÚCLEO CENTRAL */}
        <circle cx="50" cy="50" r="5" className="nucleo-core" />

        {/* ÓRBITA 1 (Inclinada hacia la derecha) */}
        <g transform="translate(50, 50) rotate(35) translate(-50, -50)">
          <ellipse cx="50" cy="50" rx="38" ry="14" className="nucleo-ring nucleo-ring-1" />
          <circle r="2.5" className="nucleo-particle">
            {/* El path coincide exactamente con la elipse para un tracking perfecto */}
            <animateMotion
              className="particle-anim"
              dur={orbit1Duration}
              repeatCount="indefinite"
              path="M 50,36 A 38,14 0 1,1 49.9,36"
            />
          </circle>
        </g>

        {/* ÓRBITA 2 (Inclinada hacia la izquierda) */}
        <g transform="translate(50, 50) rotate(-35) translate(-50, -50)">
          <ellipse cx="50" cy="50" rx="38" ry="14" className="nucleo-ring nucleo-ring-2" />
          <circle r="2.5" className="nucleo-particle">
            {/* El flag 1,0 al final invierte la dirección de la partícula */}
            <animateMotion
              className="particle-anim"
              dur={orbit2Duration}
              repeatCount="indefinite"
              path="M 50,36 A 38,14 0 1,0 50.1,36"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
};

export default NucleoIcon;
