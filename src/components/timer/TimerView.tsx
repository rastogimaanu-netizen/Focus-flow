import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  CheckCircle2,
  BookOpen,
  Headphones,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimerMode } from '../../types';
import { ambientAudio } from '../../utils/audio';

import { THEME_PRESETS } from '../../utils/theme';

export const TimerView: React.FC = () => {
  const {
    settings,
    updateSettings,
    tasks,
    selectedTaskForTimer,
    setSelectedTaskForTimer,
    recordSession,
    profile,
    colorGradeTheme,
  } = useApp();

  const currentTheme = THEME_PRESETS[colorGradeTheme] || THEME_PRESETS.indigo;

  const [mode, setMode] = useState<TimerMode>('focus');
  const [sessionCount, setSessionCount] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'whitenoise' | 'cafe' | 'waves'>(
    settings.ambientSound || 'none'
  );

  // Duration in seconds for current mode
  const getModeDurationSeconds = useCallback(
    (targetMode: TimerMode) => {
      switch (targetMode) {
        case 'focus':
          return settings.focusDuration * 60;
        case 'shortBreak':
          return settings.shortBreakDuration * 60;
        case 'longBreak':
          return settings.longBreakDuration * 60;
      }
    },
    [settings]
  );

  const [totalSeconds, setTotalSeconds] = useState<number>(getModeDurationSeconds('focus'));
  const [remainingSeconds, setRemainingSeconds] = useState<number>(getModeDurationSeconds('focus'));

  // Ref to track start timestamp and accumulated elapsed seconds for background tab accuracy
  const timerStartTimestampRef = useRef<number | null>(null);
  const accumulatedElapsedRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Update totalSeconds if mode or durations change while NOT running
  useEffect(() => {
    if (!isRunning) {
      const dur = getModeDurationSeconds(mode);
      setTotalSeconds(dur);
      setRemainingSeconds(dur);
      accumulatedElapsedRef.current = 0;
      timerStartTimestampRef.current = null;
    }
  }, [mode, settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, getModeDurationSeconds, isRunning]);

  // Handle ambient background sound
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      ambientAudio.play(ambientSound, settings.ambientVolume);
    } else {
      ambientAudio.stop();
    }
    return () => {
      ambientAudio.stop();
    };
  }, [isRunning, ambientSound, settings.ambientVolume]);

  // Session completion handler
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    timerStartTimestampRef.current = null;
    accumulatedElapsedRef.current = 0;

    // Record session if in focus mode
    if (mode === 'focus') {
      const durationMins = settings.focusDuration;
      const targetSubject = selectedTaskForTimer?.subject || profile.subjects[0] || 'DSA';

      recordSession({
        durationMinutes: durationMins,
        subject: targetSubject,
        mode: 'focus',
        taskId: selectedTaskForTimer?.id,
        taskTitle: selectedTaskForTimer?.title,
      });

      // Next mode logic
      if (sessionCount >= settings.sessionsUntilLongBreak) {
        setMode('longBreak');
        setSessionCount(1);
      } else {
        setMode('shortBreak');
        setSessionCount((prev) => prev + 1);
      }
    } else {
      // Break finished, return to focus mode
      setMode('focus');
    }
  }, [
    mode,
    settings.focusDuration,
    settings.sessionsUntilLongBreak,
    selectedTaskForTimer,
    profile.subjects,
    recordSession,
    sessionCount,
  ]);

  // High accuracy timestamp-based timer loop
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    timerStartTimestampRef.current = Date.now();

    const checkTimer = () => {
      if (!timerStartTimestampRef.current) return;
      const now = Date.now();
      const currentSegmentElapsed = (now - timerStartTimestampRef.current) / 1000;
      const totalElapsed = accumulatedElapsedRef.current + currentSegmentElapsed;
      const newRemaining = Math.max(0, Math.ceil(totalSeconds - totalElapsed));

      setRemainingSeconds(newRemaining);

      if (newRemaining <= 0) {
        handleSessionComplete();
      } else {
        animationFrameRef.current = requestAnimationFrame(checkTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(checkTimer);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, totalSeconds, handleSessionComplete]);

  // Start / Pause toggle
  const togglePlayPause = () => {
    if (isRunning) {
      // Pausing: accumulate elapsed
      if (timerStartTimestampRef.current) {
        const now = Date.now();
        accumulatedElapsedRef.current += (now - timerStartTimestampRef.current) / 1000;
        timerStartTimestampRef.current = null;
      }
      setIsRunning(false);
    } else {
      // Resuming / Starting
      timerStartTimestampRef.current = Date.now();
      setIsRunning(true);
    }
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    accumulatedElapsedRef.current = 0;
    timerStartTimestampRef.current = null;
    const dur = getModeDurationSeconds(mode);
    setRemainingSeconds(dur);
  };

  // Skip current mode
  const handleSkip = () => {
    setIsRunning(false);
    accumulatedElapsedRef.current = 0;
    timerStartTimestampRef.current = null;
    if (mode === 'focus') {
      setMode(sessionCount >= settings.sessionsUntilLongBreak ? 'longBreak' : 'shortBreak');
    } else {
      setMode('focus');
    }
  };

  // Switch mode directly
  const switchMode = (newMode: TimerMode) => {
    if (isRunning) {
      const confirmSwitch = window.confirm('Switching modes will reset current session progress. Continue?');
      if (!confirmSwitch) return;
    }
    setIsRunning(false);
    accumulatedElapsedRef.current = 0;
    timerStartTimestampRef.current = null;
    setMode(newMode);
  };

  // Time format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // SVG Progress Ring
  const progressRatio = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      className={`space-y-6 transition-all duration-300 ${
        isZenMode ? 'fixed inset-0 z-50 bg-[#0F172A] text-white p-6 sm:p-12 overflow-y-auto flex flex-col justify-center' : 'pb-12'
      }`}
    >
      {/* Top Bar inside Timer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isZenMode ? 'text-white' : 'text-slate-900'}`}>
            Focus Room
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isZenMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Distraction-free environment with ambient audio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zen Mode Button */}
          <button
            onClick={() => setIsZenMode((prev) => !prev)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              isZenMode
                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Fullscreen'}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isZenMode ? 'Exit Zen' : 'Zen Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Focus Card */}
      <div
        className={`rounded-3xl border transition-all relative overflow-hidden ${
          isZenMode
            ? 'bg-slate-900/90 border-slate-800 shadow-2xl p-8 max-w-2xl mx-auto w-full'
            : 'bg-white border-slate-200/80 shadow-xs p-6 sm:p-10'
        }`}
      >
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`flex items-center gap-1 p-1 rounded-2xl border ${
              isZenMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200/60'
            }`}
          >
            <button
              onClick={() => switchMode('focus')}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'focus'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isZenMode
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Focus ({settings.focusDuration}m)
            </button>

            <button
              onClick={() => switchMode('shortBreak')}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'shortBreak'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isZenMode
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Short Break ({settings.shortBreakDuration}m)
            </button>

            <button
              onClick={() => switchMode('longBreak')}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'longBreak'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isZenMode
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Long Break ({settings.longBreakDuration}m)
            </button>
          </div>
        </div>

        {/* Circular Countdown Progress */}
        <div className="relative flex flex-col items-center justify-center my-6">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
              {/* Background track */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                className={isZenMode ? 'stroke-slate-800' : 'stroke-slate-100'}
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                className="transition-all duration-300"
                style={{
                  stroke:
                    mode === 'focus'
                      ? currentTheme.ringColor
                      : mode === 'shortBreak'
                      ? '#10B981'
                      : '#0EA5E9',
                }}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div
                className={`text-xs font-semibold uppercase tracking-widest ${
                  isZenMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {mode === 'focus' ? 'Deep Work' : mode === 'shortBreak' ? 'Rest & Stretch' : 'Recharge'}
              </div>

              <div
                className={`text-5xl sm:text-6xl font-extrabold tracking-tight tabular-nums my-2 ${
                  isZenMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {formatTime(remainingSeconds)}
              </div>

              <div className="text-xs font-medium text-slate-500 mt-1">
                Session <span className="font-bold text-indigo-600">{sessionCount}</span> of{' '}
                {settings.sessionsUntilLongBreak}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleReset}
            className={`p-3.5 rounded-2xl border transition-colors ${
              isZenMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlayPause}
            className={`px-8 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-md active:scale-95 transition-all text-white ${
              mode === 'focus'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : mode === 'shortBreak'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{remainingSeconds < totalSeconds ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className={`p-3.5 rounded-2xl border transition-colors ${
              isZenMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Skip to next session"
            aria-label="Skip to next session"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Linked Task Selector */}
        <div className="mt-8 pt-6 border-t border-slate-100 max-w-md mx-auto">
          <label
            className={`block text-xs font-semibold mb-2 text-center ${
              isZenMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Link Focus Session to a Task
          </label>
          <select
            value={selectedTaskForTimer?.id || ''}
            onChange={(e) => {
              const taskId = e.target.value;
              const found = tasks.find((t) => t.id === taskId);
              setSelectedTaskForTimer(found || null);
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition-all ${
              isZenMode
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
            }`}
          >
            <option value="">General Study (No Specific Task)</option>
            {tasks
              .filter((t) => t.status !== 'completed')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.subject}] {t.title}
                </option>
              ))}
          </select>
        </div>

        {/* Ambient Sound Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
            <Headphones className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold">Ambience:</span>
          </div>

          {[
            { id: 'none', label: 'Off' },
            { id: 'rain', label: 'Rain' },
            { id: 'whitenoise', label: 'White Noise' },
            { id: 'waves', label: 'Waves' },
            { id: 'cafe', label: 'Café' },
          ].map((snd) => (
            <button
              key={snd.id}
              onClick={() => {
                const nextType = snd.id as any;
                setAmbientSound(nextType);
                updateSettings({ ambientSound: nextType });
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                ambientSound === snd.id
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                  : isZenMode
                  ? 'border-slate-800 text-slate-400 hover:text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {snd.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
