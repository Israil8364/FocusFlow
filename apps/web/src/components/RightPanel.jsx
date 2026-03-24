
import React from 'react';

const RightPanel = () => {
  return (
    <aside className="hidden xl:block w-[280px] bg-[var(--card)] border-l border-[var(--border)] sticky top-[56px] h-[calc(100vh-56px)] z-20 p-6 overflow-y-auto">
      <div className="space-y-10">
        
        <section>
          <h3 className="text-eyebrow text-[var(--text-muted)] mb-4">Today's Goal</h3>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-stat text-[var(--text-primary)]">75</span>
            <span className="text-body text-[var(--text-secondary)] mb-1 font-medium">%</span>
          </div>
          <div className="h-2.5 bg-[var(--bg)] rounded-[var(--radius-pill)] overflow-hidden shadow-inner">
            <div className="h-full bg-[var(--accent)] rounded-[var(--radius-pill)] w-[75%] transition-all duration-1000 ease-out"></div>
          </div>
        </section>

        <section>
          <h3 className="text-eyebrow text-[var(--text-muted)] mb-4">Upcoming Breaks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3.5 bg-[var(--bg)] rounded-[var(--radius-md)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--sage)]"></div>
                <span className="text-body font-medium text-[var(--text-primary)]">Short Break</span>
              </div>
              <span className="text-caption text-[var(--text-secondary)]">10:25 AM</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-[var(--bg)] rounded-[var(--radius-md)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--cobalt)]"></div>
                <span className="text-body font-medium text-[var(--text-primary)]">Long Break</span>
              </div>
              <span className="text-caption text-[var(--text-secondary)]">11:30 AM</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-eyebrow text-[var(--text-muted)] mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="p-5 bg-[var(--bg)] rounded-[var(--radius-md)] shadow-level-1 border border-[var(--border)]">
              <div className="text-eyebrow text-[var(--text-muted)] mb-1">Pomodoros Today</div>
              <div className="text-stat text-[var(--text-primary)]">6</div>
            </div>
            <div className="p-5 bg-[var(--bg)] rounded-[var(--radius-md)] shadow-level-1 border border-[var(--border)]">
              <div className="text-eyebrow text-[var(--text-muted)] mb-1">Focus Time</div>
              <div className="text-stat text-[var(--text-primary)]">2.5<span className="text-body text-[var(--text-secondary)] ml-1 font-medium">hrs</span></div>
            </div>
            <div className="p-5 bg-[var(--bg)] rounded-[var(--radius-md)] shadow-level-1 border border-[var(--border)]">
              <div className="text-eyebrow text-[var(--text-muted)] mb-1">Longest Session</div>
              <div className="text-stat text-[var(--text-primary)]">45<span className="text-body text-[var(--text-secondary)] ml-1 font-medium">min</span></div>
            </div>
          </div>
        </section>

      </div>
    </aside>
  );
};

export default RightPanel;
