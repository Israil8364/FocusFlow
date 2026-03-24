
import React from 'react';

const StatChip = ({ label, value, subLabel }) => {
  return (
    <div className="p-5 md:p-6 bg-[var(--card)] rounded-[var(--radius-md)] shadow-level-1 border border-[var(--border)] flex flex-col w-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-level-2">
      <span className="text-eyebrow text-[var(--text-muted)] mb-3">{label}</span>
      <span className="text-stat text-[var(--text-primary)]">{value}</span>
      {subLabel && <span className="text-caption text-[var(--text-secondary)] mt-2">{subLabel}</span>}
    </div>
  );
};

export default StatChip;
