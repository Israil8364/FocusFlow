import React, { useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const StatChip = ({ label, value, subLabel, icon: Icon, color }) => {
  const valueRef = useRef(null);
  
  // Extract number for animation if possible
  const isNumeric = typeof value === 'string' && /^\d+/.test(value);
  const numericPart = isNumeric ? parseInt(value.match(/^\d+/)[0], 10) : (typeof value === 'number' ? value : 0);
  const suffix = isNumeric ? value.replace(/^\d+/, '') : (typeof value === 'number' ? '' : '');

  useGSAP(() => {
    if (isNumeric || typeof value === 'number') {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: numericPart,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          if (valueRef.current) {
            const currentVal = Math.round(obj.val);
            valueRef.current.innerText = currentVal + suffix;
          }
        }
      });
    }
  }, [value]);

  return (
    <div className="p-5 md:p-6 bg-[var(--card)] rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)] flex flex-col w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-neu active:scale-[0.98]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${color || 'bg-[var(--bg)] text-[var(--text-primary)]'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <span ref={valueRef} className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {value}
        </span>
        {subLabel && (
          <span className="text-xs font-medium text-[var(--text-muted)] mt-2 flex items-center gap-1.5">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatChip;
