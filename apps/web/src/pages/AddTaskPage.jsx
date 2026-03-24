import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Lock, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTaskManager } from '@/hooks/useTaskManager.js';
import { toast } from 'sonner';

const COLORS = [
  { id: 'red',    hex: '#e8372a' },
  { id: 'orange', hex: '#f07832' },
  { id: 'green',  hex: '#3aaa6e' },
  { id: 'blue',   hex: '#3a7bd5' },
  { id: 'violet', hex: '#8b5cf6' },
];

const PROJECTS = [
  { id: 'work',     label: 'Work',     color: '#3a7bd5', tasks: 12 },
  { id: 'personal', label: 'Personal', color: '#3aaa6e', tasks: 5  },
];

const MAX_NOTE = 200;

const AddTaskPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addTask } = useTaskManager(currentUser?.id);
  const [isPremium, setIsPremium] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [note, setNote] = useState('');
  const [activeColor, setActiveColor] = useState('red');
  const [activeProject, setActiveProject] = useState('work');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProject = PROJECTS.find(p => p.id === activeProject);

  const handleAddTask = async () => {
    if (!taskText.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTask(taskText.trim(), 1, {
        category: activeColor,
        note: note.trim()
      });
      toast.success('Task added successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to add task');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Task — FocusFlow</title>
      </Helmet>

      <div className="max-w-lg mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        {/* Free / Premium toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex p-1 gap-1 rounded-[var(--radius-pill)] bg-[var(--card)] border border-[var(--border)] shadow-neu-sm">
            {['Free', 'Premium'].map(tab => (
              <button
                key={tab}
                onClick={() => setIsPremium(tab === 'Premium')}
                className={`px-5 py-1.5 rounded-[var(--radius-pill)] text-sm font-medium transition-all duration-200 ${
                  (tab === 'Premium') === isPremium
                    ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Screen card */}
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-neu overflow-hidden">
          {/* Page header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="font-semibold text-[17px] text-[var(--text-primary)]">Add task</h1>
            <div className="w-16" />
          </div>

          <div className="p-5 space-y-3">
            {/* Premium: active project pill */}
            {isPremium && (
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] transition-colors hover:border-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedProject?.color }} />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{selectedProject?.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            )}

            {/* Task field */}
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] overflow-hidden">
              <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] px-4 pt-3 pb-1 uppercase">Task</p>
              <textarea
                value={taskText}
                onChange={e => setTaskText(e.target.value)}
                rows={2}
                className="w-full bg-transparent px-4 pb-3 text-[var(--text-primary)] text-sm font-medium resize-none outline-none leading-relaxed"
              />
              {/* Color dots */}
              <div className="flex items-center gap-2 px-4 pb-3">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveColor(c.id)}
                    className={`w-5 h-5 rounded-full transition-transform ${activeColor === c.id ? 'scale-125 ring-2 ring-offset-2 ring-offset-[var(--bg)]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c.hex, ringColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Note field */}
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] overflow-hidden">
              <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] px-4 pt-3 pb-1 uppercase">Note</p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value.slice(0, MAX_NOTE))}
                rows={3}
                className="w-full bg-transparent px-4 text-[var(--text-primary)] text-sm resize-none outline-none leading-relaxed"
              />
              <p className="text-right text-[11px] text-[var(--text-muted)] px-4 pb-3">
                {note.length} / {MAX_NOTE}
              </p>
            </div>

            {/* Free: locked project row | Premium: project picker */}
            {!isPremium ? (
              <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Add to project</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Unlock with Premium</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPremium(true)}
                  className="px-4 py-1.5 rounded-[var(--radius-pill)] bg-[var(--text-primary)] text-[var(--bg)] text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                >
                  Upgrade
                </button>
              </div>
            ) : (
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] overflow-hidden">
                <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] px-4 pt-3 pb-2 uppercase">Project</p>
                {PROJECTS.map((project, idx) => (
                  <button
                    key={project.id}
                    onClick={() => setActiveProject(project.id)}
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
                <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-muted)] border-t border-dashed border-[var(--border)] hover:text-[var(--text-primary)] transition-colors">
                  <Plus className="w-4 h-4" />
                  New project
                </button>
              </div>
            )}

            {/* Add task CTA */}
            <button 
              onClick={handleAddTask}
              disabled={isSubmitting}
              className="w-full h-[50px] rounded-[var(--radius-pill)] bg-[var(--text-primary)] text-[var(--bg)] font-semibold text-[15px] shadow-neu hover:-translate-y-0.5 transition-all active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add task'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTaskPage;
