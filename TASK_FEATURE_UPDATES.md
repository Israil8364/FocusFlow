# Task Management Feature Updates

## Overview
Enhanced the task management system to display task status colors and notes when adding/editing tasks, with full edit functionality using a unified modal UI.

## Changes Made

### 1. **TaskFormModal Component** (`apps/web/src/components/TaskFormModal.jsx`) - NEW
- Reusable modal component for both adding and editing tasks
- Matches the AddTaskPage UI design with:
  - Task title input with color selector
  - Note textarea (200 char limit)
  - Estimated pomodoros stepper (1-20)
  - Project selector (Premium feature)
  - Full-screen on mobile, centered on desktop
  - Smooth animations and transitions
- Supports both "Add task" and "Edit task" modes
- Color mapping for all available categories (tomato, sage, cobalt, amber, violet, red, orange, green, blue)

### 2. **CategoryRow Component** (`apps/web/src/components/CategoryRow.jsx`)
- Added color display using the task's `category` field
- Display task notes below the title (truncated)
- Added edit button that opens TaskFormModal
- Color mapping for all available categories
- Integrated with TaskFormModal for consistent UI

### 3. **TaskManager Component** (`apps/web/src/components/TaskManager.jsx`)
- Added color indicator next to task title
- Display task notes below title
- Added edit button (Edit2 icon) on hover
- Uses TaskFormModal for editing tasks
- Updated to accept `onUpdateTask` prop for edit functionality

### 4. **AddTaskPage** (`apps/web/src/pages/AddTaskPage.jsx`)
- Connected to `useTaskManager` hook
- Integrated with `useAuth` for current user
- Form now saves tasks with:
  - Title
  - Category (color)
  - Note
  - Estimated Pomodoros (default: 1)
- Added loading state during submission
- Redirects to home page after successful task creation

### 5. **useTaskManager Hook** (`apps/web/src/hooks/useTaskManager.js`)
- Updated `addTask` function to accept options object with:
  - `category`: Task color/category
  - `note`: Task description/note
- Maintains backward compatibility with existing code

## Features

### Task Display
- **Color Indicator**: Visual color bar on the right side of each task (CategoryRow) or color dot (TaskManager)
- **Note Display**: Task notes shown below the title (truncated with ellipsis)
- **Edit Button**: Appears on hover, opens TaskFormModal

### Task Editing & Adding
- **TaskFormModal**: Unified modal for both adding and editing tasks with:
  - Task title input
  - Color selector (9 color options with visual feedback)
  - Task note textarea (with character counter)
  - Estimated pomodoros stepper (1-20 with +/- buttons)
  - Project selector (Premium feature)
  - Save/Cancel buttons
  - Mobile-responsive design (full-screen on mobile, centered on desktop)
  - Smooth animations and transitions

### Task Creation
- **AddTaskPage**: Dedicated page for creating tasks with same UI as TaskFormModal
- **AddTaskModal**: Modal for quick task creation from HomePage with same UI

## Color Mapping
```javascript
{
  tomato: '#e8372a',
  sage: '#3aaa6e',
  cobalt: '#3a7bd5',
  amber: '#f07832',
  violet: '#8b5cf6',
  red: '#e8372a',
  orange: '#f07832',
  green: '#3aaa6e',
  blue: '#3a7bd5'
}
```

## Database Fields Used
- `category`: Task color/status (string)
- `note`: Task description (string, max 200 chars)
- `title`: Task title (string)
- `estimatedPomodoros`: Estimated pomodoro count (number)

## User Flow

### Adding a Task
1. User navigates to `/add-task` or clicks "Add Task" button
2. TaskFormModal opens with "Add task" title
3. Fills in task title, selects color, adds optional note
4. Sets estimated pomodoros using +/- buttons
5. Clicks "Add task" button
6. Task is created and user is redirected to home

### Editing a Task
1. User hovers over a task in the list (HomePage or TaskManager)
2. Clicks the edit (pencil) icon
3. TaskFormModal opens with "Edit task" title and pre-filled data
4. User modifies any field (title, note, color, pomodoros)
5. Clicks "Update task" to save or "Cancel" to discard changes
6. Page refreshes to show updated task

## Component Hierarchy

```
HomePage / TimerPage
├── CategoryRow (displays tasks)
│   └── TaskFormModal (edit mode)
└── AddTaskModal (quick add)

TaskManager (alternative task display)
├── Task items
│   └── TaskFormModal (edit mode)
└── Quick add form

AddTaskPage (dedicated add page)
└── Uses useTaskManager hook directly
```

## Compatibility
- Works with existing AddTaskModal component
- Maintains backward compatibility with HomePage
- All changes are additive and don't break existing functionality
- TaskFormModal can be reused in other components
