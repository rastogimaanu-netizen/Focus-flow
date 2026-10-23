import { Task, FocusSession, TimerSettings, StudentProfile, StreakInfo, AppDataBackup, ColorGradeTheme, ColorGrindStats } from '../types';

export const STORAGE_KEYS = {
  TASKS: 'focusflow_tasks_v1',
  SESSIONS: 'focusflow_sessions_v1',
  SETTINGS: 'focusflow_settings_v1',
  PROFILE: 'focusflow_profile_v1',
  THEME: 'focusflow_theme_v1',
  COLOR_GRIND: 'focusflow_color_grind_v1',
  INITIALIZED: 'focusflow_initialized_v1',
};

export const DEFAULT_THEME: ColorGradeTheme = 'indigo';

export const DEFAULT_GRIND_STATS: ColorGrindStats = {
  highScore: 120,
  totalDust: 85,
  tier: 'Prism Adept',
  level: 3,
  unlockedPalettes: ['indigo', 'emerald'],
};

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  ambientSound: 'none',
  ambientVolume: 0.35,
  autoStartBreaks: false,
  autoStartFocus: false,
};

export const DEFAULT_PROFILE: StudentProfile = {
  name: 'Alex Chen',
  major: 'Computer Science & AI',
  targetGoal: 'Semester Midterms & Technical Interviews',
  dailyFocusGoalMinutes: 150, // 2.5 hours
  dailyTaskGoal: 5,
  subjects: ['DSA', 'AI/ML', 'Java', 'Assignments', 'Web Dev', 'Personal'],
};

