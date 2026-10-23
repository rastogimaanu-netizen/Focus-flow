import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Task, Priority } from '../../types';
import { useApp } from '../../context/AppContext';
import { getLocalDateString } from '../../utils/storage';

interface TaskModalProps {
  taskToEdit?: Task;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskToEdit, onClose }) => {
  const { addTask, updateTask, profile } = useApp();

  const todayStr = getLocalDateString(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [priority, setPriority] = useState<Priority>(taskToEdit?.priority || 'medium');
  const [subject, setSubject] = useState(taskToEdit?.subject || profile.subjects[0] || 'DSA');
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate || todayStr);
  const [estimatedDuration, setEstimatedDuration] = useState(taskToEdit?.estimatedDuration || 45);
  const [notes, setNotes] = useState(taskToEdit?.notes || '');
  const [error, setError] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }

    const finalSubject = isCustomSubject && customSubject.trim() ? customSubject.trim() : subject;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        subject: finalSubject,
        dueDate,
        estimatedDuration: Number(estimatedDuration) || 30,
        notes: notes.trim(),
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'todo',
        subject: finalSubject,
        dueDate,
        estimatedDuration: Number(estimatedDuration) || 30,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 id="task-modal-title" className="text-base font-bold text-slate-900">
            {taskToEdit ? 'Edit Task' : 'Create New Study Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close task modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Implement Dijkstra's Algorithm in Java"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="task-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key sub-goals, textbook exercises, or lecture references..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Subject & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label htmlFor="task-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Category
              </label>
              {!isCustomSubject ? (
                <div className="flex gap-2">
                  <select
                    id="task-subject"
                    value={subject}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomSubject(true);
                      } else {
                        setSubject(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    {profile.subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom Subject...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Subject name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomSubject(false)}
                    className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                        isSelected
                          ? p === 'high'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : p === 'medium'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Due Date & Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="task-due-date" className="text-xs font-semibold text-slate-700">
                  Due Date
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDueDate(todayStr)}
                    className={`text-[11px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                      dueDate === todayStr ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(tomorrowStr)}
                    className={`text-[11px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                      dueDate === tomorrowStr ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="task-duration" className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Duration (Minutes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="task-duration"
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">mins</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="task-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Study Notes / Action Items
            </label>
            <textarea
              id="task-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chapter 4, problems 12 to 19..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
