export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // ISO string or YYYY-MM-DD
  subject: string; // e.g., 'DSA', 'AI/ML', 'Java', 'Assignments', 'Personal'
  estimatedDuration: number; // in minutes
  actualDuration?: number; // accumulated focus minutes
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  subject: string;
  durationMinutes: number; // completed duration in minutes
  timestamp: string; // ISO string
  mode: TimerMode;
  notes?: string;
}

export interface TimerSettings {
  focusDuration: number; // in minutes, e.g., 25
  shortBreakDuration: number; // in minutes, e.g., 5
  longBreakDuration: number; // in minutes, e.g., 15
  sessionsUntilLongBreak: number; // e.g., 4
  soundEnabled: boolean;
  ambientSound: 'none' | 'rain' | 'whitenoise' | 'cafe' | 'waves';
  ambientVolume: number; // 0 to 1
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface StudentProfile {
  name: string;
  major: string;
  targetGoal: string;
  dailyFocusGoalMinutes: number; // e.g., 180 min
  dailyTaskGoal: number; // e.g., 5 tasks
  subjects: string[];
}

export interface DayStats {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  completedTasks: number;
  sessionsCount: number;
  goalMet: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  history: Record<string, boolean>; // date -> goal achieved
}

export type ColorGradeTheme = 'indigo' | 'emerald' | 'sunset' | 'cyber' | 'ocean' | 'obsidian';

export interface ColorGrindStats {
  highScore: number;
  totalDust: number;
  tier: string;
  level: number;
  unlockedPalettes: ColorGradeTheme[];
}

export interface AppDataBackup {
  version: number;
  exportedAt: string;
  tasks: Task[];
  sessions: FocusSession[];
  settings: TimerSettings;
  profile: StudentProfile;
  colorGradeTheme?: ColorGradeTheme;
  colorGrindStats?: ColorGrindStats;
}

export type NavigationTab = 'dashboard' | 'tasks' | 'timer' | 'analytics' | 'colorgrind' | 'settings';
