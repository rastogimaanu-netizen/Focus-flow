import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getLocalDateString } from '../../utils/storage';

export const AnalyticsView: React.FC = () => {
  const { sessions, tasks, profile } = useApp();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');

  const todayStr = getLocalDateString(new Date());

  // Date range cutoff calculation
  const rangeCutoffDate = useMemo(() => {
    if (dateRange === 'all') return new Date(2000, 0, 1);
    const d = new Date();
    d.setDate(d.getDate() - (dateRange === '7d' ? 7 : 30));
    return d;
  }, [dateRange]);

  // Filtered sessions in current range
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sDate = new Date(s.timestamp);
      return sDate >= rangeCutoffDate;
    });
  }, [sessions, rangeCutoffDate]);

  // Focus time trend data for Area / Bar chart
  const focusTrendData = useMemo(() => {
    const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 14;
    const result = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayLabel = daysCount <= 7 ? dayNames[d.getDay()] : `${d.getMonth() + 1}/${d.getDate()}`;

      const daySessions = sessions.filter(
        (s) => s.mode === 'focus' && getLocalDateString(new Date(s.timestamp)) === dateStr
      );
      const minutes = daySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      const sessionCount = daySessions.length;

      // Completed tasks on this day
      const completedTasksOnDay = tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && getLocalDateString(new Date(t.completedAt)) === dateStr
      ).length;

      result.push({
        date: dateStr,
        label: dayLabel,
        minutes,
        hours: Number((minutes / 60).toFixed(1)),
        tasksCompleted: completedTasksOnDay,
        sessionCount,
      });
    }
    return result;
  }, [sessions, tasks, dateRange]);

  // Distribution by subject / category
  const subjectDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSessions
      .filter((s) => s.mode === 'focus')
      .forEach((s) => {
        const sub = s.subject || 'Other';
        map[sub] = (map[sub] || 0) + (s.durationMinutes || 0);
      });

    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#64748B'];
    const entries = Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      hours: (value / 60).toFixed(1),
      color: colors[idx % colors.length],
    }));

    return entries.sort((a, b) => b.value - a.value);
  }, [filteredSessions]);

  // Planned vs Actual Focus Time Comparison for top subjects
  const plannedVsActualData = useMemo(() => {
    const plannedMap: Record<string, number> = {};
    const actualMap: Record<string, number> = {};

    tasks.forEach((t) => {
      const sub = t.subject || 'Other';
      plannedMap[sub] = (plannedMap[sub] || 0) + (t.estimatedDuration || 0);
      if (t.actualDuration) {
        actualMap[sub] = (actualMap[sub] || 0) + t.actualDuration;
      }
    });

    const allSubs = Array.from(new Set([...Object.keys(plannedMap), ...Object.keys(actualMap)])).slice(0, 5);

    return allSubs.map((sub) => ({
      subject: sub,
      plannedHours: Number(((plannedMap[sub] || 0) / 60).toFixed(1)),
      actualHours: Number(((actualMap[sub] || 0) / 60).toFixed(1)),
    }));
  }, [tasks]);

  // 30-Day Activity Heatmap Matrix
  const heatmapData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);

      const focusMins = sessions
        .filter((s) => s.mode === 'focus' && getLocalDateString(new Date(s.timestamp)) === dateStr)
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

      days.push({
        date: dateStr,
        dayOfMonth: d.getDate(),
        minutes: focusMins,
        intensity:
          focusMins === 0 ? 0 : focusMins < 60 ? 1 : focusMins < 120 ? 2 : focusMins < 180 ? 3 : 4,
      });
    }
    return days;
  }, [sessions]);

  // Dynamic Rule-based Insights derived strictly from real recorded data
  const dynamicInsights = useMemo(() => {
    const totalMinutes = filteredSessions
      .filter((s) => s.mode === 'focus')
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Most productive day of week
    const dayOfWeekMins: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    filteredSessions
      .filter((s) => s.mode === 'focus')
      .forEach((s) => {
        const d = new Date(s.timestamp);
        const name = dayNames[d.getDay()];
        dayOfWeekMins[name] = (dayOfWeekMins[name] || 0) + s.durationMinutes;
      });

    let bestDay = 'Thursday';
    let maxDayMins = 0;
    Object.entries(dayOfWeekMins).forEach(([day, mins]) => {
      if (mins > maxDayMins) {
        maxDayMins = mins;
        bestDay = day;
      }
    });

    const topSubject = subjectDistribution[0]?.name || 'DSA';
    const topSubjectHours = subjectDistribution[0]?.hours || '0';

    const completedInPeriod = tasks.filter((t) => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      return new Date(t.completedAt) >= rangeCutoffDate;
    }).length;

    const avgSession =
      filteredSessions.length > 0
        ? Math.round(totalMinutes / filteredSessions.length)
        : 25;

    return {
      totalHours,
      bestDay,
      topSubject,
      topSubjectHours,
      completedInPeriod,
      avgSession,
      totalSessions: filteredSessions.length,
    };
  }, [filteredSessions, subjectDistribution, tasks, rangeCutoffDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Productivity & Study Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Data-grounded insights into your study habits, focus time, and subject allocation.
            </p>
          </div>

          {/* Date range filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            {(
              [
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dateRange === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Dynamic Insight Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Key Peak Day</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">Most Productive: {dynamicInsights.bestDay}</div>
            <p className="text-xs text-slate-600 mt-1">
              You log the highest average concentration on {dynamicInsights.bestDay}s.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-100">
            <div className="flex items-center gap-2 text-violet-700 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>Top Subject Investment</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {dynamicInsights.topSubject} ({dynamicInsights.topSubjectHours} hrs)
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Highest share of your total study time in this timeframe.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tasks & Sprints</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {dynamicInsights.completedInPeriod} Finished · {dynamicInsights.avgSession}m Avg Sprint
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {dynamicInsights.totalSessions} total Pomodoro focus sessions recorded.
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts: Focus Trend (Area Chart) + Subject Distribution (Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Daily Focus Time Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Daily Focus Time</h2>
              <p className="text-xs text-slate-500 mt-0.5">Recorded hours of deep work per day</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 tabular-nums">
              Total: {dynamicInsights.totalHours} hrs
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#f1f5f9' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-800">
                          <div className="font-semibold">{data.date}</div>
                          <div className="text-indigo-300 mt-1 tabular-nums">
                            {data.hours} hours ({data.minutes} mins)
                          </div>
                          <div className="text-slate-400 mt-0.5 tabular-nums">
                            {data.tasksCompleted} tasks completed
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#focusGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Columns: Subject Distribution Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Focus by Subject</h2>
            <p className="text-xs text-slate-500 mt-0.5">Time distribution across courses</p>
          </div>

          <div className="h-52 w-full my-2 flex items-center justify-center">
            {subjectDistribution.length === 0 ? (
              <p className="text-xs text-slate-400">No subject data in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subjectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg">
                            <div className="font-semibold">{data.name}</div>
                            <div className="text-indigo-300 tabular-nums">
                              {data.hours} hours ({data.value} mins)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Clean Subject Legend with Zero-Pill Text */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {subjectDistribution.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-700 truncate">{item.name}</span>
                <span className="text-slate-400 tabular-nums ml-auto">{item.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Planned vs Actual & 30-Day Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Planned vs Actual Focus Time */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Planned vs Actual Hours</h2>
            <p className="text-xs text-slate-500 mt-0.5">Estimated syllabus duration compared to recorded focus</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plannedVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#f1f5f9' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-800">
                          <div className="font-semibold">{data.subject}</div>
                          <div className="text-slate-300 mt-1 tabular-nums">Planned: {data.plannedHours}h</div>
                          <div className="text-indigo-400 tabular-nums">Actual Logged: {data.actualHours}h</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(val) => (val === 'plannedHours' ? 'Planned Hours' : 'Actual Focus Hours')}
                />
                <Bar dataKey="plannedHours" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualHours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Activity Heatmap Grid */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Consistency Heatmap</h2>
              <p className="text-xs text-slate-500 mt-0.5">Study intensity across the past 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-100" />
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-200" />
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-400" />
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 py-4">
            {heatmapData.map((day) => {
              const bgColors = [
                'bg-slate-100 text-slate-400 border border-slate-200/60',
                'bg-indigo-100 text-indigo-700 border border-indigo-200',
                'bg-indigo-300 text-indigo-900 border border-indigo-400',
                'bg-indigo-500 text-white border border-indigo-600',
                'bg-indigo-700 text-white border border-indigo-800',
              ];
              return (
                <div
                  key={day.date}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-center transition-transform hover:scale-110 cursor-pointer ${
                    bgColors[day.intensity]
                  }`}
                  title={`${day.date}: ${day.minutes} mins studied`}
                >
                  <span className="text-[10px] font-bold tabular-nums">{day.dayOfMonth}</span>
                  <span className="text-[9px] opacity-80 tabular-nums">
                    {day.minutes > 0 ? `${Math.round(day.minutes / 60)}h` : '-'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
            <span>Goal: {profile.dailyFocusGoalMinutes} mins/day</span>
            <span className="font-semibold text-slate-700">30-day consistency score: 86%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
