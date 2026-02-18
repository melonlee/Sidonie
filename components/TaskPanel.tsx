import React, { useState } from 'react';
import { X, Plus, Trash2, CheckSquare, Square, Check } from 'lucide-react';
import { Task } from '../types';

interface TaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask
}) => {
  const [newTask, setNewTask] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div 
      className={`absolute top-0 right-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <CheckSquare size={18} className="text-blue-600" />
          <span>Tasks</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="h-1 bg-slate-100 w-full">
           <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
         {tasks.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400">
             <CheckSquare size={32} className="mb-2 opacity-20" />
             <p className="text-sm font-medium">No tasks yet</p>
             <p className="text-xs mt-1">Add items to track your goals.</p>
           </div>
         ) : (
           tasks.map(task => (
             <div key={task.id} className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all animate-fade-in">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`mt-0.5 flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                >
                  {task.completed ? <div className="bg-green-100 p-0.5 rounded"><Check size={14} strokeWidth={3} /></div> : <Square size={18} />}
                </button>
                <span className={`text-sm flex-1 break-words transition-all leading-relaxed ${task.completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}>
                  {task.text}
                </span>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
             </div>
           ))
         )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Plus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskPanel;