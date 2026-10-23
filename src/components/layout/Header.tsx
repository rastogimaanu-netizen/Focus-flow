import React, { useState } from 'react';
import { Plus, Volume2, VolumeX, Sparkles, Timer, Palette, Gamepad2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskModal } from '../tasks/TaskModal';
import { THEME_PRESETS } from '../../utils/theme';
import { ColorGradeTheme } from '../../types';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    settings,
    updateSettings,
    profile,
    colorGradeTheme,
    setColorGradeTheme,
    colorGrindStats,
  } = useApp();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview';
      case 'tasks':
        return 'Task Planner';
      case 'timer':
        return 'Focus Room';
      case 'analytics':
        return 'Analytics & Habits';
      case 'colorgrind':
        return 'Color Grind Arcade';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const currentTheme = THEME_PRESETS[colorGradeTheme] || THEME_PRESETS.indigo;

  return (
    <>
      <header className="h-16 px-4 md:px-8 border-b border-slate-200/80 bg-white/90 backdrop-blur-xs sticky top-0 z-30 flex items-center justify-between gap-4">
        {/* Left: Breadcrumbs / View name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-semibold text-slate-800">FocusFlow</span>
          <span className="text-slate-400 text-xs">/</span>
          <span className="text-sm font-medium text-slate-600 truncate">{getBreadcrumb()}</span>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Color Grading Palette Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPaletteOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-white transition-colors"
              title="Color Grading & Palette Picker"
            >
              <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: currentTheme.primaryHex }} />
              <span className="hidden sm:inline">{currentTheme.name}</span>
            </button>

            {isPaletteOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-150">
                <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Color Grading</span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                    <Sparkles className="w-3 h-3" />
                    <span className="tabular-nums">{colorGrindStats.totalDust} Dust</span>
                  </div>
                </div>

                <div className="py-1 space-y-1">
                  {(Object.keys(THEME_PRESETS) as ColorGradeTheme[]).map((themeKey) => {
                    const preset = THEME_PRESETS[themeKey];
                    const isUnlocked = colorGrindStats.unlockedPalettes.includes(themeKey);
                    const isSelected = colorGradeTheme === themeKey;

                    return (
                      <button
                        key={themeKey}
                        onClick={() => {
                          if (isUnlocked) {
                            setColorGradeTheme(themeKey);
                            setIsPaletteOpen(false);
                          } else {
                            setActiveTab('colorgrind');
                            setIsPaletteOpen(false);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-slate-100 font-bold text-slate-900'
                            : isUnlocked
                            ? 'hover:bg-slate-50 text-slate-700'
                            : 'opacity-55 hover:opacity-80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: preset.primaryHex }}
                          />
                          <span>{preset.name}</span>
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] font-bold text-indigo-600">Active</span>
                        ) : isUnlocked ? (
                          <span className="text-[10px] text-emerald-600 font-medium">Ready</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium tabular-nums">
                            {preset.requiredDust} dust
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 px-2 pb-1">
                  <button
                    onClick={() => {
                      setActiveTab('colorgrind');
                      setIsPaletteOpen(false);
                    }}
                    className="w-full py-1.5 text-center text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Grind Colors in Arcade &rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sound Mute Toggle */}
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-2 rounded-xl text-slate-500 hover:text-slate-700 transition-colors ${
              settings.soundEnabled ? 'bg-slate-100 hover:bg-slate-200/80' : 'bg-red-50 text-red-500'
            }`}
            title={settings.soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            aria-label="Toggle chime sounds"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Color Grind Arcade Quick Button */}
          <button
            onClick={() => setActiveTab('colorgrind')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'colorgrind'
                ? 'bg-amber-100 text-amber-900'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
            title="Play Color Grind Arcade"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Color Grind</span>
          </button>

          {/* Quick Start Focus button if not on timer page */}
          {activeTab !== 'timer' && (
            <button
              onClick={() => setActiveTab('timer')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Focus Room</span>
            </button>
          )}

          {/* New Task Button */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>

          {/* Student Profile avatar chip */}
          <div
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
            title={`Signed in as ${profile.name}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || 'ST'}
            </div>
          </div>
        </div>
      </header>

      {/* Task Creation Modal */}
      {isTaskModalOpen && <TaskModal onClose={() => setIsTaskModalOpen(false)} />}
    </>
  );
};
