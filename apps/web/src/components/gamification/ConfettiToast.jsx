import React, { useEffect, useRef } from 'react';
import { useGamification } from '@/contexts/GamificationContext.jsx';
import LottieAnimation from '@/components/ui/LottieAnimation.jsx';

/* Renders a self-contained confetti burst + achievement toast.
   Attach once globally inside a provider-aware component. */
export default function ConfettiToast() {
  const { confettiTrigger, clearConfetti } = useGamification();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!confettiTrigger) return;

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
    }, 5000); // slightly longer to enjoy animation

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
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl"
          style={{
            background: 'rgba(15,10,30,0.95)',
            border: '1px solid rgba(139,92,246,0.5)',
            backdropFilter: 'blur(20px)',
            animation: 'toastIn 0.5s cubic-bezier(.34,1.56,.64,1)',
            boxShadow: '0 0 50px rgba(139,92,246,0.4)',
            minWidth: '320px'
          }}
        >
          {confettiTrigger.lottie ? (
            <div className="w-16 h-16 shrink-0">
              <LottieAnimation src={confettiTrigger.lottie} loop={true} />
            </div>
          ) : (
            <span className="text-4xl shrink-0">{confettiTrigger.emoji}</span>
          )}
          
          <div className="flex-1">
            <p className="text-[10px] text-purple-400 uppercase tracking-[0.2em] font-black mb-1">Achievement Unlocked</p>
            <p className="text-lg font-black text-white leading-tight">{confettiTrigger.title}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -40px) scale(0.9); }
          to   { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
    </>
  );
}
