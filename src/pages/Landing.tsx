import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useUserStore } from '../store/useUserStore';
import confetti from 'canvas-confetti';

const ORBITAL_PLANETS_DATA = [
  { id: 'P1', radiusX: 200, radiusY: 90,  speed: 0.012, label: 'ACCURACY TREND',     value: '89.4%',            subtitle: '89.4% SKILL STABILITY',  details: 'Dynamic vector graph tracking overall answer accuracy.',                       zIndex: 10 },
  { id: 'P2', radiusX: 280, radiusY: 120, speed: 0.009, label: 'DAILY MISSION',       value: '5 CONCEPTS',       subtitle: 'ACTIVE RUNTIME TASK',     details: 'Master 5 concepts in DBMS Relational Normal Forms to bridge the gap.',       zIndex: 20 },
  { id: 'P3', radiusX: 360, radiusY: 150, speed: 0.007, label: 'GLOBAL RANK',         value: '#3 TOP 1%',        subtitle: '#3 TOP 1% STANDING',      details: 'Real-time placement calculation across university metrics.',                  zIndex: 30 },
  { id: 'P4', radiusX: 440, radiusY: 180, speed: 0.005, label: 'NEURAL GAP ANALYSIS', value: 'PHYSICS → MATH',   subtitle: 'DBMS → MASTER LEVEL',     details: 'Syllabus-aligned deficiency tracking system.',                               zIndex: 40 },
  { id: 'P5', radiusX: 520, radiusY: 210, speed: 0.004, label: 'DATA STRUCTURES',     value: 'DSA REPOSITORY',   subtitle: 'CORE SYSTEM MODULE',      details: 'Syllabus tracking for algorithmic complexity and tree nodes.',               zIndex: 50 },
  { id: 'P6', radiusX: 600, radiusY: 240, speed: 0.003, label: 'DATABASE SYSTEMS',    value: 'DBMS SCHEMAS',     subtitle: 'CORE SYSTEM MODULE',      details: 'Tracking schema normalizations and indexing structures.',                    zIndex: 60 },
  { id: 'P7', radiusX: 680, radiusY: 270, speed: 0.002, label: 'OPERATING SYSTEMS',   value: 'CONCURRENCY CORE', subtitle: 'CORE SYSTEM MODULE',      details: 'Tracking thread scheduling and concurrency control records.',               zIndex: 70 },
];

