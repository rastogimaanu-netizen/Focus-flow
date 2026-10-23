import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Award, ArrowLeft, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Color Palette for Color Grind
const GRIND_COLORS = [
  { id: 'violet', name: 'Violet', hex: '#8B5CF6', light: '#DDD6FE', score: 10 },
  { id: 'cyan', name: 'Cyan', hex: '#06B6D4', light: '#CFFAFE', score: 10 },
  { id: 'emerald', name: 'Emerald', hex: '#10B981', light: '#D1FAE5', score: 10 },
  { id: 'gold', name: 'Gold Pulse', hex: '#F59E0B', light: '#FEF3C7', score: 25 },
];

export const ColorGrindGame: React.FC = () => {
  const { colorGrindStats, recordColorGrindScore, setActiveTab } = useApp();

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover'>('title');
  const [score, setScore] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);
  const [colorDustEarned, setColorDustEarned] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio Synth for Arcade
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSynthSound = useCallback((type: 'catch' | 'miss' | 'switch' | 'levelup' | 'gold') => {
    if (soundMuted || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'catch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else if (type === 'gold') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.exponentialRampToValueAtTime(1174, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      } else if (type === 'switch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      } else if (type === 'miss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      } else if (type === 'levelup') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(783, now + 0.16);
        osc.frequency.setValueAtTime(1046, now + 0.24);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio fallback
    }
  }, [soundMuted]);

  // Game Engine Mutable State Ref (isolated from React renders)
  const engineRef = useRef({
    playerX: 0,
    targetX: 0,
    playerWidth: 90,
    playerHeight: 22,
    activeColorIdx: 0,
    orbs: [] as Array<{
      x: number;
      y: number;
      radius: number;
      colorIdx: number;
      speedY: number;
      pulse: number;
    }>,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }>,
    lives: 3,
    score: 0,
    combo: 0,
    multiplier: 1,
    colorDust: 0,
    screenShake: 0,
    lastTime: 0,
    spawnTimer: 0,
    spawnInterval: 1.1,
    difficulty: 1,
    keys: { left: false, right: false },
  });

  // Start game function
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 800;
    const height = canvas ? canvas.height : 600;

    engineRef.current = {
      playerX: width / 2,
      targetX: width / 2,
      playerWidth: 96,
      playerHeight: 24,
      activeColorIdx: 0,
      orbs: [],
      particles: [],
      lives: 3,
      score: 0,
      combo: 0,
      multiplier: 1,
      colorDust: 0,
      screenShake: 0,
      lastTime: performance.now(),
      spawnTimer: 0,
      spawnInterval: 1.1,
      difficulty: 1,
      keys: { left: false, right: false },
    };

    setScore(0);
    setMultiplier(1);
    setCombo(0);
    setColorDustEarned(0);
    setGameState('playing');
    playSynthSound('switch');
  }, [playSynthSound]);

  // Main 60fps game loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        engineRef.current.keys.left = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        engineRef.current.keys.right = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'title') {
          startGame();
        } else if (gameState === 'playing') {
          // Cycle active color
          engineRef.current.activeColorIdx = (engineRef.current.activeColorIdx + 1) % 3;
          playSynthSound('switch');
        }
      }
      if (e.code === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
          engineRef.current.lastTime = performance.now();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        engineRef.current.keys.left = false;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        engineRef.current.keys.right = false;
      }
    };

    // Mouse / Touch control
    const onPointerMove = (e: PointerEvent) => {
      if (gameState !== 'playing') return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      engineRef.current.targetX = Math.max(
        engineRef.current.playerWidth / 2,
        Math.min(rect.width - engineRef.current.playerWidth / 2, x)
      );
    };

    const onPointerDown = () => {
      if (gameState === 'playing') {
        engineRef.current.activeColorIdx = (engineRef.current.activeColorIdx + 1) % 3;
        playSynthSound('switch');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', () => {
      engineRef.current.keys.left = false;
      engineRef.current.keys.right = false;
    });
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);

    // Animation loop
    const loop = (currentTime: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const rawDt = (currentTime - engineRef.current.lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05);
      engineRef.current.lastTime = currentTime;

      // Handle screen shake
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (engineRef.current.screenShake > 0) {
        shakeOffsetX = (Math.random() - 0.5) * engineRef.current.screenShake * 12;
        shakeOffsetY = (Math.random() - 0.5) * engineRef.current.screenShake * 12;
        engineRef.current.screenShake = Math.max(0, engineRef.current.screenShake - dt * 4);
      }

      ctx.save();
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // Draw background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#0F172A');
      bgGradient.addColorStop(1, '#1E1B4B');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(-20, -20, width + 40, height + 40);

      // Draw subtle background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (gameState === 'playing') {
        const eng = engineRef.current;

        // Player movement
        const moveSpeed = 500 * dt;
        if (eng.keys.left) {
          eng.targetX -= moveSpeed;
        }
        if (eng.keys.right) {
          eng.targetX += moveSpeed;
        }
        eng.targetX = Math.max(eng.playerWidth / 2, Math.min(width - eng.playerWidth / 2, eng.targetX));
        eng.playerX += (eng.targetX - eng.playerX) * 0.25;

        // Spawning Orbs
        eng.spawnTimer += dt;
        if (eng.spawnTimer >= eng.spawnInterval) {
          eng.spawnTimer = 0;
          eng.difficulty += 0.04;
          eng.spawnInterval = Math.max(0.45, 1.1 - eng.difficulty * 0.06);

          // 15% chance of Gold wild orb
          const isGold = Math.random() < 0.15;
          const colorIdx = isGold ? 3 : Math.floor(Math.random() * 3);
          const orbRadius = isGold ? 17 : 14;

          eng.orbs.push({
            x: Math.random() * (width - 80) + 40,
            y: -20,
            radius: orbRadius,
            colorIdx,
            speedY: (180 + Math.random() * 80) * (1 + eng.difficulty * 0.1),
            pulse: 0,
          });
        }

        // Update Orbs
        const playerY = height - 60;
        for (let i = eng.orbs.length - 1; i >= 0; i--) {
          const orb = eng.orbs[i];
          orb.y += orb.speedY * dt;
          orb.pulse += dt * 4;

          // Check Catch by player
          const hitX = Math.abs(orb.x - eng.playerX) < eng.playerWidth / 2 + orb.radius;
          const hitY = orb.y + orb.radius >= playerY && orb.y - orb.radius <= playerY + eng.playerHeight;

          if (hitX && hitY) {
            const isMatch = orb.colorIdx === 3 || orb.colorIdx === eng.activeColorIdx;
            if (isMatch) {
              // Successful catch
              const pts = (GRIND_COLORS[orb.colorIdx].score || 10) * eng.multiplier;
              eng.score += pts;
              eng.combo += 1;
              eng.colorDust += orb.colorIdx === 3 ? 3 : 1;

              if (eng.combo % 5 === 0 && eng.multiplier < 5) {
                eng.multiplier += 1;
                playSynthSound('levelup');
              } else if (orb.colorIdx === 3) {
                playSynthSound('gold');
              } else {
                playSynthSound('catch');
              }

              // Spawn particles
              const pColor = GRIND_COLORS[orb.colorIdx].hex;
              for (let p = 0; p < 12; p++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 60 + Math.random() * 120;
                eng.particles.push({
                  x: orb.x,
                  y: playerY,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd - 60,
                  life: 0.4 + Math.random() * 0.2,
                  maxLife: 0.6,
                  color: pColor,
                  size: 3 + Math.random() * 3,
                });
              }

              eng.orbs.splice(i, 1);
              continue;
            } else {
              // Mismatch: Lose life & reset combo
              eng.lives -= 1;
              eng.combo = 0;
              eng.multiplier = 1;
              eng.screenShake = 1;
              playSynthSound('miss');

              eng.orbs.splice(i, 1);
              if (eng.lives <= 0) {
                // Game Over
                setGameState('gameover');
                recordColorGrindScore(eng.score, eng.colorDust);
                break;
              }
              continue;
            }
          }

          // Missed falling past screen
          if (orb.y > height + 20) {
            eng.orbs.splice(i, 1);
            if (eng.combo > 0) {
              eng.combo = 0;
              eng.multiplier = 1;
            }
          }
        }

        // Sync HUD
        setScore(eng.score);
        setMultiplier(eng.multiplier);
        setCombo(eng.combo);
        setColorDustEarned(eng.colorDust);

        // Update Particles
        for (let i = eng.particles.length - 1; i >= 0; i--) {
          const pt = eng.particles[i];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vy += 280 * dt; // gravity
          pt.life -= dt;
          if (pt.life <= 0) {
            eng.particles.splice(i, 1);
          }
        }
      }

      // DRAW PARTICLES
      for (const pt of engineRef.current.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // DRAW FALLING ORBS
      for (const orb of engineRef.current.orbs) {
        const c = GRIND_COLORS[orb.colorIdx];
        const pulseScale = 1 + Math.sin(orb.pulse) * 0.08;

        // Outer glow
        ctx.save();
        ctx.shadowColor = c.hex;
        ctx.shadowBlur = 12;
        ctx.fillStyle = c.hex;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * pulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Inner shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(orb.x - orb.radius * 0.3, orb.y - orb.radius * 0.3, orb.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // DRAW PLAYER PRISM COLLECTOR
      if (gameState === 'playing' || gameState === 'paused') {
        const eng = engineRef.current;
        const playerY = height - 60;
        const activeColor = GRIND_COLORS[eng.activeColorIdx];

        ctx.save();
        // Glow
        ctx.shadowColor = activeColor.hex;
        ctx.shadowBlur = 18;

        // Base paddle
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.roundRect(eng.playerX - eng.playerWidth / 2, playerY, eng.playerWidth, eng.playerHeight, 8);
        ctx.fill();

        // Active color prism core
        ctx.fillStyle = activeColor.hex;
        ctx.beginPath();
        ctx.roundRect(eng.playerX - eng.playerWidth / 2 + 4, playerY + 4, eng.playerWidth - 8, eng.playerHeight - 8, 5);
        ctx.fill();

        // High gloss strip
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(eng.playerX - eng.playerWidth / 2 + 6, playerY + 5, eng.playerWidth - 12, 3);
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [gameState, recordColorGrindScore, playSynthSound, startGame]);

  return (
    <div className="relative w-full h-[calc(100vh-6rem)] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* 60fps Isolated Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-crosshair touch-none" />

      {/* World-Matched, Low-Occlusion UI Overlay (85% playfield unobstructed) */}
      <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
        {/* Left: Score & Multiplier */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="pointer-events-auto p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-4">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
              <div className="text-xl font-extrabold text-white tabular-nums tracking-tight">{score}</div>
            </div>

            <div className="pl-3 border-l border-slate-800">
              <div className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Combo
              </div>
              <div className="text-sm font-bold text-indigo-300 tabular-nums">
                {combo}x <span className="text-xs text-slate-400">({multiplier}x Multiplier)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Color Dust (Grind XP) & Audio Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Color Dust</div>
              <div className="text-sm font-bold text-amber-300 tabular-nums">+{colorDustEarned}</div>
            </div>
          </div>

          <button
            onClick={() => setSoundMuted((prev) => !prev)}
            className="pointer-events-auto p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={soundMuted ? 'Unmute Game Synth' : 'Mute Game Synth'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-950/70 backdrop-blur-xs">
          {/* Bespoke Inline SVG Title Lockup */}
          <div className="mb-4">
            <svg width="220" height="60" viewBox="0 0 220 60" className="mx-auto">
              <defs>
                <linearGradient id="grindGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <text
                x="110"
                y="38"
                textAnchor="middle"
                fontSize="32"
                fontWeight="900"
                fontFamily="system-ui"
                fill="url(#grindGrad)"
                letterSpacing="2"
              >
                COLOR GRIND
              </text>
            </svg>
            <div className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mt-1">
              Reflex Study-Break Arcade
            </div>
          </div>

          <p className="max-w-md text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
            Grind color pigments to boost concentration, reset your mind between study blocks, and unlock exclusive
            dashboard color themes!
          </p>

          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-sm shadow-xl flex items-center gap-2.5 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Grinding</span>
          </button>

          {/* Single Flat Control-Hint Line */}
          <div className="mt-8 text-xs text-slate-400 font-medium">
            <span>A/D or Mouse Move</span>
            <span className="mx-2">·</span>
            <span>Space / Click Cycle Prism</span>
            <span className="mx-2">·</span>
            <span>Esc Pause</span>
          </div>

          <div className="mt-4 text-[11px] text-slate-500">
            Current High Score:{' '}
            <span className="text-indigo-300 font-bold tabular-nums">{colorGrindStats.highScore}</span> · Total Color
            Dust: <span className="text-amber-400 font-bold tabular-nums">{colorGrindStats.totalDust}</span>
          </div>
        </div>
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Game Paused</h2>
            <p className="text-xs text-slate-400 mb-6">Take a breath, stretch, and resume when ready.</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setGameState('playing');
                  engineRef.current.lastTime = performance.now();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Resume
              </button>
              <button
                onClick={startGame}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
              >
                Restart
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white font-semibold text-xs"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-950/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-white mb-1">Session Complete!</h2>
            <p className="text-xs text-slate-400 mb-6">Great reflex workout! Dust added to your account.</p>

            <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 mb-6 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Final Score:</span>
                <span className="font-bold text-white tabular-nums">{score}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Color Dust Ground:</span>
                <span className="font-bold text-amber-400 tabular-nums">+{colorDustEarned}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Stored Dust:</span>
                <span className="font-bold text-indigo-300 tabular-nums">
                  {colorGrindStats.totalDust + colorDustEarned}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startGame}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
              >
                Check Palette Unlocks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
