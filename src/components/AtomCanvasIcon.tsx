import React, { useEffect, useRef } from 'react';

type AtomCanvasIconProps = {
  className?: string;
  size?: number;
};

export default function AtomCanvasIcon({ className = '', size = 112 }: AtomCanvasIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = size;
    const h = size;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2;
    const cy = h / 2;
    const a = Math.min(w, h) * 0.4;  // Semi-major axis
    const b = Math.min(w, h) * 0.12; // Semi-minor axis

    const particles: any[] = [];
    const numOrbits = 3;
    const particlesPerOrbit = 2;
    const trailLength = 35; // Length of the spirograph tail

    for (let i = 0; i < numOrbits; i++) {
      const orbitAngle = (Math.PI * 2 / numOrbits) * i;
      const speed = 0.15 + Math.random() * 0.02; // Very fast speed for persistence of vision
      for (let j = 0; j < particlesPerOrbit; j++) {
        particles.push({
          orbitAngle: orbitAngle, 
          phase: (Math.PI * 2 / particlesPerOrbit) * j,
          speed: speed,
          history: [] // stores {x, y, phase}
        });
      }
    }

    let frameId = 0;
    let stopped = false;
    let isPressed = false;
    const isDarkTheme = () => document.documentElement.classList.contains('dark');

    const draw = () => {
      if (stopped) return;
      const dark = isDarkTheme();

      // Completely clear the main canvas every frame
      // This prevents ANY ghosting, grey circles, or artifacts
      ctx.clearRect(0, 0, w, h);

      const systemRotation = performance.now() * 0.0001;
      const colorValues = dark ? '129, 140, 248' : '79, 70, 229';

      if (!isPressed || reducedMotion) {
        ctx.globalCompositeOperation = 'source-over';
        const segments = 60;
        for (let i = 0; i < numOrbits; i++) {
          const orbitAngle = (Math.PI * 2 / numOrbits) * i;
          const cosR = Math.cos(orbitAngle);
          const sinR = Math.sin(orbitAngle);
          
          for (let s = 0; s < segments; s++) {
            const t1 = (Math.PI * 2 / segments) * s;
            const t2 = (Math.PI * 2 / segments) * (s + 1);

            const zFactor = Math.sin(t1);
            const orbitWidth = (size / 100) * (1.5 + zFactor * 1.0);
            const alpha = 0.18 + (zFactor * 0.12); // Ranges from 0.06 to 0.30

            const x_ellipse1 = Math.cos(t1) * a;
            const y_ellipse1 = Math.sin(t1) * b;
            const x1 = cx + x_ellipse1 * cosR - y_ellipse1 * sinR;
            const y1 = cy + x_ellipse1 * sinR + y_ellipse1 * cosR;

            const x_ellipse2 = Math.cos(t2) * a;
            const y_ellipse2 = Math.sin(t2) * b;
            const x2 = cx + x_ellipse2 * cosR - y_ellipse2 * sinR;
            const y2 = cy + x_ellipse2 * sinR + y_ellipse2 * cosR;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = orbitWidth;
            ctx.lineCap = 'round';
            
            // Premium 3D drop shadow
            if (zFactor > 0) {
               ctx.shadowBlur = (size / 100) * (8 * zFactor);
               ctx.shadowOffsetY = (size / 100) * (4 * zFactor);
               ctx.shadowColor = dark ? `rgba(0, 0, 0, ${0.9 * zFactor})` : `rgba(30, 27, 75, ${0.4 * zFactor})`;
            } else {
               ctx.shadowBlur = 0;
               ctx.shadowOffsetY = 0;
            }
            ctx.strokeStyle = dark ? `rgba(129, 140, 248, ${alpha})` : `rgba(79, 70, 229, ${alpha})`;
            ctx.stroke();

            // Liquid Glass 3D Specular Highlight (Internal Volume Shading)
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            if (zFactor > -0.2) {
               ctx.beginPath();
               const highlightOffset = orbitWidth * 0.25;
               ctx.moveTo(x1, y1 - highlightOffset);
               ctx.lineTo(x2, y2 - highlightOffset);
               const highlightAlpha = (zFactor + 0.2) / 1.2 * (dark ? 0.5 : 0.4);
               ctx.strokeStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
               ctx.lineWidth = orbitWidth * 0.4;
               ctx.stroke();
            }
          }
        }
      } else {
        ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

        particles.forEach((p) => {
          p.phase += p.speed;
          p.orbitAngle += 0.006; 
          const totalRotation = p.orbitAngle;
        const cosR = Math.cos(totalRotation);
        const sinR = Math.sin(totalRotation);

        const x_ellipse = Math.cos(p.phase) * a;
        const y_ellipse = Math.sin(p.phase) * b;

        const x = cx + x_ellipse * cosR - y_ellipse * sinR;
        const y = cy + x_ellipse * sinR + y_ellipse * cosR;

        // Record history for the trail
        p.history.push({ x, y, phase: p.phase });
        if (p.history.length > trailLength) {
          p.history.shift();
        }

        // Draw trail segments
        if (p.history.length > 1) {
          for (let i = 0; i < p.history.length - 1; i++) {
            const current = p.history[i];
            const next = p.history[i + 1];
            
            // Fade ratio from 0 (tail tip) to 1 (near the head)
            const fadeRatio = i / p.history.length;
            // Easing the fade so the tail disappears smoothly
            const opacityMultiplier = Math.pow(fadeRatio, 1.5);
            
            const zFactor = Math.sin(current.phase);
            const trailWidth = (size / 100) * (3 + zFactor * 2); 
            const baseAlpha = 0.7 + zFactor * 0.3;
            const alpha = baseAlpha * opacityMultiplier;
            
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            
            ctx.strokeStyle = `rgba(${colorValues}, ${alpha * 0.8})`; 
            ctx.lineWidth = trailWidth; 
            ctx.lineCap = 'round';
            
            // Restore pure energy glow for moving trails (no physical shadows)
            if (fadeRatio > 0.7) {
                ctx.shadowBlur = (size / 100) * 8 * fadeRatio;
                ctx.shadowOffsetY = 0;
                ctx.shadowColor = `rgba(${colorValues}, ${alpha * 0.6})`;
            } else {
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
            }
            ctx.stroke();
          }
        }

        // Draw the solid bright core ONLY at the head
        const head = p.history[p.history.length - 1];
        if (head) {
          const zFactorHead = Math.sin(head.phase);
          const dotRadius = (size / 100) * (2 + zFactorHead * 1.5);
          const headAlpha = 0.7 + zFactorHead * 0.3;
          
          ctx.beginPath();
          ctx.arc(head.x, head.y, dotRadius, 0, Math.PI * 2); 
          ctx.fillStyle = dark ? `rgba(255, 255, 255, ${headAlpha})` : `rgba(${colorValues}, ${headAlpha})`;
          ctx.shadowBlur = (size / 100) * 12;
          ctx.shadowOffsetY = 0;
          ctx.shadowColor = dark ? `rgba(255, 255, 255, ${headAlpha})` : `rgba(${colorValues}, ${headAlpha})`;
          ctx.fill();
        }
      });
      }

      // Draw single solid Nucleus
      ctx.globalCompositeOperation = 'source-over';
      const pulse = Math.sin(systemRotation * 8) * 0.08 + 0.92;
      const nucleusRadius = b * 0.6; // Scale up slightly since there's only one
      const nucColor = dark ? '129, 140, 248' : '79, 70, 229';

      ctx.beginPath();
      ctx.arc(cx, cy, nucleusRadius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${nucColor}, 0.9)`;
      
      if (!isPressed) {
          ctx.shadowBlur = (size / 100) * 15;
          ctx.shadowOffsetY = (size / 100) * 8;
          ctx.shadowColor = dark ? `rgba(0, 0, 0, 0.8)` : `rgba(30, 27, 75, 0.5)`;
      } else {
          ctx.shadowBlur = (size / 100) * 15;
          ctx.shadowOffsetY = 0;
          ctx.shadowColor = `rgba(${nucColor}, 0.9)`;
      }
      ctx.fill();

      // Bright inner core shifted upwards to simulate 3D sphere specular reflection
      ctx.beginPath();
      ctx.arc(cx, cy - (nucleusRadius * 0.15), nucleusRadius * pulse * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = dark ? '#fff' : `rgba(${nucColor}, 1)`;
      ctx.shadowBlur = (size / 100) * 10;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = dark ? '#fff' : `rgba(${nucColor}, 1)`;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    };

    // Initial draw for static orbits
    draw(); 

    const loop = () => {
      if (stopped || !isPressed) return;
      draw();
      frameId = window.requestAnimationFrame(loop);
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Only react to primary button if it's a mouse
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      
      if (!isPressed && !reducedMotion) {
        isPressed = true;
        loop();
      }
    };

    const handlePointerUp = () => {
      if (isPressed) {
        isPressed = false;
        draw();
      }
    };

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.addEventListener('pointerdown', handlePointerDown);
    }
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      stopped = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      if (canvasEl) {
        canvasEl.removeEventListener('pointerdown', handlePointerDown);
      }
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [size]);

  return (
    <div
      className={`inline-flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform duration-300 ${className}`}
      style={{ width: size, height: size, WebkitTapHighlightColor: 'transparent' }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block pointer-events-auto touch-none" />
    </div>
  );
}