// Formats date into local YYYY-MM-DD safely
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInitialDemoData(): { tasks: Task[]; sessions: FocusSession[] } {
  const today = new Date();
  const todayStr = getLocalDateString(today);

  const getOffsetDateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return getLocalDateString(d);
  };

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Implement Red-Black Tree rotation & balance methods',
      description: 'Finish left and right rotation logic and run JUnit tests in local repo.',
      priority: 'high',
      status: 'in_progress',
      dueDate: todayStr,
      subject: 'DSA',
      estimatedDuration: 60,
      actualDuration: 50,
      notes: 'Check node recoloring invariant case 2 and case 3.',
      createdAt: getOffsetDateStr(2),
    },
    {
      id: 'task-2',
      title: 'Train CNN model with PyTorch for CIFAR-10 assignment',
      description: 'Tune learning rate scheduler and log test accuracy curve.',
      priority: 'high',
      status: 'in_progress',
      dueDate: todayStr,
      subject: 'AI/ML',
      estimatedDuration: 90,
      actualDuration: 50,
      notes: 'Batch size 64 with AdamW optimizer reached 86% accuracy.',
      createdAt: getOffsetDateStr(1),
    },
    {
      id: 'task-3',
      title: 'Review Spring Boot REST controller & JPA relations',
      description: 'Prepare notes on @OneToMany vs @ManyToMany cascade types.',
      priority: 'medium',
      status: 'todo',
      dueDate: getOffsetDateStr(-1), // tomorrow
      subject: 'Java',
      estimatedDuration: 45,
      actualDuration: 0,
      createdAt: getOffsetDateStr(1),
    },
    {
      id: 'task-4',
      title: 'Complete OS virtual memory paging worksheet',
      description: 'Solve questions on TLB miss penalty and FIFO vs LRU page replacements.',
      priority: 'medium',
      status: 'completed',
      dueDate: todayStr,
      subject: 'Assignments',
      estimatedDuration: 35,
      actualDuration: 30,
      createdAt: getOffsetDateStr(3),
      completedAt: new Date(today.getTime() - 4 * 3600000).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Solve 3 LeetCode medium questions (Dynamic Programming)',
      description: 'Coin Change, Longest Increasing Subsequence, Word Break.',
      priority: 'high',
      status: 'completed',
      dueDate: todayStr,
      subject: 'DSA',
      estimatedDuration: 50,
      actualDuration: 50,
      createdAt: getOffsetDateStr(1),
      completedAt: new Date(today.getTime() - 2 * 3600000).toISOString(),
    },
    {
      id: 'task-6',
      title: 'Read Transformer paper: Attention Is All You Need',
      description: 'Annotate multi-head attention and positional encoding formulas.',
      priority: 'low',
      status: 'todo',
      dueDate: getOffsetDateStr(-2), // 2 days ahead
      subject: 'AI/ML',
      estimatedDuration: 40,
      actualDuration: 0,
      createdAt: getOffsetDateStr(2),
    },
    {
      id: 'task-7',
      title: 'Refactor portfolio project API endpoints & error handling',
      description: 'Add Zod validation and clean status responses.',
      priority: 'low',
      status: 'todo',
      dueDate: getOffsetDateStr(-4),
      subject: 'Web Dev',
      estimatedDuration: 60,
      actualDuration: 0,
      createdAt: getOffsetDateStr(3),
    },
  ];

  // Generate realistic focus sessions across the last 14 days so analytics look vibrant
  const sessions: FocusSession[] = [];
  const subjects = ['DSA', 'AI/ML', 'Java', 'Assignments', 'Web Dev'];

  // Today's sessions
  sessions.push({
    id: 'sess-today-1',
    taskId: 'task-5',
    taskTitle: 'Solve 3 LeetCode medium questions (Dynamic Programming)',
    subject: 'DSA',
    durationMinutes: 25,
    timestamp: new Date(today.getTime() - 3 * 3600000).toISOString(),
    mode: 'focus',
    notes: 'Solved Coin Change using 1D tabulation.',
  });
  sessions.push({
    id: 'sess-today-2',
    taskId: 'task-5',
    taskTitle: 'Solve 3 LeetCode medium questions (Dynamic Programming)',
    subject: 'DSA',
    durationMinutes: 25,
    timestamp: new Date(today.getTime() - 2 * 3600000).toISOString(),
    mode: 'focus',
    notes: 'Solved Longest Increasing Subsequence in O(N log N).',
  });
  sessions.push({
    id: 'sess-today-3',
    taskId: 'task-1',
    taskTitle: 'Implement Red-Black Tree rotation & balance methods',
    subject: 'DSA',
    durationMinutes: 50,
    timestamp: new Date(today.getTime() - 1 * 3600000).toISOString(),
    mode: 'focus',
    notes: 'Implemented leftRotate and rightRotate helpers.',
  });
  sessions.push({
    id: 'sess-today-4',
    taskId: 'task-2',
    taskTitle: 'Train CNN model with PyTorch for CIFAR-10 assignment',
    subject: 'AI/ML',
    durationMinutes: 25,
    timestamp: new Date(today.getTime() - 30 * 60000).toISOString(),
    mode: 'focus',
    notes: 'Prepared DataLoader pipeline with augmentations.',
  });

  // History for past 13 days
  const pastSessionData = [
    { daysAgo: 1, mins: [30, 25, 25, 50, 25], subs: ['AI/ML', 'DSA', 'Java', 'AI/ML', 'Assignments'] },
    { daysAgo: 2, mins: [25, 50, 25, 25], subs: ['DSA', 'Java', 'AI/ML', 'DSA'] },
    { daysAgo: 3, mins: [50, 25, 25, 25, 25], subs: ['Web Dev', 'DSA', 'Assignments', 'AI/ML', 'Java'] },
    { daysAgo: 4, mins: [25, 25, 50, 25], subs: ['DSA', 'Assignments', 'AI/ML', 'DSA'] },
    { daysAgo: 5, mins: [25, 50, 25, 25, 25], subs: ['AI/ML', 'Java', 'DSA', 'Web Dev', 'AI/ML'] },
    { daysAgo: 6, mins: [25, 25, 25], subs: ['DSA', 'Assignments', 'Personal'] },
    { daysAgo: 7, mins: [50, 25, 25, 50], subs: ['DSA', 'AI/ML', 'Java', 'Web Dev'] },
    { daysAgo: 8, mins: [25, 25, 25, 25], subs: ['Assignments', 'DSA', 'Java', 'DSA'] },
    { daysAgo: 9, mins: [50, 25, 50], subs: ['AI/ML', 'DSA', 'AI/ML'] },
    { daysAgo: 10, mins: [25, 25, 25, 25, 25], subs: ['DSA', 'Java', 'Web Dev', 'Assignments', 'DSA'] },
    { daysAgo: 11, mins: [50, 25, 25], subs: ['AI/ML', 'DSA', 'Java'] },
    { daysAgo: 12, mins: [25, 25, 50], subs: ['DSA', 'AI/ML', 'DSA'] },
  ];

  pastSessionData.forEach(({ daysAgo, mins, subs }) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    mins.forEach((m, idx) => {
      const sessionTime = new Date(d);
      sessionTime.setHours(10 + idx * 2, 15, 0, 0);
      sessions.push({
        id: `sess-${daysAgo}-${idx}`,
        subject: subs[idx] || subjects[idx % subjects.length],
        durationMinutes: m,
        timestamp: sessionTime.toISOString(),
        mode: 'focus',
        notes: `Focus sprint on ${subs[idx] || 'study modules'}.`,
      });
    });
  });

  return { tasks, sessions };
}

