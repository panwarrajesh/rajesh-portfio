import React, { useEffect, useRef, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";

/**
 * Design notes
 * -------------------------------------------------------------
 * Subject: personal hero for a full-stack developer, Rajesh Panwar.
 * The particle canvas is the one bold move — everything else stays
 * quiet so it doesn't compete: no cards, no gradients, one accent.
 *
 * Palette
 *   --bg      #0E0C0A  warm near-black (not flat #000/#111)
 *   --ink     #F3EFE6  warm off-white for the headline
 *   --muted   #9C948A  secondary text
 *   --accent  #FF6A2F  the particle / underline color, carried
 *             over from the original mark so brand stays consistent
 *
 * Type
 *   Fraunces (serif, display) for the name — has real personality,
 *   avoids the generic Georgia/Times default.
 *   JetBrains Mono for the role line and social labels — a small
 *   nod to "developer" without shouting it.
 *
 * Layout: single centered column. The canvas materializes on load
 * (dots drift in from scatter), then responds to the pointer. That's
 * the one animated moment; hovers on the links are the only other motion.
 */

const PARTICLE_TEXT = "Rajesh";
const ACCENT = "#FF6A2F";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function ParticleName() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Internal drawing resolution — fixed, independent of display size.
    const W = 1000;
    const H = 300;
    canvas.width = W;
    canvas.height = H;

    const dots = [];
    const mouse = { x: -9999, y: -9999, active: false };

    // ---- Build the text mask ----
    const shapeCanvas = document.createElement("canvas");
    shapeCanvas.width = W;
    shapeCanvas.height = H;
    const shapeCtx = shapeCanvas.getContext("2d");

    let fontSize = 260;
    shapeCtx.font = `900 ${fontSize}px Georgia, "Times New Roman", serif`;
    const maxWidth = W - 90;
    const measured = shapeCtx.measureText(PARTICLE_TEXT).width;
    if (measured > 0) {
      fontSize = Math.min(fontSize * (maxWidth / measured), H * 0.82);
    }

    shapeCtx.fillStyle = "#fff";
    shapeCtx.font = `900 ${fontSize}px Georgia, "Times New Roman", serif`;
    shapeCtx.textAlign = "center";
    shapeCtx.textBaseline = "middle";
    shapeCtx.fillText(PARTICLE_TEXT, W / 2, H / 2 + fontSize * 0.03);

    const pixels = shapeCtx.getImageData(0, 0, W, H).data;

    const spacing = 6.5;
    for (let y = 4; y < H - 4; y += spacing) {
      for (let x = 4; x < W - 4; x += spacing) {
        const idx = (Math.round(y) * W + Math.round(x)) * 4;
        if (pixels[idx + 3] > 120) {
          const startScatter = reducedMotion;
          dots.push({
            x,
            y,
            px: startScatter ? x : Math.random() * W,
            py: startScatter ? y : Math.random() * H,
            vx: 0,
            vy: 0,
            size: 1.5 + Math.random() * 0.6,
          });
        }
      }
    }

    // ---- Pointer tracking ----
    const toLocal = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * W,
        y: ((clientY - rect.top) / rect.height) * H,
      };
    };

    const handleMove = (e) => {
      const p = toLocal(e.clientX, e.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.active = true;
    };
    const handleLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const handleTouch = (e) => {
      if (!e.touches[0]) return;
      const p = toLocal(e.touches[0].clientX, e.touches[0].clientY);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.active = true;
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    canvas.addEventListener("touchmove", handleTouch, { passive: true });
    canvas.addEventListener("touchend", handleLeave);

    let raf;
    const radius = 55;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const dot of dots) {
        if (mouse.active) {
          const dx = dot.px - mouse.x;
          const dy = dot.py - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius) {
            const force = (radius - dist) / radius;
            const angle = Math.atan2(dy, dx);
            dot.vx += Math.cos(angle) * force * 5.5;
            dot.vy += Math.sin(angle) * force * 5.5;
          }
        }

        dot.vx += (dot.x - dot.px) * 0.06;
        dot.vy += (dot.y - dot.py) * 0.06;
        dot.vx *= 0.84;
        dot.vy *= 0.84;
        dot.px += dot.vx;
        dot.py += dot.vy;

        ctx.beginPath();
        ctx.arc(dot.px, dot.py, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = ACCENT;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    if (reducedMotion) {
      // Render once, statically, no animation loop.
      ctx.clearRect(0, 0, W, H);
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = ACCENT;
        ctx.fill();
      }
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      canvas.removeEventListener("touchmove", handleTouch);
      canvas.removeEventListener("touchend", handleLeave);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full max-w-[640px] aspect-[1000/300]"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block select-none"
        aria-hidden="true"
      />
    </div>
  );
}

export default function RajeshHero() {
  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 py-16"
      style={{ background: "#0E0C0A" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        .rj-serif { font-family: 'Fraunces', Georgia, serif; }
        .rj-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .rj-link {
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .rj-link:focus-visible {
          outline: 2px solid ${ACCENT};
          outline-offset: 4px;
          border-radius: 4px;
        }
      `}</style>

      <ParticleName />

      <div className="text-center -mt-2 flex flex-col items-center">
        <h1
          className="rj-serif text-[2.75rem] sm:text-6xl md:text-7xl font-semibold tracking-tight"
          style={{ color: "#F3EFE6" }}
        >
          Rajesh Panwar
        </h1>

        <div
          className="mt-5 h-px w-16"
          style={{ background: ACCENT }}
        />

        <p
          className="rj-mono mt-5 text-[13px] sm:text-sm tracking-wide"
          style={{ color: "#9C948A" }}
        >
          full-stack developer
        </p>

        <p
          className="rj-serif mt-6 max-w-[36ch] text-base sm:text-lg leading-relaxed"
          style={{ color: "#C7C0B5" }}
        >
          I build web products end to end — from database to interface —
          with an eye for detail on both sides.
        </p>

        <nav
          className="rj-mono mt-9 flex items-center gap-7 text-[13px]"
          aria-label="Social links"
        >
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="rj-link flex items-center gap-2"
            style={{ color: "#C7C0B5" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F3EFE6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#C7C0B5")}
          >
            <Github size={15} strokeWidth={1.75} />
            GitHub
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noreferrer"
            className="rj-link flex items-center gap-2"
            style={{ color: "#C7C0B5" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F3EFE6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#C7C0B5")}
          >
            <Linkedin size={15} strokeWidth={1.75} />
            LinkedIn
          </a>
          <a
            href="mailto:hello@rajeshpanwar.dev"
            className="rj-link flex items-center gap-2"
            style={{ color: "#C7C0B5" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F3EFE6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#C7C0B5")}
          >
            <Mail size={15} strokeWidth={1.75} />
            Email
          </a>
        </nav>
      </div>
    </section>
  );
}