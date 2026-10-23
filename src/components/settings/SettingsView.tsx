import React, { useState } from 'react';
import {
  User,
  Timer,
  Target,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  Check,
  AlertCircle,
  Plus,
  X,
  ShieldCheck,
  Database,
  Palette,
  Gamepad2,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { THEME_PRESETS } from '../../utils/theme';
import { ColorGradeTheme } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    settings,
    updateSettings,
    exportData,
    importData,
    resetData,
    loadDemoData,
    colorGradeTheme,
    setColorGradeTheme,
    colorGrindStats,
    setActiveTab,
  } = useApp();

  const [studentName, setStudentName] = useState(profile.name);
  const [major, setMajor] = useState(profile.major);
  const [targetGoal, setTargetGoal] = useState(profile.targetGoal);
  const [dailyFocusGoal, setDailyFocusGoal] = useState(profile.dailyFocusGoalMinutes);
  const [dailyTaskGoal, setDailyTaskGoal] = useState(profile.dailyTaskGoal);
  const [newSubject, setNewSubject] = useState('');

  // Timer durations
  const [focusDuration, setFocusDuration] = useState(settings.focusDuration);
  const [shortBreak, setShortBreak] = useState(settings.shortBreakDuration);
  const [longBreak, setLongBreak] = useState(settings.longBreakDuration);
  const [sessionsUntilLong, setSessionsUntilLong] = useState(settings.sessionsUntilLongBreak);

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Save profile & goals
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: studentName.trim() || 'Alex Chen',
      major: major.trim(),
      targetGoal: targetGoal.trim(),
      dailyFocusGoalMinutes: Number(dailyFocusGoal) || 120,
      dailyTaskGoal: Number(dailyTaskGoal) || 5,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Save timer durations
  const handleSaveTimerSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      focusDuration: Number(focusDuration) || 25,
      shortBreakDuration: Number(shortBreak) || 5,
      longBreakDuration: Number(longBreak) || 15,
      sessionsUntilLongBreak: Number(sessionsUntilLong) || 4,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Add subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    const formatted = newSubject.trim();
    if (!profile.subjects.includes(formatted)) {
      updateProfile({ subjects: [...profile.subjects, formatted] });
    }
    setNewSubject('');
  };

  // Remove subject
  const handleRemoveSubject = (subToRemove: string) => {
    if (profile.subjects.length <= 1) {
      alert('You must keep at least one subject.');
      return;
    }
    updateProfile({ subjects: profile.subjects.filter((s) => s !== subToRemove) });
  };

  // Handle JSON Import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importData(file);
    setImportStatus(result);
    setTimeout(() => setImportStatus(null), 4000);
    // clear input value
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Preferences & Goals</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your study targets, Pomodoro intervals, subjects, and local data backups.
        </p>

        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Settings successfully saved!</span>
          </div>
        )}
      </div>

      {/* Color Grading & Grinding Studio */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Color Grading & Visual Palette</h2>
              <p className="text-xs text-slate-500">
                Grade your dashboard atmosphere. Unlock rare palettes by grinding focus sessions or playing in the Arcade!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{colorGrindStats.totalDust} Color Dust</span>
            </div>

            <button
              onClick={() => setActiveTab('colorgrind')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Color Grind</span>
            </button>
          </div>
        </div>

        {/* Palettes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(Object.keys(THEME_PRESETS) as ColorGradeTheme[]).map((themeKey) => {
            const preset = THEME_PRESETS[themeKey];
            const isUnlocked = colorGrindStats.unlockedPalettes.includes(themeKey);
            const isSelected = colorGradeTheme === themeKey;

            return (
              <div
                key={themeKey}
                onClick={() => {
                  if (isUnlocked) setColorGradeTheme(themeKey);
                }}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 shadow-xs'
                    : isUnlocked
                    ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                    : 'border-slate-200 bg-slate-50/60 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full shadow-xs shrink-0"
                        style={{ backgroundColor: preset.primaryHex }}
                      />
                      <span className="text-sm font-bold text-slate-900">{preset.name}</span>
                    </div>

                    {isSelected ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-600">Unlocked</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        {preset.requiredDust} Dust
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{preset.description}</p>
                </div>

                {/* Swatch Preview Bar */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <div
                    className="h-2 flex-1 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${preset.primaryHex}, ${preset.secondaryHex})` }}
                  />
                  {!isUnlocked && (
                    <span className="text-[10px] text-amber-700 font-semibold tabular-nums">
                      {Math.max(0, preset.requiredDust - colorGrindStats.totalDust)} more dust needed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Profile & Daily Targets */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Profile & Academic Goals</h2>
            <p className="text-xs text-slate-500">Configure your study targets and identity</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="student-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Student Name
              </label>
              <input
                id="student-name-input"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="student-major-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Major / Degree
              </label>
              <input
                id="student-major-input"
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="student-target-goal" className="block text-xs font-semibold text-slate-700 mb-1">
              Current Academic Focus / Target Milestone
            </label>
            <input
              id="student-target-goal"
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g. Fall Midterms, GRE, or Software Engineering Internship Interviews"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="daily-focus-goal" className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Focus Target (Minutes)
              </label>
              <input
                id="daily-focus-goal"
                type="number"
                min="15"
                max="720"
                step="15"
                value={dailyFocusGoal}
                onChange={(e) => setDailyFocusGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm tabular-nums border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {(dailyFocusGoal / 60).toFixed(1)} hours of deep work per day
              </span>
            </div>

            <div>
              <label htmlFor="daily-task-goal" className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Completed Tasks Target
              </label>
              <input
                id="daily-task-goal"
                type="number"
                min="1"
                max="30"
                value={dailyTaskGoal}
                onChange={(e) => setDailyTaskGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm tabular-nums border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Qualifies for your daily streak reward</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Course / Subject Catalog */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Subject & Course Catalog</h2>
        <p className="text-xs text-slate-500 mb-4">Add your subjects to categorize tasks and focus time.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {profile.subjects.map((sub) => (
            <div
              key={sub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
            >
              <span>{sub}</span>
              <button
                type="button"
                onClick={() => handleRemoveSubject(sub)}
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                title={`Remove ${sub}`}
                aria-label={`Remove subject ${sub}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddSubject} className="flex gap-2 max-w-sm">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Add new subject (e.g. Operating Systems)..."
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newSubject.trim()}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Add
          </button>
        </form>
      </div>

      {/* Focus Timer Durations & Audio Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Pomodoro Timer Durations</h2>
            <p className="text-xs text-slate-500">Configure sprint cycles and intervals</p>
          </div>
        </div>

        <form onSubmit={handleSaveTimerSettings} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="timer-focus-dur" className="block text-xs font-semibold text-slate-700 mb-1">
                Focus (Mins)
              </label>
              <input
                id="timer-focus-dur"
                type="number"
                min="1"
                max="120"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm tabular-nums border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="timer-short-break" className="block text-xs font-semibold text-slate-700 mb-1">
                Short Break (Mins)
              </label>
              <input
                id="timer-short-break"
                type="number"
                min="1"
                max="30"
                value={shortBreak}
                onChange={(e) => setShortBreak(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm tabular-nums border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="timer-long-break" className="block text-xs font-semibold text-slate-700 mb-1">
                Long Break (Mins)
              </label>
              <input
                id="timer-long-break"
                type="number"
                min="5"
                max="60"
                value={longBreak}
                onChange={(e) => setLongBreak(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm tabular-nums border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="timer-sessions-count" className="block text-xs font-semibold text-slate-700 mb-1">
                Long Break Every
              </label>
              <input
                id="timer-sessions-count"
                type="number"
                min="1"
                max="12"
                value={sessionsUntilLong}
                onChange={(e) => setSessionsUntilLong(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm tabular-nums border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="soundToggle"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="soundToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Play harmonious chime when session finishes
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Save Intervals
            </button>
          </div>
        </form>
      </div>

      {/* Local Data Management & Backups */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Persistent Local Data & Backups</h2>
            <p className="text-xs text-slate-500">
              All tasks, focus logs, and habits are stored privately in your browser.
            </p>
          </div>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              importStatus.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {importStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={exportData}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex flex-col items-center text-center transition-all group"
          >
            <Download className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900">Export Backup</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Download full JSON archive</span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex flex-col items-center text-center transition-all group cursor-pointer">
            <Upload className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900">Import Backup</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Restore from JSON file</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Load Sample Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset and reload realistic sample student data?')) {
                loadDemoData();
              }
            }}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex flex-col items-center text-center transition-all"
          >
            <RotateCcw className="w-5 h-5 text-slate-600 mb-2" />
            <span className="text-xs font-bold text-slate-900">Load Sample Data</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Populate demo tasks & history</span>
          </button>
        </div>

        {/* Clear Data Danger Zone */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-600">Reset Application Data</div>
            <div className="text-[11px] text-slate-500">Wipes all stored tasks and sessions</div>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Clear All Stored Data?</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This action will remove all custom tasks, focus session history, and settings from this browser. This
              cannot be undone unless you exported a backup.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
