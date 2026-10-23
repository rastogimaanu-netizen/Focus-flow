import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { THEME_PRESETS } from '../../utils/theme';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    streak,
    tasks,
    todayStats,
    colorGradeTheme,
    colorGrindStats,
  } = useApp();

  const incompleteTodayTasks = tasks.filter((t) => t.status !== 'completed').length;
  const currentTheme = THEME_PRESETS[colorGradeTheme] || THEME_PRESETS.indigo;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: incompleteTodayTasks > 0 ? incompleteTodayTasks : undefined },
    { id: 'timer', label: 'Focus Room', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'colorgrind', label: 'Color Grind', icon: Gamepad2, badge: `${colorGrindStats.totalDust}✦` },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200/90 transition-all duration-200 shrink-0 select-none ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-hidden"
          title="FocusFlow Home"
        >
          <div
            className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0"
            style={{ background: `linear-gradient(135deg, ${currentTheme.primaryHex}, ${currentTheme.secondaryHex})` }}
          >
            <GraduationCap className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 tracking-tight text-base whitespace-nowrap">FocusFlow</span>
              <span className="text-[11px] text-slate-600 whitespace-nowrap">Your Day, In Flow</span>
            </div>
          )}
        </button>

        <button
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-100 text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-indigo-600' : 'text-slate-600'
                }`}
              />
              {!sidebarCollapsed && (
                <span className="flex-1 text-left whitespace-nowrap truncate">{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-md ${
                    item.id === 'colorgrind'
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-slate-600 bg-slate-100'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Streak & Goal Mini-Card */}
      {!sidebarCollapsed ? (
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  <span className="tabular-nums font-bold text-amber-600">{streak.currentStreak}</span> Day Streak
                </div>
                <div className="text-[11px] text-slate-600">Goal: {todayStats.focusGoalPercent}% met</div>
              </div>
            </div>
          </div>
          <div className="mt-2.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, todayStats.focusGoalPercent)}%`,
                backgroundColor: currentTheme.primaryHex,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="p-2 mb-3 flex flex-col items-center">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600" title={`${streak.currentStreak} day streak`}>
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-amber-600 tabular-nums mt-1">{streak.currentStreak}d</span>
        </div>
      )}
    </aside>
  );
};

export const MobileNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Home', icon: LayoutDashboard },
    { id: 'tasks' as NavigationTab, label: 'Tasks', icon: CheckSquare },
    { id: 'timer' as NavigationTab, label: 'Timer', icon: Timer },
    { id: 'colorgrind' as NavigationTab, label: 'Grind', icon: Gamepad2 },
    { id: 'analytics' as NavigationTab, label: 'Stats', icon: BarChart3 },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 px-2 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
