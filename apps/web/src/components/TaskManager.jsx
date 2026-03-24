import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import TaskFormModal from './TaskFormModal';

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

const TaskManager = ({ 
  tasks, 
  activeTaskId, 
  onAddTask, 
  onDeleteTask, 
  onToggleComplete, 
  onSelectTask,
  onUpdateTask,
  loading 
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPomodoros, setNewTaskPomodoros] = useState('1');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const pomodoros = parseInt(newTaskPomodoros) || 1;
    if (pomodoros < 1 || pomodoros > 20) {
      toast.error('Estimated pomodoros must be between 1 and 20');
      return;
    }

    setIsAdding(true);
    try {
      await onAddTask(newTaskTitle.trim(), pomodoros);
      setNewTaskTitle('');
      setNewTaskPomodoros('1');
      toast.success('Task added');
    } catch (err) {
      toast.error('Failed to add task');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updates) => {
    if (editingTask && onUpdateTask) {
      await onUpdateTask(editingTask.id, updates);
      setIsEditModalOpen(false);
      setEditingTask(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-section-title mb-6">Today's Tasks</h2>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-card shadow-neumorphic rounded-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-section-title mb-6">Today's Tasks</h2>
      
      <div className="space-y-4 mb-8">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-body">
            No tasks yet. Add one below to get started.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className={`group flex items-center justify-between p-4 md:p-5 rounded-16 bg-card shadow-neumorphic hover:shadow-floating transition-all duration-250 cursor-pointer ${
                activeTaskId === task.id ? 'ring-2 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Checkbox
                  checked={task.isCompleted}
                  onCheckedChange={() => onToggleComplete(task.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full w-5 h-5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-250"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {task.category && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[task.category] || COLORS.red }}
                        title={task.category}
                      />
                    )}
                    <span className={`text-card-title truncate transition-all duration-250 ${
                      task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}>
                      {task.title}
                    </span>
                  </div>
                  {task.note && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {task.note}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-4">
                <div className="text-body text-muted-foreground font-medium whitespace-nowrap">
                  {task.completedPomodoros || 0} / {task.estimatedPomodoros}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTask(task);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all duration-250"
                  title="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all duration-250"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddTask} className="flex gap-3">
        <input
          type="text"
          placeholder="What are you working on?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 h-12 px-5 rounded-pill bg-card shadow-neumorphic-pressed outline-none focus:ring-2 ring-primary/20 text-body transition-all duration-250"
          disabled={isAdding}
        />
        <input
          type="number"
          min="1"
          max="20"
          value={newTaskPomodoros}
          onChange={(e) => setNewTaskPomodoros(e.target.value)}
          className="w-20 h-12 px-4 text-center rounded-pill bg-card shadow-neumorphic-pressed outline-none focus:ring-2 ring-primary/20 text-body transition-all duration-250"
          placeholder="Est"
          disabled={isAdding}
        />
        <button 
          type="submit" 
          className="h-12 px-6 rounded-20 bg-card shadow-neumorphic hover:shadow-floating transition-all duration-250 text-foreground font-medium flex items-center gap-2 active:scale-95"
          disabled={isAdding}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </form>

      <TaskFormModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveEdit}
        task={editingTask}
        isEditing={true}
      />
    </div>
  );
};

export default TaskManager;
