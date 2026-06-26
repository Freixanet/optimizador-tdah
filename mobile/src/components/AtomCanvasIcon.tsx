import React from 'react';
import { View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';

type AtomCanvasIconProps = {
  className?: string;
  size?: number;
};

export default function AtomCanvasIcon({ size = 112 }: AtomCanvasIconProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-user-select: none;
          user-select: none;
        }
        body {
          background: transparent;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        canvas {
          display: block;
          touch-action: none;
        }
      </style>
    </head>
    <body class="${isDark ? 'dark' : ''}">
      <canvas id="canvas"></canvas>
      <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        const size = ${size};
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const a = size * 0.4;
        const b = size * 0.12;

        const particles = [];
        const numOrbits = 3;
        const particlesPerOrbit = 2;
        const trailLength = 35;

        for (let i = 0; i < numOrbits; i++) {
          const orbitAngle = (Math.PI * 2 / numOrbits) * i;
          const speed = 0.15 + Math.random() * 0.02;
          for (let j = 0; j < particlesPerOrbit; j++) {
            particles.push({
              orbitAngle: orbitAngle,
              phase: (Math.PI * 2 / particlesPerOrbit) * j,
              speed: speed,
              history: []
            });
          }
        }

        let isPressed = false;
        const isDarkTheme = () => document.body.classList.contains('dark');

        function draw() {
          const dark = isDarkTheme();
          ctx.clearRect(0, 0, size, size);
          
          const systemRotation = performance.now() * 0.0001;
          const colorValues = dark ? '129, 140, 248' : '79, 70, 229';

          if (!isPressed) {
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
                const alpha = 0.18 + (zFactor * 0.12);

                const x1 = cx + Math.cos(t1) * a * cosR - Math.sin(t1) * b * sinR;
                const y1 = cy + Math.cos(t1) * a * sinR + Math.sin(t1) * b * cosR;
                const x2 = cx + Math.cos(t2) * a * cosR - Math.sin(t2) * b * sinR;
                const y2 = cy + Math.cos(t2) * a * sinR + Math.sin(t2) * b * cosR;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = orbitWidth;
                ctx.lineCap = 'round';
                
                if (zFactor > 0) {
                  ctx.shadowBlur = (size / 100) * (8 * zFactor);
                  ctx.shadowOffsetY = (size / 100) * (4 * zFactor);
                  ctx.shadowColor = dark ? 'rgba(0,0,0,' + (0.9 * zFactor) + ')' : 'rgba(30,27,75,' + (0.4 * zFactor) + ')';
                } else {
                  ctx.shadowBlur = 0;
                  ctx.shadowOffsetY = 0;
                }
                ctx.strokeStyle = dark ? 'rgba(129, 140, 248, ' + alpha + ')' : 'rgba(79, 70, 229, ' + alpha + ')';
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
                if (zFactor > -0.2) {
                  ctx.beginPath();
                  const highlightOffset = orbitWidth * 0.25;
                  ctx.moveTo(x1, y1 - highlightOffset);
                  ctx.lineTo(x2, y2 - highlightOffset);
                  const highlightAlpha = (zFactor + 0.2) / 1.2 * (dark ? 0.5 : 0.4);
                  ctx.strokeStyle = 'rgba(255,255,255,' + highlightAlpha + ')';
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
              const cosR = Math.cos(p.orbitAngle);
              const sinR = Math.sin(p.orbitAngle);

              const x = cx + Math.cos(p.phase) * a * cosR - Math.sin(p.phase) * b * sinR;
              const y = cy + Math.cos(p.phase) * a * sinR + Math.sin(p.phase) * b * cosR;

              p.history.push({ x, y, phase: p.phase });
              if (p.history.length > trailLength) p.history.shift();

              if (p.history.length > 1) {
                for (let i = 0; i < p.history.length - 1; i++) {
                  const current = p.history[i];
                  const next = p.history[i + 1];
                  const fadeRatio = i / p.history.length;
                  const opacityMultiplier = Math.pow(fadeRatio, 1.5);
                  const zFactor = Math.sin(current.phase);
                  const trailWidth = (size / 100) * (3 + zFactor * 2);
                  const baseAlpha = 0.7 + zFactor * 0.3;
                  const alpha = baseAlpha * opacityMultiplier;

                  ctx.beginPath();
                  ctx.moveTo(current.x, current.y);
                  ctx.lineTo(next.x, next.y);
                  ctx.strokeStyle = 'rgba(' + colorValues + ',' + (alpha * 0.8) + ')';
                  ctx.lineWidth = trailWidth;
                  ctx.lineCap = 'round';

                  if (fadeRatio > 0.7) {
                    ctx.shadowBlur = (size / 100) * 8 * fadeRatio;
                    ctx.shadowColor = 'rgba(' + colorValues + ',' + (alpha * 0.6) + ')';
                  } else {
                    ctx.shadowBlur = 0;
                  }
                  ctx.stroke();
                }
              }

              const head = p.history[p.history.length - 1];
              if (head) {
                const zFactorHead = Math.sin(head.phase);
                const dotRadius = (size / 100) * (2 + zFactorHead * 1.5);
                const headAlpha = 0.7 + zFactorHead * 0.3;

                ctx.beginPath();
                ctx.arc(head.x, head.y, dotRadius, 0, Math.PI * 2);
                ctx.fillStyle = dark ? 'rgba(255, 255, 255, ' + headAlpha + ')' : 'rgba(' + colorValues + ', ' + headAlpha + ')';
                ctx.shadowBlur = (size / 100) * 12;
                ctx.shadowColor = dark ? 'rgba(255, 255, 255, ' + headAlpha + ')' : 'rgba(' + colorValues + ', ' + headAlpha + ')';
                ctx.fill();
              }
            });
          }

          ctx.globalCompositeOperation = 'source-over';
          const pulse = Math.sin(systemRotation * 8) * 0.08 + 0.92;
          const nucleusRadius = b * 0.6;
          const nucColor = dark ? '129, 140, 248' : '79, 70, 229';

          ctx.beginPath();
          ctx.arc(cx, cy, nucleusRadius * pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + nucColor + ', 0.9)';
          
          if (!isPressed) {
            ctx.shadowBlur = (size / 100) * 15;
            ctx.shadowOffsetY = (size / 100) * 8;
            ctx.shadowColor = dark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(30, 27, 75, 0.5)';
          } else {
            ctx.shadowBlur = (size / 100) * 15;
            ctx.shadowOffsetY = 0;
            ctx.shadowColor = 'rgba(' + nucColor + ', 0.9)';
          }
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx, cy - (nucleusRadius * 0.15), nucleusRadius * pulse * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = dark ? '#fff' : 'rgba(' + nucColor + ', 1)';
          ctx.shadowBlur = (size / 100) * 10;
          ctx.shadowColor = dark ? '#fff' : 'rgba(' + nucColor + ', 1)';
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
        }

        let animFrame;
        function loop() {
          draw();
          if (isPressed) {
            animFrame = requestAnimationFrame(loop);
          }
        }

        draw();

        canvas.addEventListener('pointerdown', (e) => {
          isPressed = true;
          loop();
        });

        window.addEventListener('pointerup', () => {
          if (isPressed) {
            isPressed = false;
            draw();
          }
        });
        
        window.addEventListener('pointercancel', () => {
          if (isPressed) {
            isPressed = false;
            draw();
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ width: size, height: size }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
