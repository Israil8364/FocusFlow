import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Plus, ChevronRight, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Color dots mapped to valid 'category' values in Supabase
const CATEGORIES = [
  { id: 'tomato', hex: '#e8372a', label: 'Tomato' },
  { id: 'sage',   hex: '#3aaa6e', label: 'Sage'   },
  { id: 'cobalt', hex: '#3a7bd5', label: 'Cobalt' },
  { id: 'amber',  hex: '#f07832', label: 'Amber'  },
  { id: 'violet', hex: '#8b5cf6', label: 'Violet' },
];

const PROJECTS = [
  { id: 'work',     label: 'Work',     color: '#3a7bd5', tasks: 12 },
  { id: 'personal', label: 'Personal', color: '#3aaa6e', tasks: 5  },
];

const AddTaskModal = ({ open, onClose, onAdd, isPremium = false }) => {
  const navigate = useNavigate();
  const [taskText, setTaskText]               = useState('');
  const [note, setNote]                       = useState('');
  const [activeCategory, setActiveCategory]   = useState('tomato');
  const [estimatedPomodoros, setEstimated]    = useState(1);
  const [activeProject, setActiveProject]     = useState('work');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [saving, setSaving]                   = useState(false);
  const taskInputRef = useRef(null);
  const overlayRef   = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => taskInputRef.current?.focus(), 120);
      setTaskText('');
      setNote('');
      setActiveCategory('tomato');
      setEstimated(1);
      setShowProjectPicker(false);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const selectedProject = PROJECTS.find(p => p.id === activeProject);

  const handleSubmit = async () => {
    if (!taskText.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        title: taskText.trim(),
        note,
        estimatedPomodoros,
        category: activeCategory,
        projectId: isPremium ? activeProject : null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const bump = (delta) => setEstimated(v => Math.min(20, Math.max(1, v + delta)));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md bg-[var(--card)] sm:rounded-[var(--radius-lg)] rounded-t-[var(--radius-lg)] border border-[var(--border)] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-[var(--border)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[17px] text-[var(--text-primary)]">Add task</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">

          {/* Premium: active project pill */}
          {isPremium && (
            <button
              onClick={() => setShowProjectPicker(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--text-muted)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedProject?.color }} />
                <span className="text-sm font-medium text-[var(--text-primary)]">{selectedProject?.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showProjectPicker ? 'rotate-90' : ''}`} />
            </button>
          )}

          {/* Task title */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] overflow-hidden focus-within:border-[var(--text-muted)] transition-colors">
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] px-4 pt-3 pb-1 uppercase">Task</p>
            <input
              ref={taskInputRef}
              type="text"
              placeholder="What are you working on?"
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              className="w-full bg-transparent px-4 pb-3 text-[var(--text-primary)] text-sm font-medium outline-none placeholder:text-[var(--text-muted)]"
            />
            {/* Category color dots */}
            <div className="flex items-center gap-2.5 px-4 pb-3">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => setActiveCategory(c.id)}
                  className="w-5 h-5 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    transform: activeCategory === c.id ? 'scale(1.3)' : undefined,
                    outline: activeCategory === c.id ? `2px solid ${c.hex}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] overflow-hidden focus-within:border-[var(--text-muted)] transition-colors">
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] px-4 pt-3 pb-1 uppercase">Note</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="Add a note..."
              className="w-full bg-transparent px-4 text-[var(--text-primary)] text-sm resize-none outline-none leading-relaxed placeholder:text-[var(--text-muted)]"
            />
            <p className="text-right text-[11px] text-[var(--text-muted)] px-4 pb-2">
              {note.length} / 200
            </p>
          </div>

          {/* Estimated Pomodoros stepper */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Estimated pomodoros</p>
              <p className="text-xs text-[var(--text-muted)]">How many sessions will this take?</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => bump(-1)}
                disabled={estimatedPomodoros <= 1}
                className="w-7 h-7 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--text-muted)] hover:text-[var(--bg)] transition-colors disabled:opacity-30"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center font-semibold text-[var(--text-primary)]">{estimatedPomodoros}</span>
              <button
                type="button"
                onClick={() => bump(1)}
                disabled={estimatedPomodoros >= 20}
                className="w-7 h-7 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--text-muted)] hover:text-[var(--bg)] transition-colors disabled:opacity-30"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Project section */}
          {!isPremium ? (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Add to project</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Unlock with Premium</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { onClose(); navigate('/upgrade'); }}
                className="px-4 py-1.5 rounded-[var(--radius-pill)] bg-[var(--text-primary)] text-[var(--bg)] text-xs font-semibold transition-all hover:opacity-80 active:scale-95 flex-shrink-0"
              >
                Upgrade
              </button>
            </div>
          ) : showProjectPicker ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] overflow-hidden">
              <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] px-4 pt-3 pb-2 uppercase">Project</p>
              {PROJECTS.map((project, idx) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => { setActiveProject(project.id); setShowProjectPicker(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[var(--border)] ${
                    idx < PROJECTS.length - 1 ? 'border-b border-[var(--border)]' : ''
                  } ${activeProject === project.id ? 'bg-[var(--border)]' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="font-medium text-[var(--text-primary)]">{project.label}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{project.tasks} tasks</span>
                </button>
              ))}
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-muted)] border-t border-dashed border-[var(--border)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New project
              </button>
            </div>
          ) : null}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!taskText.trim() || saving}
            className="w-full h-[50px] rounded-[var(--radius-pill)] bg-[var(--text-primary)] text-[var(--bg)] font-semibold text-[15px] shadow-neu hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {saving ? 'Adding...' : 'Add task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
