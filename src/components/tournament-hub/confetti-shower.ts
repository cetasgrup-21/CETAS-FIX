/**
 * Zero-dependency HTML5 Canvas Confetti Engine
 * Specially engineered for CETAS Next-Gen Tournament Hub
 */

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  life: number;
  maxLife: number;
}

const CELEBRATION_COLORS = [
  "#10B981", // Emerald
  "#06B6D4", // Electric Cyan
  "#F59E0B", // Gold Amber
  "#6366F1", // Royal Indigo
  "#EC4899", // Neon Pink
  "#FBBF24", // Yellow Gold
  "#3B82F6", // Blue
  "#FFFFFF", // Pure White Sparkle
];

export function launchConfettiShower(durationMs = 3500) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.id = "cetas-confetti-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const onResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", onResize);

  const particles: Particle[] = [];
  const particleCount = 120;

  // Launch initial burst from left and right corners
  for (let i = 0; i < particleCount; i++) {
    const isLeft = i % 2 === 0;
    particles.push({
      x: isLeft ? width * 0.15 + (Math.random() * 40 - 20) : width * 0.85 + (Math.random() * 40 - 20),
      y: height * 0.85,
      w: Math.random() * 8 + 6,
      h: Math.random() * 14 + 8,
      dx: isLeft ? Math.random() * 12 + 4 : -(Math.random() * 12 + 4),
      dy: -(Math.random() * 18 + 14),
      color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 80 + 120,
    });
  }

  const startTime = Date.now();
  let animationFrameId: number;

  const render = () => {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    let activeCount = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life++;

      if (p.life < p.maxLife) {
        activeCount++;
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.45; // gravity
        p.dx *= 0.985; // air resistance
        p.rotation += p.rotationSpeed;

        if (p.life > p.maxLife * 0.7) {
          p.opacity = Math.max(0, 1 - (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    if (elapsed < durationMs && activeCount > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  };

  animationFrameId = requestAnimationFrame(render);
}
