
import React, { useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const StatChip = ({ label, value, subLabel }) => {
  const valueRef = useRef(null);
  const isNumeric = /^\d+/.test(value);
  const numericPart = isNumeric ? parseInt(value.match(/^\d+/)[0], 10) : 0;
  const suffix = isNumeric ? value.replace(/^\d+/, '') : value;

  useGSAP(() => {
    if (isNumeric) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: numericPart,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          if (valueRef.current) {
            valueRef.current.innerText = Math.round(obj.val) + suffix;
          }
        }
      });
    }
  }, [value]);

  return (
    <div className="p-5 md:p-6 bg-[var(--card)] rounded-[var(--radius-md)] shadow-level-1 border border-[var(--border)] flex flex-col w-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-level-2">
      <span className="text-eyebrow text-[var(--text-muted)] mb-3">{label}</span>
      <span ref={valueRef} className="text-stat text-[var(--text-primary)]">{value}</span>
      {subLabel && <span className="text-caption text-[var(--text-secondary)] mt-2">{subLabel}</span>}
    </div>
  );
};

export default StatChip;
