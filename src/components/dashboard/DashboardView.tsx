import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Play,
  Plus,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';
import { getLocalDateString } from '../../utils/storage';
import { Task, Priority } from '../../types';
import { THEME_PRESETS } from '../../utils/theme';

export const DashboardView: React.FC = () => {
  const {
    profile,
    tasks,
    sessions,
    streak,
    todayStats,
    toggleTaskStatus,
    addTask,
    setActiveTab,
    setSelectedTaskForTimer,
    colorGradeTheme,
    colorGrindStats,
  } = useApp();

  const currentTheme = THEME_PRESETS[colorGradeTheme] || THEME_PRESETS.indigo;

  const [quickTitle, setQuickTitle] = useState('');
  const [quickSubject, setQuickSubject] = useState(profile.subjects[0] || 'DSA');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');

  const todayStr = getLocalDateString(new Date());

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format today's date nicely: "Thursday, October 23, 2026"
  const formattedTodayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  // Filter tasks due today or in progress
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.status === 'in_progress');
  const incompleteTodayTasks = todayTasks.filter((t) => t.status !== 'completed');

  // Last 7 days productivity data for Recharts
  const weeklyData = React.useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = dayNames[d.getDay()];

      const focusMins = sessions
        .filter((s) => s.mode === 'focus' && getLocalDateString(new Date(s.timestamp)) === dateStr)
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

      days.push({
        date: dateStr,
        day: dayName,
        minutes: focusMins,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [sessions, todayStr]);

  // Recent focus sessions (latest 4)
  const recentSessions = React.useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4);
  }, [sessions]);

  // Handle Quick Add Task
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      priority: quickPriority,
      status: 'todo',
      dueDate: todayStr,
      subject: quickSubject,
      estimatedDuration: 30,
    });
    setQuickTitle('');
  };

  // Format minutes into "1h 45m" or "45m"
  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  // Circular progress calculations
  const totalTasks = todayStats.totalTodayTasksCount || 1;
  const completedTasks = todayStats.completedTasksCount;
  const taskPercent = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (taskPercent / 100) * circumference;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentTheme.bannerGradient} text-white p-6 sm:p-8 shadow-sm`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <span>{formattedTodayDate}</span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                {colorGrindStats.tier} (Tier {colorGrindStats.level})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {profile.name.split(' ')[0]}.
            </h1>
            <p className="text-white/90 text-sm leading-relaxed">
              Let&apos;s make today count. You have{' '}
              <span className="font-semibold text-white">{incompleteTodayTasks.length} pending tasks</span> and{' '}
              <span className="font-semibold text-white">{formatMins(todayStats.focusMinutes)}</span> of deep focus logged today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('colorgrind')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
            >
              <Gamepad2 className="w-4 h-4 text-amber-300" />
              <span>Color Grind</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
              style={{ color: currentTheme.primaryHex }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Focus</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background shapes */}
        <div className="absolute -right-8 -bottom-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-2xl" />
        <div className="absolute right-40 -top-12 w-48 h-48 bg-white/10 rounded-full pointer-events-none blur-xl" />
      </div>

      {/* 4 Compact Statistics Grid + Daily Ring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Tasks Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Tasks Completed</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {todayStats.completedTasksCount}{' '}
              <span className="text-sm font-normal text-slate-400">/ {todayStats.totalTodayTasksCount}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {todayStats.totalTodayTasksCount - todayStats.completedTasksCount} remaining today
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Focus Time Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Focus Time Today</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {formatMins(todayStats.focusMinutes)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Goal: {formatMins(profile.dailyFocusGoalMinutes)} ({todayStats.focusGoalPercent}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Daily Completion Ring */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Daily Completion</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{taskPercent}%</div>
            <div className="text-xs text-slate-500 mt-1">Daily task target</div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="transition-all duration-700 ease-out"
                style={{ stroke: currentTheme.ringColor }}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-800 tabular-nums">{taskPercent}%</span>
          </div>
        </div>

        {/* Stat 4: Study Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Current Study Streak</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
              {streak.currentStreak} <span className="text-sm font-medium text-slate-600">days</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Best record: <span className="tabular-nums font-semibold">{streak.longestStreak}</span> days
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Content: Left Today's Tasks + Quick Add, Right Weekly Chart & Pomodoro Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Today's Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Today&apos;s Study Tasks</h2>
                <p className="text-xs text-slate-500 mt-0.5">Focus on high impact deliverables</p>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                <span>View All ({tasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Add Inline Bar */}
            <form onSubmit={handleQuickAdd} className="mb-5">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Quick add a study task for today..."
                  className="flex-1 min-w-[180px] bg-transparent px-3 py-1.5 text-sm placeholder:text-slate-400 focus:outline-hidden"
                />

                <select
                  value={quickSubject}
                  onChange={(e) => setQuickSubject(e.target.value)}
                  className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
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
                  className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden capitalize"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Add
                </button>
              </div>
            </form>

            {/* Task Items List */}
            {todayTasks.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">All caught up for today!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Add a task above or plan upcoming assignments in My Tasks.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.slice(0, 5).map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-slate-50/70 border-slate-200/60 opacity-70'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-indigo-500 bg-white'
                          }`}
                          aria-label={isCompleted ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium leading-snug truncate ${
                              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </div>

                          {/* Zero-Pill Metadata */}
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{task.subject}</span>
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
                              {task.priority}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{task.estimatedDuration}m est</span>
                            {task.actualDuration ? (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums text-indigo-600 font-medium">
                                  {task.actualDuration}m focused
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Start Focus on this task button */}
                      {!isCompleted && (
                        <button
                          onClick={() => {
                            setSelectedTaskForTimer(task);
                            setActiveTab('timer');
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shrink-0"
                          title="Focus on this task now"
                          aria-label={`Start timer for ${task.title}`}
                        >
                          <Play className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Weekly Productivity Chart & Recent Sessions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weekly Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Weekly Focus Trend</h2>
                <p className="text-xs text-slate-500 mt-0.5">Daily minutes studied</p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Insights &rarr;
              </button>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#f1f5f9' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}m`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-800">
                            <div className="font-semibold">{data.day} ({data.date})</div>
                            <div className="text-indigo-300 mt-0.5 tabular-nums">
                              {data.minutes} focus minutes ({formatMins(data.minutes)})
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="minutes" radius={[6, 6, 2, 2]}>
                    {weeklyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? '#6366f1' : '#c7d2fe'}
                        className="hover:opacity-85 transition-opacity"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3">Recent Focus Sessions</h2>
            {recentSessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No focus sessions recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentSessions.map((session) => (
                  <div key={session.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {session.taskTitle || session.subject}
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        <span>{session.subject}</span>
                        <span className="mx-1">·</span>
                        <span>{new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-indigo-600 tabular-nums">+{session.durationMinutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
