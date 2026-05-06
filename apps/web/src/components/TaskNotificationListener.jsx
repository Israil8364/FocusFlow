
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, Zap, Clock } from 'lucide-react';

const TaskNotificationListener = () => {
  useEffect(() => {
    const handleNotification = (e) => {
      const { task, timeStr, msg } = e.detail;

      toast.custom((t) => (
        <div className="bg-[var(--card)] border-2 border-[var(--text-primary)] rounded-[20px] p-4 shadow-neu-lg flex gap-3 items-center min-w-[320px] animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 rounded-xl bg-[var(--text-primary)] flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-[var(--accent)]" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-tighter bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-md">
                Lock In
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)]">@{timeStr}</span>
            </div>
            <h4 className="text-[14px] font-bold text-[var(--text-primary)] leading-tight">
              {task.title}
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium italic">
              {msg.body(task, timeStr)}
            </p>
          </div>

          <button 
            onClick={() => toast.dismiss(t)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      ), {
        duration: 10000,
        position: 'top-center'
      });
    };

    window.addEventListener('taskNotificationDue', handleNotification);
    return () => window.removeEventListener('taskNotificationDue', handleNotification);
  }, []);

  return null;
};

export default TaskNotificationListener;
