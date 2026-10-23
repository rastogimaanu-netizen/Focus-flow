import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  FocusSession,
  TimerSettings,
  StudentProfile,
  StreakInfo,
  NavigationTab,
  AppDataBackup,
  ColorGradeTheme,
  ColorGrindStats,
} from '../types';
import {
  loadStoredData,
  saveStoredData,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_PROFILE,
  DEFAULT_THEME,
  DEFAULT_GRIND_STATS,
  getLocalDateString,
  calculateStreak,
  generateInitialDemoData,
  exportBackupData,
} from '../utils/storage';
import { playChime, ambientAudio } from '../utils/audio';
import { THEME_PRESETS } from '../utils/theme';

interface CelebrationData {
  isOpen: boolean;
  title: string;
  message: string;
}

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  sessions: FocusSession[];
  recordSession: (sessionData: {
    durationMinutes: number;
    subject: string;
    mode: 'focus' | 'shortBreak' | 'longBreak';
    taskId?: string;
    taskTitle?: string;
    notes?: string;
  }) => void;
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  profile: StudentProfile;
  updateProfile: (newProfile: Partial<StudentProfile>) => void;
  selectedTaskForTimer: Task | null;
  setSelectedTaskForTimer: (task: Task | null) => void;
  streak: StreakInfo;
  todayStats: {
    focusMinutes: number;
    completedTasksCount: number;
    totalTodayTasksCount: number;
    focusGoalPercent: number;
    taskGoalPercent: number;
  };
  celebration: CelebrationData;
  dismissCelebration: () => void;
  triggerCelebration: (title: string, message: string) => void;
  exportData: () => void;
  importData: (file: File) => Promise<{ success: boolean; message: string }>;
  resetData: () => void;
  loadDemoData: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  // Color Grading & Color Grinding
  colorGradeTheme: ColorGradeTheme;
  setColorGradeTheme: (theme: ColorGradeTheme) => void;
  colorGrindStats: ColorGrindStats;
  recordColorGrindScore: (score: number, dust: number) => void;
  unlockTheme: (theme: ColorGradeTheme) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState<Task | null>(null);
  const [celebration, setCelebration] = useState<CelebrationData>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Color Grading & Grinding states
  const [colorGradeTheme, setColorGradeThemeState] = useState<ColorGradeTheme>(DEFAULT_THEME);
  const [colorGrindStats, setColorGrindStats] = useState<ColorGrindStats>(DEFAULT_GRIND_STATS);

  // Load initial data safely
  useEffect(() => {
    const data = loadStoredData();
    setTasks(data.tasks);
    setSessions(data.sessions);
    setSettings(data.settings);
    setProfile(data.profile);
    if (data.theme) setColorGradeThemeState(data.theme);
    if (data.colorGrindStats) setColorGrindStats(data.colorGrindStats);
  }, []);

  // Update ambient audio settings if changed
  useEffect(() => {
    if (settings.ambientSound && settings.ambientSound !== 'none') {
      ambientAudio.setVolume(settings.ambientVolume);
    }
  }, [settings.ambientVolume, settings.ambientSound]);

  // Persist tasks
  const handleSetTasks = useCallback((newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    setTasks((prev) => {
      const updated = typeof newTasks === 'function' ? newTasks(prev) : newTasks;
      saveStoredData(STORAGE_KEYS.TASKS, updated);
      return updated;
    });
  }, []);

  // Persist sessions
  const handleSetSessions = useCallback((newSessions: FocusSession[] | ((prev: FocusSession[]) => FocusSession[])) => {
    setSessions((prev) => {
      const updated = typeof newSessions === 'function' ? newSessions(prev) : newSessions;
      saveStoredData(STORAGE_KEYS.SESSIONS, updated);
      return updated;
    });
  }, []);

  // Color Grade Switcher
  const setColorGradeTheme = useCallback((theme: ColorGradeTheme) => {
    setColorGradeThemeState(theme);
    saveStoredData(STORAGE_KEYS.THEME, theme);
  }, []);

  const triggerCelebration = useCallback((title: string, message: string) => {
    setCelebration({ isOpen: true, title, message });
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
      });
    } catch {
      // ignore
    }
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Color Grind score recorder & unlock checker
  const recordColorGrindScore = useCallback((score: number, dust: number) => {
    setColorGrindStats((prev) => {
      const newHigh = Math.max(prev.highScore, score);
      const newDust = prev.totalDust + dust;
      const newLevel = Math.floor(newDust / 50) + 1;
      
      const tiers = ['Spectrum Novice', 'Prism Adept', 'Chroma Artisan', 'Chromatic Virtuoso', 'Chromatic Grandmaster'];
      const tier = tiers[Math.min(tiers.length - 1, Math.floor(newLevel / 2))];

      // Auto-unlock available themes
      const unlocked = [...prev.unlockedPalettes];
      (Object.keys(THEME_PRESETS) as ColorGradeTheme[]).forEach((themeKey) => {
        if (!unlocked.includes(themeKey) && newDust >= THEME_PRESETS[themeKey].requiredDust) {
          unlocked.push(themeKey);
          triggerCelebration(
            'New Color Grade Unlocked!',
            `Congratulations! You unlocked the "${THEME_PRESETS[themeKey].name}" palette.`
          );
        }
      });

      const updated: ColorGrindStats = {
        highScore: newHigh,
        totalDust: newDust,
        tier,
        level: newLevel,
        unlockedPalettes: unlocked,
      };

      saveStoredData(STORAGE_KEYS.COLOR_GRIND, updated);
      return updated;
    });
  }, [triggerCelebration]);

  const unlockTheme = useCallback((themeKey: ColorGradeTheme) => {
    setColorGrindStats((prev) => {
      if (prev.unlockedPalettes.includes(themeKey)) return prev;
      const updated = {
        ...prev,
        unlockedPalettes: [...prev.unlockedPalettes, themeKey],
      };
      saveStoredData(STORAGE_KEYS.COLOR_GRIND, updated);
      return updated;
    });
  }, []);

  // Task actions
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      handleSetTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [handleSetTasks]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      handleSetTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updated = { ...t, ...updates };
            if (updates.status === 'completed' && t.status !== 'completed' && !updated.completedAt) {
              updated.completedAt = new Date().toISOString();
            } else if (updates.status && updates.status !== 'completed' && t.status === 'completed') {
              updated.completedAt = undefined;
            }
            return updated;
          }
          return t;
        })
      );
    },
    [handleSetTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      handleSetTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTaskForTimer?.id === id) {
        setSelectedTaskForTimer(null);
      }
    },
    [handleSetTasks, selectedTaskForTimer]
  );

  const toggleTaskStatus = useCallback(
    (id: string) => {
      handleSetTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const isNowCompleted = t.status !== 'completed';
            if (isNowCompleted) {
              // Reward 10 Color Dust for completing a task!
              recordColorGrindScore(0, 10);
              triggerCelebration('Task Completed!', `Great job finishing "${t.title}". Earned +10 Color Dust!`);
            }
            return {
              ...t,
              status: isNowCompleted ? 'completed' : 'todo',
              completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            };
          }
          return t;
        })
      );
    },
    [handleSetTasks, recordColorGrindScore, triggerCelebration]
  );

  // Focus Session actions
  const recordSession = useCallback(
    (sessionData: {
      durationMinutes: number;
      subject: string;
      mode: 'focus' | 'shortBreak' | 'longBreak';
      taskId?: string;
      taskTitle?: string;
      notes?: string;
    }) => {
      const newSession: FocusSession = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...sessionData,
      };

      handleSetSessions((prev) => [newSession, ...prev]);

      // If tied to a task, increment the task's actualDuration
      if (sessionData.taskId) {
        updateTask(sessionData.taskId, {
          actualDuration:
            (tasks.find((t) => t.id === sessionData.taskId)?.actualDuration || 0) + sessionData.durationMinutes,
        });
      }

      // Check if this session reached the daily focus goal & reward +25 Color Dust
      if (sessionData.mode === 'focus') {
        recordColorGrindScore(0, 25);

        const todayStr = getLocalDateString(new Date());
        const previousTodayMinutes = sessions
          .filter((s) => s.mode === 'focus' && getLocalDateString(new Date(s.timestamp)) === todayStr)
          .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
        const newTotal = previousTodayMinutes + sessionData.durationMinutes;

        if (previousTodayMinutes < profile.dailyFocusGoalMinutes && newTotal >= profile.dailyFocusGoalMinutes) {
          triggerCelebration(
            'Daily Goal Reached!',
            `Outstanding work! You just completed your ${profile.dailyFocusGoalMinutes} minutes daily focus goal. Earned bonus Color Dust!`
          );
        } else {
          triggerCelebration(
            'Session Complete!',
            `Added ${sessionData.durationMinutes}m of deep focus to ${sessionData.subject}. Earned +25 Color Dust!`
          );
        }
      }

      if (settings.soundEnabled) {
        playChime(true);
      }
    },
    [handleSetSessions, tasks, updateTask, sessions, profile.dailyFocusGoalMinutes, triggerCelebration, settings.soundEnabled, recordColorGrindScore]
  );

  // Settings
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveStoredData(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    });
  }, []);

  // Profile
  const updateProfile = useCallback((newProfile: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...newProfile };
      saveStoredData(STORAGE_KEYS.PROFILE, updated);
      return updated;
    });
  }, []);

  // Today stats
  const todayStats = useMemo(() => {
    const todayStr = getLocalDateString(new Date());

    const focusMinutes = sessions
      .filter((s) => s.mode === 'focus' && getLocalDateString(new Date(s.timestamp)) === todayStr)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    const completedTasksToday = tasks.filter(
      (t) => t.status === 'completed' && t.completedAt && getLocalDateString(new Date(t.completedAt)) === todayStr
    ).length;

    const totalTodayTasks = tasks.filter((t) => t.dueDate === todayStr).length;

    const focusGoalPercent = Math.min(100, Math.round((focusMinutes / (profile.dailyFocusGoalMinutes || 1)) * 100));
    const taskGoalPercent = Math.min(100, Math.round((completedTasksToday / (profile.dailyTaskGoal || 1)) * 100));

    return {
      focusMinutes,
      completedTasksCount: completedTasksToday,
      totalTodayTasksCount: Math.max(totalTodayTasks, completedTasksToday),
      focusGoalPercent,
      taskGoalPercent,
    };
  }, [sessions, tasks, profile]);

  // Streak
  const streak = useMemo(() => {
    return calculateStreak(sessions, tasks, profile.dailyFocusGoalMinutes);
  }, [sessions, tasks, profile.dailyFocusGoalMinutes]);

  // Backup & Restore
  const exportData = useCallback(() => {
    exportBackupData(tasks, sessions, settings, profile);
  }, [tasks, sessions, settings, profile]);

  const importData = useCallback(
    async (file: File): Promise<{ success: boolean; message: string }> => {
      try {
        const text = await file.text();
        const data = JSON.parse(text) as AppDataBackup;

        if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.sessions)) {
          return { success: false, message: 'Invalid backup file structure. Missing tasks or sessions.' };
        }

        setTasks(data.tasks);
        setSessions(data.sessions);
        if (data.settings) setSettings(data.settings);
        if (data.profile) setProfile(data.profile);
        if (data.colorGradeTheme) setColorGradeThemeState(data.colorGradeTheme);
        if (data.colorGrindStats) setColorGrindStats(data.colorGrindStats);

        saveStoredData(STORAGE_KEYS.TASKS, data.tasks);
        saveStoredData(STORAGE_KEYS.SESSIONS, data.sessions);
        if (data.settings) saveStoredData(STORAGE_KEYS.SETTINGS, data.settings);
        if (data.profile) saveStoredData(STORAGE_KEYS.PROFILE, data.profile);
        if (data.colorGradeTheme) saveStoredData(STORAGE_KEYS.THEME, data.colorGradeTheme);
        if (data.colorGrindStats) saveStoredData(STORAGE_KEYS.COLOR_GRIND, data.colorGrindStats);

        return { success: true, message: `Successfully restored ${data.tasks.length} tasks and ${data.sessions.length} sessions!` };
      } catch (e) {
        return { success: false, message: 'Could not parse JSON backup file.' };
      }
    },
    []
  );

  const resetData = useCallback(() => {
    setTasks([]);
    setSessions([]);
    setSettings(DEFAULT_SETTINGS);
    setProfile(DEFAULT_PROFILE);
    setColorGradeThemeState(DEFAULT_THEME);
    setColorGrindStats(DEFAULT_GRIND_STATS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.THEME);
      localStorage.removeItem(STORAGE_KEYS.COLOR_GRIND);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }, []);

  const loadDemoData = useCallback(() => {
    const initial = generateInitialDemoData();
    setTasks(initial.tasks);
    setSessions(initial.sessions);
    setSettings(DEFAULT_SETTINGS);
    setProfile(DEFAULT_PROFILE);
    setColorGradeThemeState(DEFAULT_THEME);
    setColorGrindStats(DEFAULT_GRIND_STATS);
    saveStoredData(STORAGE_KEYS.TASKS, initial.tasks);
    saveStoredData(STORAGE_KEYS.SESSIONS, initial.sessions);
    saveStoredData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    saveStoredData(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    saveStoredData(STORAGE_KEYS.THEME, DEFAULT_THEME);
    saveStoredData(STORAGE_KEYS.COLOR_GRIND, DEFAULT_GRIND_STATS);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        sessions,
        recordSession,
        settings,
        updateSettings,
        profile,
        updateProfile,
        selectedTaskForTimer,
        setSelectedTaskForTimer,
        streak,
        todayStats,
        celebration,
        dismissCelebration,
        triggerCelebration,
        exportData,
        importData,
        resetData,
        loadDemoData,
        sidebarCollapsed,
        setSidebarCollapsed,
        colorGradeTheme,
        setColorGradeTheme,
        colorGrindStats,
        recordColorGrindScore,
        unlockTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
