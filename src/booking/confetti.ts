/**
 * A small canvas confetti: pops from the left and right edges of the screen, twice. No library, and nothing at all
 * for people who ask their device for less motion.
 */
const COLORS = ["#B5F21A", "#E4FF3B", "#8FE33A", "#FFFFFF", "#7000FF", "#FF7AD9"];

type Piece = { x: number; y: number; vx: number; vy: number; size: number; rot: number; vr: number; color: string; round: boolean; life: number };

function burst(from: "left" | "right", w: number, h: number): Piece[] {
  const fromLeft = from === "left";
  return Array.from({ length: 70 }, () => {
    // Up and across the screen: 55 to 80 degrees above the edge it starts from.
    const angle = ((55 + Math.random() * 25) * Math.PI) / 180;
    const speed = (Math.min(w, 900) / 38) * (0.6 + Math.random() * 0.7) + 8;
    return {
      x: fromLeft ? -6 : w + 6,
      y: h * (0.62 + Math.random() * 0.12),
      vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
      vy: -Math.sin(angle) * speed,
      size: 6 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      round: Math.random() < 0.3,
      life: 0,
    };
  });
}

export function popConfetti(): () => void {
  if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10001";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return () => {}; }
  ctx.scale(dpr, dpr);

  let pieces: Piece[] = [];
  let raf = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];
  let last = performance.now();
  let pops = 0;

  const pop = () => { pieces = pieces.concat(burst("left", w, h), burst("right", w, h)); pops += 1; };
  timers.push(setTimeout(pop, 250), setTimeout(pop, 1300));

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 16.67, 2.5);
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (const p of pieces) {
      p.life += dt;
      p.vy += 0.34 * dt;
      p.vx *= 0.992;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const fade = Math.max(0, Math.min(1, (170 - p.life) / 50));
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    pieces = pieces.filter((p) => p.life < 170 && p.y < h + 40);
    if (pops < 2 || pieces.length) raf = requestAnimationFrame(frame);
    else canvas.remove();
  };
  raf = requestAnimationFrame(frame);

  return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); canvas.remove(); };
}