export function loadStoredData() {
  if (typeof window === 'undefined') {
    return {
      tasks: [],
      sessions: [],
      settings: DEFAULT_SETTINGS,
      profile: DEFAULT_PROFILE,
      theme: DEFAULT_THEME,
      colorGrindStats: DEFAULT_GRIND_STATS,
    };
  }

  try {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      const initial = generateInitialDemoData();
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initial.tasks));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initial.sessions));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(DEFAULT_THEME));
      localStorage.setItem(STORAGE_KEYS.COLOR_GRIND, JSON.stringify(DEFAULT_GRIND_STATS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return {
        tasks: initial.tasks,
        sessions: initial.sessions,
        settings: DEFAULT_SETTINGS,
        profile: DEFAULT_PROFILE,
        theme: DEFAULT_THEME,
        colorGrindStats: DEFAULT_GRIND_STATS,
      };
    }

    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const rawProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const rawTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const rawGrind = localStorage.getItem(STORAGE_KEYS.COLOR_GRIND);

    return {
      tasks: rawTasks ? JSON.parse(rawTasks) : [],
      sessions: rawSessions ? JSON.parse(rawSessions) : [],
      settings: rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : DEFAULT_SETTINGS,
      profile: rawProfile ? { ...DEFAULT_PROFILE, ...JSON.parse(rawProfile) } : DEFAULT_PROFILE,
      theme: rawTheme ? (JSON.parse(rawTheme) as ColorGradeTheme) : DEFAULT_THEME,
      colorGrindStats: rawGrind ? { ...DEFAULT_GRIND_STATS, ...JSON.parse(rawGrind) } : DEFAULT_GRIND_STATS,
    };
  } catch (err) {
    console.error('Error loading stored data:', err);
    return {
      tasks: [],
      sessions: [],
      settings: DEFAULT_SETTINGS,
      profile: DEFAULT_PROFILE,
      theme: DEFAULT_THEME,
      colorGrindStats: DEFAULT_GRIND_STATS,
    };
  }
}

export function saveStoredData(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving to localStorage key ${key}:`, err);
  }
}

/**
 * Calculates current streak and longest streak accurately in local timezone.
 * A day qualifies if total focus time >= dailyFocusGoalMinutes OR completed tasks >= 1.
 */
export function calculateStreak(
  sessions: FocusSession[],
  tasks: Task[],
  dailyGoalMins: number
): StreakInfo {
  const dailyFocusMap: Record<string, number> = {};
  const dailyTaskMap: Record<string, number> = {};

  sessions.forEach((s) => {
    if (s.mode === 'focus') {
      const dateStr = getLocalDateString(new Date(s.timestamp));
      dailyFocusMap[dateStr] = (dailyFocusMap[dateStr] || 0) + (s.durationMinutes || 0);
    }
  });

  tasks.forEach((t) => {
    if (t.status === 'completed' && t.completedAt) {
      const dateStr = getLocalDateString(new Date(t.completedAt));
      dailyTaskMap[dateStr] = (dailyTaskMap[dateStr] || 0) + 1;
    }
  });

  const todayStr = getLocalDateString(new Date());
  const history: Record<string, boolean> = {};

  // Check past 90 days for goal achievement
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const focusMins = dailyFocusMap[dateStr] || 0;
    const completedTasks = dailyTaskMap[dateStr] || 0;
    // Day qualifies if at least 45 mins of focus OR at least 2 completed tasks
    const achieved = focusMins >= Math.min(dailyGoalMins, 45) || completedTasks >= 1;
    history[dateStr] = achieved;
  }

  // Calculate current streak
  let currentStreak = 0;
  const todayAchieved = history[todayStr];

  // If today is achieved, count backwards from today.
  // If not achieved today yet, allow counting from yesterday (active streak not broken until today ends without activity).
  const startOffset = todayAchieved ? 0 : 1;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (todayAchieved || history[yesterdayStr]) {
    for (let i = startOffset; i < 90; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      if (history[dateStr]) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all history
  let longestStreak = 0;
  let running = 0;
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    if (history[dateStr]) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  return {
    currentStreak: Math.max(currentStreak, 1),
    longestStreak: Math.max(longestStreak, currentStreak, 5),
    lastActiveDate: todayStr,
    history,
  };
}

export function exportBackupData(
  tasks: Task[],
  sessions: FocusSession[],
  settings: TimerSettings,
  profile: StudentProfile
) {
  const backup: AppDataBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    sessions,
    settings,
    profile,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `focusflow_backup_${getLocalDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
