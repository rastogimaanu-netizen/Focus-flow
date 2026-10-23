import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  Edit2,
  Trash2,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, TaskStatus } from '../../types';
import { TaskModal } from './TaskModal';
import { getLocalDateString } from '../../utils/storage';

export const TasksView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    profile,
    setActiveTab,
    setSelectedTaskForTimer,
    todayStats,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'estimatedDuration'>('dueDate');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Quick inline add state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSubject, setQuickSubject] = useState(profile.subjects[0] || 'DSA');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');

  const todayStr = getLocalDateString(new Date());

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTask({
      title: quickTitle.trim(),
      priority: quickPriority,
      status: 'todo',
      dueDate: todayStr,
      subject: quickSubject,
      estimatedDuration: 45,
    });
    setQuickTitle('');
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(query);
          const matchDesc = t.description?.toLowerCase().includes(query);
          const matchNotes = t.notes?.toLowerCase().includes(query);
          const matchSub = t.subject.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchNotes && !matchSub) return false;
        }

        // Status
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;

        // Priority
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        // Subject
        if (subjectFilter !== 'all' && t.subject !== subjectFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'priority') {
          const weights: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'estimatedDuration') {
          return b.estimatedDuration - a.estimatedDuration;
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, subjectFilter, sortBy]);

  // Priority count badges
  const overdueCount = tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Goal Progress Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Study Task Planner</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Organize syllabus assignments, interview prep, and coursework.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTaskToEdit(undefined);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Daily Goal Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            Daily Target:{' '}
            <span className="font-semibold text-slate-900 tabular-nums">
              {todayStats.completedTasksCount} / {profile.dailyTaskGoal} tasks completed
            </span>
          </div>
          <div className="flex-1 max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${todayStats.taskGoalPercent}%` }}
            />
          </div>
          <div className="font-semibold text-indigo-600 tabular-nums">{todayStats.taskGoalPercent}% achieved</div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
        <form onSubmit={handleQuickAdd} className="flex flex-wrap lg:flex-nowrap items-center gap-2.5">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Quick-create a task (e.g. Read Operating Systems Chapter 3)..."
            className="flex-1 min-w-[240px] px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
          />

          <select
            value={quickSubject}
            onChange={(e) => setQuickSubject(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden"
          >
            {profile.subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value as Priority)}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden capitalize"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
        {/* Top row: Search input & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, notes..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="estimatedDuration">Duration</option>
            </select>
          </div>
        </div>

        {/* Filter controls: Status, Priority, Subject */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['all', 'todo', 'in_progress', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'in_progress' ? 'In Progress' : s}
              </button>
            ))}
          </div>

          {/* Priority dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden capitalize"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Subject filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden"
          >
            <option value="all">All Subjects</option>
            {profile.subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {overdueCount > 0 && (
            <div className="text-xs text-rose-600 font-semibold flex items-center gap-1 ml-auto">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{overdueCount} overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No study tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || subjectFilter !== 'all'
                ? 'Try clearing active filters or search terms.'
                : 'Create your first task to start tracking syllabus and study goals.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setSubjectFilter('all');
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isOverdue = !isCompleted && task.dueDate < todayStr;
              const isDueToday = task.dueDate === todayStr;

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70 ${
                    isCompleted ? 'bg-slate-50/40 opacity-70' : ''
                  }`}
                >
                  {/* Left: Checkbox & Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-500 bg-white'
                      }`}
                      aria-label={isCompleted ? `Reopen ${task.title}` : `Complete ${task.title}`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        {isOverdue && (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            Overdue
                          </span>
                        )}
                        {isDueToday && !isCompleted && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            Due Today
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                      )}

                      {/* Zero-Pill Text Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{task.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold capitalize ${
                            task.priority === 'high'
                              ? 'text-rose-600'
                              : task.priority === 'medium'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Due {task.dueDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{task.estimatedDuration}m planned</span>
                        {task.actualDuration ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums text-indigo-600 font-medium">
                              {task.actualDuration}m logged
                            </span>
                          </>
                        ) : null}
                      </div>

                      {task.notes && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 mt-1 border border-slate-100">
                          {task.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {/* Status Toggle Switch: Todo -> In Progress -> Completed */}
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                      className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    {/* Launch in Focus Room */}
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          setSelectedTaskForTimer(task);
                          setActiveTab('timer');
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Focus on this task in Timer"
                        aria-label={`Focus on ${task.title}`}
                      >
                        <Play className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setTaskToEdit(task);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit task"
                      aria-label="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <TaskModal
          taskToEdit={taskToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(undefined);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete Task?</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove &quot;{taskToDelete.title}&quot;? Recorded focus analytics will remain
              preserved.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
