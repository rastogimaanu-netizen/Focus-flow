import { ColorGradeTheme } from '../types';

export interface ThemePreset {
  id: ColorGradeTheme;
  name: string;
  description: string;
  primaryHex: string;
  secondaryHex: string;
  accentBg: string;
  accentHoverBg: string;
  accentText: string;
  lightBg: string;
  lightBorder: string;
  bannerGradient: string;
  ringColor: string;
  requiredDust: number;
}

export const THEME_PRESETS: Record<ColorGradeTheme, ThemePreset> = {
  indigo: {
    id: 'indigo',
    name: 'Violet Flow',
    description: 'Vivid violet & deep indigo harmony for steady focus',
    primaryHex: '#6366F1',
    secondaryHex: '#8B5CF6',
    accentBg: 'bg-indigo-600',
    accentHoverBg: 'hover:bg-indigo-700',
    accentText: 'text-indigo-600',
    lightBg: 'bg-indigo-50/80',
    lightBorder: 'border-indigo-100',
    bannerGradient: 'from-indigo-700 via-indigo-600 to-violet-600',
    ringColor: '#6366F1',
    requiredDust: 0,
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Meadow',
    description: 'Calming mint & forest green for reduced cognitive fatigue',
    primaryHex: '#059669',
    secondaryHex: '#10B981',
    accentBg: 'bg-emerald-600',
    accentHoverBg: 'hover:bg-emerald-700',
    accentText: 'text-emerald-600',
    lightBg: 'bg-emerald-50/80',
    lightBorder: 'border-emerald-100',
    bannerGradient: 'from-emerald-800 via-emerald-700 to-teal-600',
    ringColor: '#059669',
    requiredDust: 50,
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Amber',
    description: 'Energizing coral & warm golden amber for intense sprints',
    primaryHex: '#EA580C',
    secondaryHex: '#F59E0B',
    accentBg: 'bg-amber-600',
    accentHoverBg: 'hover:bg-amber-700',
    accentText: 'text-amber-600',
    lightBg: 'bg-amber-50/80',
    lightBorder: 'border-amber-100',
    bannerGradient: 'from-orange-600 via-amber-600 to-rose-600',
    ringColor: '#EA580C',
    requiredDust: 100,
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Cyan',
    description: 'Deep azure & sky blue for clear analytical clarity',
    primaryHex: '#0284C7',
    secondaryHex: '#06B6D4',
    accentBg: 'bg-sky-600',
    accentHoverBg: 'hover:bg-sky-700',
    accentText: 'text-sky-600',
    lightBg: 'bg-sky-50/80',
    lightBorder: 'border-sky-100',
    bannerGradient: 'from-sky-700 via-cyan-700 to-blue-700',
    ringColor: '#0284C7',
    requiredDust: 150,
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Prism',
    description: 'Electric fuchsia & neon violet for late-night hackathons',
    primaryHex: '#D946EF',
    secondaryHex: '#A855F7',
    accentBg: 'bg-fuchsia-600',
    accentHoverBg: 'hover:bg-fuchsia-700',
    accentText: 'text-fuchsia-600',
    lightBg: 'bg-fuchsia-50/80',
    lightBorder: 'border-fuchsia-100',
    bannerGradient: 'from-fuchsia-700 via-purple-700 to-indigo-700',
    ringColor: '#D946EF',
    requiredDust: 250,
  },
  obsidian: {
    id: 'obsidian',
    name: 'OLED Obsidian',
    description: 'Deep midnight slate with luminescent high-contrast accents',
    primaryHex: '#64748B',
    secondaryHex: '#94A3B8',
    accentBg: 'bg-slate-800',
    accentHoverBg: 'hover:bg-slate-900',
    accentText: 'text-slate-800',
    lightBg: 'bg-slate-100',
    lightBorder: 'border-slate-200',
    bannerGradient: 'from-slate-900 via-slate-800 to-zinc-900',
    ringColor: '#475569',
    requiredDust: 400,
  },
};