function useOrbitalEngine() {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const init: Record<string, { x: number; y: number }> = {};
    ORBITAL_PLANETS_DATA.forEach((p, i) => {
      const angle = (i / ORBITAL_PLANETS_DATA.length) * Math.PI * 2;
      init[p.id] = { x: p.radiusX * Math.cos(angle), y: p.radiusY * Math.sin(angle) };
    });
    return init;
  });

  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const anglesRef = useRef<Record<string, number>>(
    Object.fromEntries(
      ORBITAL_PLANETS_DATA.map((p, i) => [p.id, (i / ORBITAL_PLANETS_DATA.length) * Math.PI * 2])
    )
  );

  useEffect(() => {
    let last = performance.now();

    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      timeRef.current += delta;

      const next: Record<string, { x: number; y: number }> = {};
      ORBITAL_PLANETS_DATA.forEach(p => {
        anglesRef.current[p.id] += p.speed;
        const angle = anglesRef.current[p.id];
        next[p.id] = {
          x: p.radiusX * Math.cos(angle),
          y: p.radiusY * Math.sin(angle),
        };
      });
      setPositions(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return positions;
}

const ASTEROID_FIELD = Array.from({ length: 130 }).map((_, i) => ({
  id: i,
  radius: 85 + Math.random() * 445,
  initialAngle: Math.random() * 360,
  size: 1 + Math.random() * 3.2,
  speed: 16 + Math.random() * 48,
  opacity: 0.08 + Math.random() * 0.28,
}));

const Landing = () => {
  const navigate = useNavigate();
  const { neuralReport, fetchAnalytics, checkLoginStreak } = useUserStore();

  useEffect(() => {
    fetchAnalytics();
    checkLoginStreak();

    if (localStorage.getItem('leveledUp') || localStorage.getItem('streakHit')) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#eab308', '#22c55e'],
      });
      localStorage.removeItem('leveledUp');
      localStorage.removeItem('streakHit');
    }
  }, [fetchAnalytics, checkLoginStreak]);

  // Gamification Data
  const gamification = neuralReport?.gamification || { xp: 850, level: 1, streak: 3, achievements: ['Rookie'] };
  const nextLevelXP = gamification.level * 1000;
  const xpProgress = (gamification.xp % 1000) / 10;

  // Fallback / Mock Data (Ensures UI works even if DB is empty)
  const accuracy = neuralReport?.latestAccuracy || 89.4;
  const pScore = neuralReport?.masteryRadar?.Physics || 35;
  const cScore = neuralReport?.masteryRadar?.Chemistry || 75;
  const mScore = neuralReport?.masteryRadar?.Math || 85;

  const lowestSubject = pScore < cScore ? (pScore < mScore ? 'Physics' : 'Math') : (cScore < mScore ? 'Chemistry' : 'Math');
  const highestSubject = pScore > cScore ? (pScore > mScore ? 'Physics' : 'Math') : (cScore > mScore ? 'Chemistry' : 'Math');

  const gapAlert = (neuralReport?.masteryRadar?.[lowestSubject as keyof typeof neuralReport.masteryRadar] ?? pScore) < 40;

  // For Landing mock display if no user context yet
  const globalRank = 3;
  const isTop3 = globalRank <= 3;
  const orbitalPositions = useOrbitalEngine();

  return (
    <div className="relative w-screen h-screen bg-[#000000] text-white overflow-hidden font-sans">

      {/* ── LAYER 0: FULL-SCREEN BACKGROUND CANVAS ── */}
      <div className="absolute inset-0 w-screen h-screen overflow-hidden pointer-events-auto z-0">

        <div className="absolute inset-0 bg-dot-grid opacity-5 animate-dot-grid" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
        />

        <style>{`
          @keyframes asteroid-orbit {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>

        {/* Perspective wrapper — full viewport */}
        <div
          style={{
            perspective: '1000px',
            perspectiveOrigin: '50% 38%',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {/* 3D tilted universe */}
          <div
            style={{
              transform: 'rotateX(52deg) rotateZ(-12deg)',
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >

            {/* ORBIT RINGS — elliptical via perspective */}
            {ORBITAL_PLANETS_DATA.map(planet => (
              <div
                key={`ring-${planet.id}`}
                style={{
                  position: 'absolute',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.07)',
                  width: planet.radiusX * 2,
                  height: planet.radiusX * 2,
                  top: '50%',
                  left: '50%',
                  marginTop: -planet.radiusX,
                  marginLeft: -planet.radiusX,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* ASTEROID BELT */}
            {ASTEROID_FIELD.map(asteroid => (
              <div
                key={asteroid.id}
                style={{
                  position: 'absolute',
                  borderRadius: '50%',
                  width: asteroid.radius * 2,
                  height: asteroid.radius * 2,
                  top: '50%',
                  left: '50%',
                  marginTop: -asteroid.radius,
                  marginLeft: -asteroid.radius,
                  animationName: 'asteroid-orbit',
                  animationDuration: `${asteroid.speed}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  animationDelay: `${-(asteroid.initialAngle / 360) * asteroid.speed}s`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    width: asteroid.size,
                    height: asteroid.size,
                    marginLeft: -asteroid.size / 2,
                    marginTop: -asteroid.size / 2,
                    borderRadius: '50%',
                    background: `rgba(148,163,184,${asteroid.opacity})`,
                    boxShadow: asteroid.size > 2.8 ? `0 0 ${asteroid.size + 1}px rgba(148,163,184,0.28)` : 'none',
                  }}
                />
              </div>
            ))}

            {/* ORBITING PLANETS — rAF trigonometric velocity engine */}
            {ORBITAL_PLANETS_DATA.map((planet) => {
              const pos = orbitalPositions[planet.id] ?? { x: 0, y: 0 };
              return (
                <div
                  key={planet.id}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    zIndex: planet.zIndex,
                    willChange: 'transform',
                    transform: `translate3d(calc(${pos.x}px - 50%), calc(${pos.y}px - 50%), 0px)`,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      transform: 'rotateX(-52deg)',
                      pointerEvents: 'auto',
                    }}
                  >

                    {planet.id === 'P1' && (
                      <div
                        className="backdrop-blur-md rounded-xl p-3 shadow-2xl"
                        style={{ width: 124, background: 'rgba(14,19,34,0.50)', border: '1px solid rgba(99,102,241,0.20)' }}
                      >
                        <p style={{ fontFamily: 'monospace', fontSize: '0.44rem', fontWeight: 900, letterSpacing: '0.12em', color: '#6366F1', textTransform: 'uppercase', marginBottom: 3 }}>
                          {planet.label}
                        </p>
                        <p style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                          {accuracy}%
                        </p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.42rem', color: '#64748b', marginTop: 2, letterSpacing: '0.08em' }}>
                          {planet.value}
                        </p>
                        <svg className="w-full mt-2" height="16" viewBox="0 0 80 16" preserveAspectRatio="none">
                          <motion.path
                            d="M0,13 Q10,13 20,7 T40,9 T60,2 T80,5"
                            fill="none"
                            stroke="#6366F1"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2.5, ease: 'easeInOut', delay: 1.2 }}
                          />
                        </svg>
                      </div>
                    )}

                    {planet.id === 'P2' && (
                      <div
                        className="backdrop-blur-md rounded-xl p-3 shadow-2xl"
                        style={{ width: 114, background: 'rgba(14,19,34,0.50)', border: '1px solid rgba(59,130,246,0.18)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 5px #3b82f6', flexShrink: 0 }} />
                          <p style={{ fontFamily: 'monospace', fontSize: '0.44rem', fontWeight: 900, letterSpacing: '0.1em', color: '#60a5fa', textTransform: 'uppercase' }}>
                            {planet.label}
                          </p>
                        </div>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', fontWeight: 700, color: '#93c5fd', marginBottom: 4 }}>
                          {planet.value}
                        </p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.42rem', color: '#475569', lineHeight: 1.45 }}>
                          {planet.details}
                        </p>
                      </div>
                    )}

                    {planet.id === 'P3' && (
                      <div
                        className="backdrop-blur-md rounded-xl p-3 shadow-2xl text-center"
                        style={{ width: 96, background: 'rgba(14,19,34,0.50)', border: '1px solid rgba(245,158,11,0.22)', boxShadow: '0 0 16px rgba(245,158,11,0.08)' }}
                      >
                        <p style={{ fontFamily: 'monospace', fontSize: '0.44rem', fontWeight: 900, letterSpacing: '0.1em', color: '#fbbf24', textTransform: 'uppercase', marginBottom: 4 }}>
                          {planet.label}
                        </p>
                        <p
                          style={{
                            fontFamily: 'monospace', fontSize: '1.7rem', fontWeight: 900, lineHeight: 1,
                            background: 'linear-gradient(135deg, #fde68a, #f59e0b, #d97706)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                          }}
                        >
                          #{globalRank}
                        </p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.42rem', color: '#f59e0b', marginTop: 3, letterSpacing: '0.08em' }}>
                          {planet.value}
                        </p>
                      </div>
                    )}

                    {planet.id === 'P4' && (
                      <motion.div
                        className="backdrop-blur-md rounded-xl p-3 shadow-2xl"
                        style={{
                          width: 120,
                          background: 'rgba(14,19,34,0.50)',
                          border: `1px solid ${gapAlert ? 'rgba(239,68,68,0.28)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                        animate={{ x: [0, 0.9, -0.9, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <p style={{ fontFamily: 'monospace', fontSize: '0.44rem', fontWeight: 900, letterSpacing: '0.1em', color: gapAlert ? '#f87171' : '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                          {planet.label}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: '0.52rem', fontWeight: 700, marginBottom: 5 }}>
                          <span style={{ color: '#818cf8' }}>{lowestSubject}</span>
                          <span style={{ color: '#334155' }}>→</span>
                          <span style={{ color: '#a855f7' }}>{highestSubject}</span>
                        </div>
                        <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: '65%', background: 'linear-gradient(90deg, #6366F1, #a855f7)', borderRadius: 999 }} />
                        </div>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.42rem', color: '#475569', marginTop: 4, letterSpacing: '0.07em' }}>
                          {planet.value}
                        </p>
                      </motion.div>
                    )}

                    {planet.id === 'P5' && (
                      <div
                        className="backdrop-blur-md rounded-xl px-3 py-2.5 shadow-2xl text-center"
                        style={{ minWidth: 120, background: 'rgba(14,19,34,0.50)', border: '1px solid rgba(99,102,241,0.18)', boxShadow: '0 0 12px rgba(99,102,241,0.06)' }}
                      >
                        <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.1em', color: '#fff', textTransform: 'uppercase' }}>{planet.label}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.44rem', letterSpacing: '0.1em', color: '#6366F1', textTransform: 'uppercase', marginTop: 3 }}>{planet.value}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.4rem', color: '#334155', marginTop: 2, lineHeight: 1.4 }}>{planet.details}</p>
                      </div>
                    )}

                    {planet.id === 'P6' && (
                      <div
                        className="backdrop-blur-md rounded-xl px-3 py-2.5 shadow-2xl text-center"
                        style={{ minWidth: 120, background: 'rgba(14,19,34,0.50)', border: '1px solid rgba(34,211,238,0.16)', boxShadow: '0 0 12px rgba(34,211,238,0.05)' }}
                      >
                        <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.1em', color: '#fff', textTransform: 'uppercase' }}>{planet.label}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.44rem', letterSpacing: '0.1em', color: '#22d3ee', textTransform: 'uppercase', marginTop: 3 }}>{planet.value}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.4rem', color: '#334155', marginTop: 2, lineHeight: 1.4 }}>{planet.details}</p>
                      </div>
                    )}

                    {planet.id === 'P7' && (
                      <div
                        className="backdrop-blur-md rounded-xl px-3 py-2.5 shadow-2xl text-center"
                        style={{ minWidth: 120, background: 'rgba(14,19,34,0.50)', border: '1px solid rgba(16,185,129,0.16)', boxShadow: '0 0 12px rgba(16,185,129,0.05)' }}
                      >
                        <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.1em', color: '#fff', textTransform: 'uppercase' }}>{planet.label}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.44rem', letterSpacing: '0.1em', color: '#10b981', textTransform: 'uppercase', marginTop: 3 }}>{planet.value}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.4rem', color: '#334155', marginTop: 2, lineHeight: 1.4 }}>{planet.details}</p>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* ── CENTRAL SUN / KARL CORE NODE ── */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
              <motion.div
                style={{
                  position: 'absolute', borderRadius: '50%', width: 160, height: 160,
                  top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(99,102,241,0.40) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                style={{
                  position: 'absolute', borderRadius: '50%', width: 100, height: 100,
                  top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(168,85,247,0.28) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div style={{ position: 'relative', width: 86, height: 86, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)', filter: 'blur(14px)' }} />
                <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 50%, #3b82f6 100%)', boxShadow: '0 0 38px rgba(99,102,241,0.80)' }} />
                <motion.div
                  style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: '2px dashed rgba(99,102,241,0.50)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  style={{ position: 'absolute', inset: -28, borderRadius: '50%', border: '2px dashed rgba(168,85,247,0.35)' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  style={{ position: 'absolute', inset: -44, borderRadius: '50%', border: '2px dashed rgba(59,130,246,0.20)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                />
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.56rem', fontWeight: 900, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', lineHeight: 1 }}>KARL</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.40rem', letterSpacing: '0.10em', color: '#a5b4fc', marginTop: 2 }}>.AI</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── LAYER 1: INTERACTIVE FOREGROUND ── */}
      <div className="relative w-full min-h-screen flex flex-col justify-between items-center pointer-events-none z-10 px-6 py-4">

        {/* Top row: nav + XP bar */}
        <div className="w-full flex flex-col items-center gap-3 pt-2">
          <nav className="pointer-events-auto w-full max-w-7xl flex justify-between items-center">
            <div className="flex items-center gap-8 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
              <span className="font-bold tracking-wider text-sm">KARL.AI</span>
              <div className="hidden sm:flex gap-6 text-sm text-gray-300">
                <span onClick={() => navigate('/features')} className="hover:text-white cursor-pointer transition-colors">Features</span>
                <span onClick={() => navigate('/engine')} className="hover:text-white cursor-pointer transition-colors">Engine</span>
                <span onClick={() => navigate('/system')} className="hover:text-white cursor-pointer transition-colors">System</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-orange-500 text-xs">🔥</motion.div>
                <span className="font-mono-data text-xs text-orange-400 font-bold">{gamification.streak} DAY STREAK</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="pointer-events-auto px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
              >
                Enter System <ArrowRight size={16} />
              </button>
            </div>
          </nav>

          <div className="pointer-events-auto w-full max-w-md">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-lg flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono-data">
                <span className="text-indigo-300">LEVEL {gamification.level}</span>
                <span className="text-gray-400">{gamification.xp} / {nextLevelXP} XP</span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center hero text */}
        <div className="text-center max-w-4xl flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-['Inter'] relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-white animate-shine" style={{ backgroundSize: '200% auto' }}>
              REDEFINE. ANALYZE.
            </span>
            <br className="md:hidden" />
            <span className="md:ml-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 relative inline-block font-extrabold drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]">
              MASTER.
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto font-medium">
            The ultimate neural command center for engineering aspirants. Bridge your learning gaps with Gemini-powered precision.
          </p>
        </div>

        {/* Bottom mobile stat cards */}
        <div className="pointer-events-auto flex md:hidden flex-col gap-4 pb-6 w-full max-w-sm mx-auto px-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <span className="font-mono-data text-xs text-gray-400 uppercase">Accuracy</span>
            <span className="text-lg font-bold text-white">{accuracy}%</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <span className="font-mono-data text-xs text-gray-400 uppercase">AI Gen</span>
            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" />
              <span className="font-mono-data text-[9px] font-bold text-green-400">ACTIVE</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <span className="font-mono-data text-xs text-gray-400 uppercase">Profile</span>
            <span className="text-sm font-semibold text-white tracking-tight">LNCT Main</span>
          </div>
          <div
            onClick={() => gapAlert && navigate('/karl-log')}
            className={clsx('bg-white/5 backdrop-blur-xl border rounded-xl p-4 flex flex-col gap-2 shadow-lg', gapAlert ? 'border-red-500/50 cursor-pointer' : 'border-white/10')}
          >
            <div className="flex justify-between items-center">
              <span className={clsx('font-mono-data text-xs uppercase', gapAlert ? 'text-red-400' : 'text-gray-400')}>Neural Gap</span>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-indigo-400 font-mono-data text-xs">{lowestSubject}</span>
                <ArrowRight size={12} className="text-gray-500" />
                <span className="text-purple-400 font-mono-data text-xs">{highestSubject}</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[65%]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;
