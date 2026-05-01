import React, { useEffect, useRef } from 'react';
import { useGamification } from '@/contexts/GamificationContext.jsx';

/* Renders a self-contained confetti burst + achievement toast.
   Attach once globally inside a provider-aware component. */
export default function ConfettiToast() {
  const { confettiTrigger, clearConfetti } = useGamification();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (!confettiTrigger) return;
    visibleRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const COLORS = ['#8b5cf6', '#a78bfa', '#fbbf24', '#34d399', '#f472b6', '#60a5fa'];
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * -4 - 2,
      size: Math.random() * 7 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allGone = true;
      particlesRef.current.forEach(p => {
        p.vy += 0.12; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, p.opacity - 0.012);
        if (p.opacity > 0) allGone = false;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      });
      if (!allGone) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    const timer = setTimeout(() => {
      clearConfetti();
    }, 4000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
    };
  }, [confettiTrigger, clearConfetti]);

  return (
    <>
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{ opacity: confettiTrigger ? 1 : 0 }}
      />

      {/* Achievement toast */}
      {confettiTrigger && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(15,10,30,0.95)',
            border: '1px solid rgba(139,92,246,0.5)',
            backdropFilter: 'blur(16px)',
            animation: 'toastIn 0.4s cubic-bezier(.34,1.56,.64,1)',
            boxShadow: '0 0 40px rgba(139,92,246,0.3)',
          }}
        >
          <span className="text-3xl">{confettiTrigger.emoji}</span>
          <div>
            <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold">Achievement Unlocked</p>
            <p className="text-sm font-bold text-white">{confettiTrigger.title}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -24px) scale(0.85); }
          to   { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
    </>
  );
}
