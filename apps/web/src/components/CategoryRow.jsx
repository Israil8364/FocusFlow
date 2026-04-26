
import React, { useState, useRef } from 'react';
import { Check, Trash2, Edit2 } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import { toast } from 'sonner';
import TaskFormModal from './TaskFormModal';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const COLORS = {
  red: '#e8372a',
  orange: '#f07832',
  green: '#3aaa6e',
  blue: '#3a7bd5',
  violet: '#8b5cf6',
  sage: '#3aaa6e',
  cobalt: '#3a7bd5',
  amber: '#f07832',
  tomato: '#e8372a',
};

const CategoryRow = ({ task, onToggle, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const colorValue = COLORS[task.category] || COLORS.sage;

  const handleEditSave = async (updates) => {
    try {
      const dbUpdates = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.note !== undefined) dbUpdates.note = updates.note;
      if (updates.estimatedPomodoros !== undefined) dbUpdates.estimated_pomodoros = updates.estimatedPomodoros;
      if (updates.category !== undefined) dbUpdates.category = updates.category;

      const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', task.id);
      if (error) throw error;
      
      toast.success('Task updated');
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update task');
      console.error(error);
    }
  };

  const rowRef = useRef(null);

  useGSAP(() => {
    // Initial state handled by CSS opacity-0, but we can enhance it
  }, { scope: rowRef });

  const onEnter = () => {
    gsap.to(".gsap-action", {
      opacity: 1,
      x: 0,
      stagger: 0.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const onLeave = () => {
    gsap.to(".gsap-action", {
      opacity: 0,
      x: 5,
      stagger: 0.05,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  return (
    <>
      <div 
        ref={rowRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="group relative flex items-center justify-between p-4 md:p-5 bg-[var(--card)] rounded-[var(--radius-md)] shadow-level-1 hover:shadow-level-2 transition-all duration-200 hover:scale-[1.01] overflow-hidden border border-[var(--border)]"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: colorValue }}></div>

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => onToggle(task.id)}
            className={`w-5 h-5 rounded-[var(--radius-circle)] border-2 flex items-center justify-center transition-colors duration-200 shrink-0 ${
              task.isCompleted 
                ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' 
                : 'border-[var(--border)] hover:border-[var(--text-muted)]'
            }`}
          >
            {task.isCompleted && <Check className="w-3 h-3 text-[var(--card)]" />}
          </button>
          <div className="flex-1 min-w-0">
            <span className={`text-body font-medium truncate transition-colors duration-200 block ${
              task.isCompleted ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'
            }`}>
              {task.title}
            </span>
            {task.note && (
              <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                {task.note}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4 pr-3">
          <span className="text-caption font-medium text-[var(--text-secondary)] whitespace-nowrap bg-[var(--bg)] px-2.5 py-1 rounded-[var(--radius-sm)]">
            {task.completedPomodoros || 0} / {task.estimatedPomodoros}
          </span>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="gsap-action opacity-0 transform translate-x-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200 p-1"
            aria-label="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="gsap-action opacity-0 transform translate-x-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all duration-200 p-1"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <TaskFormModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        task={task}
        isEditing={true}
      />
    </>
  );
};

export default CategoryRow;
