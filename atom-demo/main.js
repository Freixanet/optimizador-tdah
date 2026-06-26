import './style.css';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Offscreen canvas for persistence of vision trails
const trailCanvas = document.createElement('canvas');
const trailCtx = trailCanvas.getContext('2d');

let w, h, cx, cy;
function resize() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  trailCanvas.width = w;
  trailCanvas.height = h;
  cx = w / 2;
  cy = h / 2;
}
window.addEventListener('resize', resize);
resize();

// Particle properties
const particles = [];
const numOrbits = 3;
const particlesPerOrbit = 2; // Two opposite particles per orbit

for (let i = 0; i < numOrbits; i++) {
  const orbitAngle = (Math.PI * 2 / numOrbits) * i;
  const speed = 0.15 + Math.random() * 0.02; // Very fast speed for persistence of vision
  for (let j = 0; j < particlesPerOrbit; j++) {
    particles.push({
      orbitAngle: orbitAngle, 
      phase: (Math.PI * 2 / particlesPerOrbit) * j, // Spread particles evenly (0 and PI)
      speed: speed,
      hue: i * (360 / numOrbits)
    });
  }
}

function draw() {
  // Fade the offscreen trail canvas for the persistence of vision effect
  trailCtx.fillStyle = 'rgba(5, 5, 5, 0.04)'; 
  trailCtx.fillRect(0, 0, w, h);

  // Completely clear the main canvas every frame
  ctx.clearRect(0, 0, w, h);
  
  // Draw the accumulated fading trails to the main canvas
  ctx.drawImage(trailCanvas, 0, 0);

  // Dynamic axis calculations for responsive scaling
  const a = Math.min(w, h) * 0.4;  // Semi-major axis
  const b = Math.min(w, h) * 0.12; // Semi-minor axis (defines the radius of the central ring!)

  // Rotate the whole system extremely slowly
  const systemRotation = performance.now() * 0.0001;

  // Explicit background orbits removed. 
  // The spirograph illusion will be drawn entirely by the motion blur of the fast particles!

  trailCtx.globalCompositeOperation = 'lighter';
  ctx.globalCompositeOperation = 'lighter';

  particles.forEach((p, idx) => {
    // Update particle position on the ellipse
    p.phase += p.speed;

    // First, position on the standard unrotated ellipse
    const x_ellipse = Math.cos(p.phase) * a;
    const y_ellipse = Math.sin(p.phase) * b;

    // Rotate the orbit itself slowly to sweep out the central ring envelope
    p.orbitAngle += 0.006; 
    const totalRotation = p.orbitAngle;
    const cosR = Math.cos(totalRotation);
    const sinR = Math.sin(totalRotation);

    const x = cx + x_ellipse * cosR - y_ellipse * sinR;
    const y = cy + x_ellipse * sinR + y_ellipse * cosR;

    if (p.lastX !== undefined) {
      // 3D Depth calculation for the particle
      const zFactor = Math.sin(p.phase);
      const trailWidth = 4 + zFactor * 2.5; 
      const dotRadius = 3 + zFactor * 1.5;  
      const alpha = 0.7 + zFactor * 0.3;    
      
      // 1. Draw the smooth trail segment to the fading offscreen canvas
      trailCtx.beginPath();
      trailCtx.moveTo(p.lastX, p.lastY);
      trailCtx.lineTo(x, y);
      
      trailCtx.strokeStyle = `hsla(210, 70%, 60%, ${alpha * 0.5})`; 
      trailCtx.lineWidth = trailWidth; 
      trailCtx.shadowBlur = 15;
      trailCtx.shadowColor = `hsla(210, 70%, 55%, ${alpha * 0.6})`;
      trailCtx.lineCap = 'round';
      trailCtx.stroke();
      
      // 2. Draw the solid bright core ONLY to the main canvas (so it doesn't leave ghost dots)
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2); 
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    p.lastX = x;
    p.lastY = y;
  });

  // Revert composite operations for the next frame's clear
  trailCtx.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'source-over';
  
  // --- Draw Nucleus ---
  ctx.globalCompositeOperation = 'lighter';
  // Slower, gentler pulse
  const pulse = Math.sin(systemRotation * 8) * 0.08 + 0.92;
  const nucleusRadius = b * 0.25;

  for (let n = 0; n < 3; n++) {
    const nAngle = systemRotation * 10 + (Math.PI * 2 / 3) * n;
    const nx = cx + Math.cos(nAngle) * nucleusRadius * 0.6 * pulse;
    const ny = cy + Math.sin(nAngle) * nucleusRadius * 0.6 * pulse;

    ctx.beginPath();
    ctx.arc(nx, ny, nucleusRadius * pulse, 0, Math.PI * 2);
    
    ctx.fillStyle = `hsla(210, 80%, 65%, 0.8)`;
    ctx.shadowBlur = 30;
    ctx.shadowColor = `hsla(210, 80%, 55%, 0.9)`;
    ctx.fill();

    // Intense white center
    ctx.beginPath();
    ctx.arc(nx, ny, nucleusRadius * pulse * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fff';
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over';
  // Reset shadow for the dark fade box on next frame
  ctx.shadowBlur = 0;

  requestAnimationFrame(draw);
}

// Ensure first frame has no lines drawn from (0,0)
requestAnimationFrame(draw);
