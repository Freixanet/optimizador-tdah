import React, { useState } from 'react';

export const NucleoIcon = ({ className = '' }) => {
  const [isInteracting, setIsInteracting] = useState(false);

  const handleInteraction = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    // Vuelve a la normalidad después de 700ms
    setTimeout(() => setIsInteracting(false), 700);
  };

  // El cambio de 'key' fuerza a React a reiniciar la animación al instante,
  // creando un efecto de "salto cuántico" perfecto para la ráfaga de energía.
  const animKey = isInteracting ? 'burst' : 'normal';

  // Velocidades: Muy elegantes en reposo, rapidísimas en el tap.
  const dur1 = isInteracting ? '0.6s' : '7s';
  const dur2 = isInteracting ? '0.8s' : '9s';
  const dur3 = isInteracting ? '1s' : '11s';

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
          padding: 8px; /* Área de toque más amplia */
        }
        
        .nucleo-wrapper.is-bursting {
          transform: scale(1.2);
        }
        
        /* Tamaño ajustado al de tu primera imagen (pequeño y elegante) */
        .nucleo-svg {
          width: 56px; 
          height: 56px;
          color: #000; /* Forzamos el negro para que destaque, o usa currentColor si tu app tiene modo oscuro */
          overflow: visible;
        }

        /* Núcleo central */
        .nucleo-core {
          transform-origin: center;
          animation: core-pulse 3s ease-in-out infinite alternate;
        }

        /* Órbitas */
        .nucleo-orbit {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.5; /* Más gruesas para que destaquen */
          opacity: 0.25;
        }

        /* Electrones */
        .nucleo-electron {
          fill: currentColor;
          /* Resplandor sutil para que parezcan partículas de energía */
          filter: drop-shadow(0px 0px 2px currentColor);
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

        /* Reducción de movimiento por accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          .nucleo-core { animation: none; filter: drop-shadow(0 0 4px currentColor); }
          .nucleo-wrapper.is-bursting { transform: none; }
          .nucleo-electron-anim { display: none; }
        }
      `}</style>

      <svg viewBox="0 0 100 100" className="nucleo-svg" aria-hidden="true">
        {/* NÚCLEO CENTRAL */}
        <circle cx="50" cy="50" r="7" className="nucleo-core" />

        {/* --- ÓRBITA 1: Horizontal (0 grados) --- */}
        <g>
          {/* Elipse base (visual) */}
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
          {/* Electrón 1 */}
          <circle r="3.5" className="nucleo-electron">
            <animateMotion
              key={`o1-${animKey}`}
              className="nucleo-electron-anim"
              dur={dur1}
              repeatCount="indefinite"
              path="M 8,50 A 42,14 0 1,1 92,50 A 42,14 0 1,1 8,50"
            />
          </circle>
        </g>

        {/* --- ÓRBITA 2: Inclinada 60 grados --- */}
        <g transform="rotate(60 50 50)">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
          <circle r="3.5" className="nucleo-electron">
            <animateMotion
              key={`o2-${animKey}`}
              className="nucleo-electron-anim"
              dur={dur2}
              repeatCount="indefinite"
              path="M 8,50 A 42,14 0 1,1 92,50 A 42,14 0 1,1 8,50"
            />
          </circle>
        </g>

        {/* --- ÓRBITA 3: Inclinada 120 grados (-60 grados) --- */}
        <g transform="rotate(120 50 50)">
          <ellipse cx="50" cy="50" rx="42" ry="14" className="nucleo-orbit" />
          <circle r="3.5" className="nucleo-electron">
            <animateMotion
              key={`o3-${animKey}`}
              className="nucleo-electron-anim"
              dur={dur3}
              repeatCount="indefinite"
              path="M 8,50 A 42,14 0 1,0 92,50 A 42,14 0 1,0 8,50"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
};

export default NucleoIcon;
