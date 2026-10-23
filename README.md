# FocusFlow — Your Day, In Flow

FocusFlow is a student productivity dashboard engineered to help university and high-school students plan coursework, study in distraction-free Pomodoro sprints with ambient soundscapes, maintain daily study streaks, and understand their learning habits with visual analytics.

## Core Features

- **Personalized Daily Dashboard**:
  - Live greeting and formatted calendar display
  - Interactive SVG progress ring tracking completed vs planned tasks
  - 4 key metrics: Tasks completed, focus time logged today, daily completion %, and current study streak
  - Quick-add study task input and priority indicators
  - 7-day weekly focus time trend chart
  - Recent focus sessions log

- **Daily Task Planner**:
  - Coursework categorization (DSA, AI/ML, Java, Assignments, Web Dev, Personal, and custom subjects)
  - Priority levels (High, Medium, Low) with semantic cues
  - Status lifecycle (To Do, In Progress, Completed) with instant reopening
  - Due date tracking with automatic overdue detection
  - Instant live search, multi-criteria filtering, and sorting (by due date, priority, or duration)
  - One-click launch into the Focus Room linked to any specific task

- **Focus Room (Pomodoro Mode)**:
  - 25m focus / 5m short break / 15m long break cycles (with customizable intervals)
  - Animated high-resolution circular countdown timer
  - Drift-proof elapsed time measurement using `Date.now()` timestamp deltas (accurate across background tabs and system sleeps)
  - Built-in Web Audio procedural ambient sound generator (Rain, Waves, White Noise, Soft Café) with zero external network dependencies
  - Harmonious 528Hz Solfeggio session-completion chime (with mute toggle)
  - Distraction-free Zen Fullscreen Mode

- **Productivity & Study Analytics**:
  - Interactive Recharts data visualizations (Area trend, Subject distribution donut, and Planned vs Actual hours)
  - 30-Day Activity Heatmap tracking study intensity and consistency
  - Dynamic rule-based insights calculated from real data (most productive weekday, top subject investment, sprint averages)
  - Date range filters: Last 7 Days, Last 30 Days, All Time

- **Streak Tracking & Daily Goals**:
  - Configurable daily focus goal (e.g. 150 minutes) and daily completed tasks target
  - Local timezone-safe streak calculator (no UTC day-boundary drift)
  - Celebratory confetti animations when finishing tasks or reaching daily goals

- **Private & Persistent Local Storage**:
  - 100% client-side persistence using browser localStorage (no paid API keys or external databases required)
  - One-click JSON backup export and import with structure validation
  - Sample dataset loader and safe reset options

---

## Deploying to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of FocusFlow"
   git remote add origin https://github.com/<your-username>/focusflow.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your `focusflow` repository.
   - Vercel will automatically detect **Vite** as the framework preset:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Click **Deploy**.

3. **Production Verification**:
   - The build will finish in under 30 seconds.
   - All client storage, Web Audio sound generators, and interactive charts run immediately out of the box with zero environment variables needed.
