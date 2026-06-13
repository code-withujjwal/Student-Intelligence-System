import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Users, Clock, Trophy, Copy, Check, Zap, Crown,
  Shield, Flame, ArrowRight, RotateCcw, Home, Wifi, WifiOff,
  LogOut, ChevronRight, Activity, Target, Star, X, Play,
  CheckCircle2, XCircle, AlertTriangle, Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBattleStore } from '../store/useBattleStore';
import { battleApi, FALLBACK_CATEGORIES, FALLBACK_STATS } from '../api/battleApi';
import { useAuthStore } from '../store/useAuthStore';
import type { BattleDifficulty, BattleCategory, BattleStats, BattlePlayer } from '../types/battle';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ConnectionBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    connected:    { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'LIVE' },
    connecting:   { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',       label: 'CONNECTING' },
    disconnected: { color: 'text-slate-400 bg-slate-400/10 border-slate-400/20',       label: 'OFFLINE' },
    error:        { color: 'text-red-400 bg-red-400/10 border-red-400/20',             label: 'ERROR' },
  };
  const c = cfg[status] ?? cfg.disconnected;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'connected' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}

function DifficultyBadge({ diff }: { diff: BattleDifficulty }) {
  const cfg = {
    EASY:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    MEDIUM: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    HARD:   'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-black tracking-widest uppercase ${cfg[diff]}`}>
      {diff}
    </span>
  );
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-black text-slate-400">#{rank}</span>;
}

// SVG ring timer
function TimerRing({ timeLeft, total, size = 80 }: { timeLeft: number; total: number; size?: number }) {
  const r = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const fraction = Math.max(0, timeLeft / total);
  const offset = circumference * (1 - fraction);
  const color = timeLeft < 5 ? '#ef4444' : timeLeft < 10 ? '#f59e0b' : '#6366f1';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', width: size, height: size }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-black font-mono text-lg ${timeLeft < 5 ? 'text-red-400 animate-pulse' : timeLeft < 10 ? 'text-amber-400' : 'text-white'}`}>
          {Math.ceil(timeLeft)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1: IDLE — Battle Lobby
// ─────────────────────────────────────────────────────────────────────────────

function IdleScreen({
  categories, stats, onCreateRoom, onJoinRoom,
}: {
  categories: BattleCategory[];
  stats: BattleStats;
  onCreateRoom: (cat: string, diff: BattleDifficulty, qty: number) => Promise<void>;
  onJoinRoom: (code: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [category, setCategory] = useState('DSA');
  const [difficulty, setDifficulty] = useState<BattleDifficulty>('MEDIUM');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DIFFS: BattleDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
  const DIFF_COLORS = {
    EASY:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    MEDIUM: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    HARD:   'bg-red-500/10 border-red-500/30 text-red-300',
  };

  const handleCreate = async () => {
    setLoading(true); setError(null);
    try { await onCreateRoom(category, difficulty, totalQuestions); }
    catch (e: any) { setError(e?.response?.data?.message || e?.message || 'Failed to create room. Is the backend online?'); }
    finally { setLoading(false); }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true); setError(null);
    try { await onJoinRoom(inviteCode.trim()); }
    catch (e: any) { setError(e?.response?.data?.message || e?.message || 'Invalid invite code or room not found.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#040710' }}>
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-cyan-600/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', repeatDelay: 2 }}
            className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.4)] mb-6"
          >
            <Swords className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Multiplayer <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Battle</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Challenge peers in real-time quiz combat.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, icon: Trophy, color: 'text-amber-400' },
            { label: 'Streak',   value: stats.currentStreak,             icon: Flame,  color: 'text-orange-400' },
            { label: 'Total XP', value: stats.totalXpEarned.toLocaleString(), icon: Zap, color: 'text-indigo-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex flex-col items-center gap-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <p className="text-xl font-black text-white font-mono">{value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex bg-white/[0.03] rounded-2xl border border-white/8 p-1 mb-6">
          {(['create', 'join'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === m
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'create' ? '⚔️ Create Room' : '🔗 Join with Code'}
            </button>
          ))}
        </div>

        {/* Create Room Form */}
        <AnimatePresence mode="wait">
          {mode === 'create' ? (
            <motion.div key="create" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-5">
              {/* Category */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Difficulty</label>
                <div className="flex gap-3">
                  {DIFFS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 ${
                        difficulty === d ? DIFF_COLORS[d] : 'border-white/10 text-slate-500 hover:border-white/20'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions count */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Questions — <span className="text-indigo-400">{totalQuestions}</span>
                </label>
                <input
                  type="range" min={5} max={20} step={5}
                  value={totalQuestions}
                  onChange={e => setTotalQuestions(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>5 (Fast)</span><span>10</span><span>15</span><span>20 (Epic)</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-sm tracking-wide transition-all shadow-[0_0_40px_rgba(99,102,241,0.25)] hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
                {loading ? 'Creating Room...' : 'Create Battle Room'}
              </button>
            </motion.div>
          ) : (
            <motion.form key="join" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} onSubmit={handleJoin} className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                  placeholder="ABC-123"
                  maxLength={10}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-2xl font-black font-mono text-center tracking-[0.3em] focus:outline-none focus:border-indigo-500 transition-colors placeholder-white/10"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !inviteCode.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-sm tracking-wide transition-all shadow-[0_0_40px_rgba(34,211,238,0.2)] flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {loading ? 'Joining...' : 'Enter Battle Room'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2: LOBBY — Waiting Room
// ─────────────────────────────────────────────────────────────────────────────

function LobbyScreen({
  inviteCode, players, myUsername, isHost, connectionStatus, onStart, onLeave,
}: {
  inviteCode: string;
  players: BattlePlayer[];
  myUsername: string | null;
  isHost: boolean;
  connectionStatus: string;
  onStart: () => Promise<void>;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = async () => {
    setStarting(true);
    try { await onStart(); }
    catch { /* error shown in component */ }
    finally { setStarting(false); }
  };

  const canStart = isHost && players.length >= 2 && connectionStatus === 'connected';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#040710' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 rounded-full bg-indigo-600/6 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full bg-purple-600/6 blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">
          {/* Top */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Battle Room</p>
              <h2 className="text-2xl font-black text-white">Waiting Room</h2>
            </div>
            <ConnectionBadge status={connectionStatus} />
          </div>

          {/* Invite Code */}
          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Share this code</p>
            <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <code className="flex-1 text-3xl font-black text-white tracking-[0.25em] font-mono">{inviteCode}</code>
              <button
                onClick={handleCopy}
                className={`p-2.5 rounded-xl border transition-all ${
                  copied
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Players */}
          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Players — {players.length} / 6
            </p>
            <div className="space-y-2.5">
              <AnimatePresence>
                {players.map((p) => (
                  <motion.div
                    key={p.username}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      p.username === myUsername
                        ? 'bg-indigo-500/10 border-indigo-500/25'
                        : 'bg-white/[0.03] border-white/8'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      p.username === myUsername ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-300'
                    }`}>
                      {p.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${p.username === myUsername ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {p.username} {p.username === myUsername && '(You)'}
                      </p>
                      {p.isHost && <p className="text-[10px] text-amber-400 font-bold">HOST</p>}
                    </div>
                    <span className={`w-2 h-2 rounded-full ${p.isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  </motion.div>
                ))}
                {players.length < 2 && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Users className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-600 italic">Waiting for opponent...</p>
                    <Loader2 className="w-4 h-4 text-slate-700 animate-spin ml-auto" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isHost && (
              <button
                onClick={handleStart}
                disabled={!canStart || starting}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-3 ${
                  canStart
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_40px_rgba(99,102,241,0.3)]'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                }`}
              >
                {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {starting ? 'Starting...' : canStart ? 'Start Battle!' : `Need ${Math.max(0, 2 - players.length)} more player${players.length === 1 ? '' : 's'}`}
              </button>
            )}
            {!isHost && (
              <div className="flex items-center justify-center gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <p className="text-sm text-amber-300 font-bold">Waiting for host to start...</p>
              </div>
            )}
            <button
              onClick={onLeave}
              className="w-full py-3 rounded-2xl border border-white/8 text-slate-400 hover:text-red-400 hover:border-red-500/20 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Leave Room
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3: COUNTDOWN — 3-2-1 Before Battle
// ─────────────────────────────────────────────────────────────────────────────

function CountdownScreen({ value, players, myUsername }: { value: number; players: BattlePlayer[]; myUsername: string | null }) {
  const opponent = players.find(p => p.username !== myUsername);
  const me = players.find(p => p.username === myUsername);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#040710' }}>
      {/* VS cards */}
      <div className="flex items-center gap-8 mb-16">
        {[me, opponent].map((player, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: idx === 0 ? -60 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className={`w-40 bg-black/40 border rounded-3xl p-6 flex flex-col items-center gap-3 ${
              idx === 0 ? 'border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black ${
              idx === 0 ? 'bg-indigo-600' : 'bg-purple-600'
            }`}>
              {player?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <p className={`text-sm font-bold text-center truncate w-full text-center ${idx === 0 ? 'text-indigo-300' : 'text-purple-300'}`}>
              {player?.username ?? 'Opponent'}
            </p>
            {idx === 0 && <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">YOU</span>}
          </motion.div>
        ))}

        {/* VS badge in center */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] text-white font-black text-lg"
        >
          VS
        </motion.div>
      </div>

      {/* Countdown number */}
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ scale: 1.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative"
        >
          <div className={`text-[10rem] font-black leading-none text-transparent bg-clip-text ${
            value === 1
              ? 'bg-gradient-to-br from-emerald-400 to-cyan-400'
              : 'bg-gradient-to-br from-indigo-400 to-purple-400'
          }`}>
            {value > 0 ? value : '⚔️'}
          </div>
          {/* Ripple effect */}
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8, delay, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
      <p className="text-slate-400 text-lg font-bold mt-6 tracking-wider">Get ready to battle!</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4: IN_QUESTION — Active Battle
// ─────────────────────────────────────────────────────────────────────────────

function InQuestionScreen({
  question, timeLeft, selectedAnswer, leaderboard, myUsername, questionIndex, totalQuestions, onAnswer, onForfeit,
}: {
  question: { id: number; text: string; options: string[]; category: string; difficulty: BattleDifficulty; timeLimit: number };
  timeLeft: number;
  selectedAnswer: string | null;
  leaderboard: BattlePlayer[];
  myUsername: string | null;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onForfeit: () => void;
}) {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen flex" style={{ background: '#040710', fontFamily: '"Inter", sans-serif' }}>
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
              Q {questionIndex + 1}/{totalQuestions}
            </span>
            <DifficultyBadge diff={question.difficulty} />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{question.category}</span>
          </div>
          <div className="flex items-center gap-4">
            <TimerRing timeLeft={timeLeft} total={question.timeLimit} size={72} />
            <button
              onClick={onForfeit}
              className="text-slate-600 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Forfeit
            </button>
          </div>
        </header>

        {/* Question + Answers */}
        <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full px-8 py-6">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-2xl md:text-3xl font-black text-white leading-relaxed mb-10">
              {question.text}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options.map((opt, i) => {
                const label = optionLabels[i];
                const isSelected = selectedAnswer === opt;
                const isLocked = !!selectedAnswer;

                return (
                  <motion.button
                    key={i}
                    whileHover={!isLocked ? { scale: 1.02 } : {}}
                    whileTap={!isLocked ? { scale: 0.98 } : {}}
                    onClick={() => onAnswer(opt)}
                    disabled={isLocked}
                    className={`group relative p-5 rounded-2xl border text-left font-bold transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-[0_0_30px_rgba(99,102,241,0.25)]'
                        : isLocked
                        ? 'bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed opacity-40'
                        : 'bg-white/[0.03] border-white/10 text-slate-200 hover:border-indigo-500/40 hover:bg-indigo-500/8 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-white/8 text-slate-400'
                      }`}>
                        {label}
                      </span>
                      <span className="text-sm leading-snug">{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400 ml-auto flex-shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center justify-center gap-3 text-indigo-400 font-bold text-sm"
              >
                <Activity className="w-4 h-4 animate-pulse" />
                Answer locked — waiting for other players...
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Live Leaderboard Sidebar */}
      <aside className="w-72 bg-black/50 border-l border-white/5 flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wide">Live Rankings</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Updates live</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <AnimatePresence>
            {leaderboard.map((entry, idx) => (
              <motion.div
                key={entry.username}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  entry.username === myUsername
                    ? 'bg-indigo-500/10 border-indigo-500/25'
                    : 'bg-white/[0.03] border-white/8'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  idx === 0 ? 'bg-amber-400 text-amber-900' :
                  idx === 1 ? 'bg-slate-300 text-slate-800' :
                  idx === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-white/10 text-slate-400'
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${entry.username === myUsername ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {entry.username}{entry.username === myUsername ? ' (You)' : ''}
                  </p>
                  {entry.streak > 1 && (
                    <p className="text-[9px] text-orange-400 font-bold">🔥 {entry.streak}x streak</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white font-mono">{entry.score.toLocaleString()}</p>
                  {entry.answeredCurrentQuestion && (
                    <p className="text-[9px] text-emerald-400 font-bold">✓ done</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5: ANSWER_REVEALED — Result Flash
// ─────────────────────────────────────────────────────────────────────────────

function AnswerRevealedScreen({
  result, selectedAnswer, myUsername, leaderboard, questionIndex, totalQuestions,
}: {
  result: { questionId: number; correctAnswer: string; explanation: string; playerResults: Array<{ username: string; answeredCorrect: boolean; answer: string | null; scoreDelta: number; newTotal: number; timeTakenMs: number; streakBonus: number }> };
  selectedAnswer: string | null;
  myUsername: string | null;
  leaderboard: BattlePlayer[];
  questionIndex: number;
  totalQuestions: number;
}) {
  const myResult = result.playerResults.find(r => r.username === myUsername);
  const isCorrect = myResult?.answeredCorrect ?? false;
  const scoreDelta = myResult?.scoreDelta ?? 0;

  return (
    <div className="min-h-screen flex" style={{ background: '#040710' }}>
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
        <div className="max-w-2xl w-full space-y-6">
          {/* Result banner */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-3xl border text-center ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)]'
                : 'bg-red-500/10 border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.15)]'
            }`}
          >
            <div className="text-5xl mb-3">{isCorrect ? '✓' : '✗'}</div>
            <p className={`text-xl font-black mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correct!' : selectedAnswer ? 'Wrong Answer' : 'Time\'s Up!'}
            </p>
            {scoreDelta > 0 && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-white font-mono"
              >
                +{scoreDelta.toLocaleString()} pts
                {(myResult?.streakBonus ?? 0) > 0 && (
                  <span className="text-orange-400 text-lg ml-2">🔥 +{myResult!.streakBonus} streak</span>
                )}
              </motion.p>
            )}
          </motion.div>

          {/* Correct answer */}
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Correct Answer</p>
            <p className="text-lg font-black text-emerald-300">{result.correctAnswer}</p>
            {result.explanation && (
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{result.explanation}</p>
            )}
          </div>

          {/* All players' results */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Round Results</p>
            {result.playerResults.map((pr) => (
              <div key={pr.username} className={`flex items-center gap-4 p-3 rounded-xl border ${
                pr.username === myUsername ? 'bg-indigo-500/8 border-indigo-500/20' : 'bg-white/[0.02] border-white/8'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${pr.answeredCorrect ? 'bg-emerald-600' : 'bg-red-900/50'}`}>
                  {pr.username[0].toUpperCase()}
                </div>
                <p className={`flex-1 text-sm font-bold ${pr.username === myUsername ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {pr.username}{pr.username === myUsername ? ' (You)' : ''}
                </p>
                <div className="text-right">
                  {pr.scoreDelta > 0
                    ? <p className="text-sm font-black text-emerald-400">+{pr.scoreDelta}</p>
                    : <p className="text-sm font-bold text-slate-600">{pr.answer ? pr.answer : '—'}</p>
                  }
                  <p className="text-[10px] text-slate-500 font-mono">{pr.timeTakenMs > 0 ? `${(pr.timeTakenMs / 1000).toFixed(1)}s` : '—'}</p>
                </div>
                {pr.answeredCorrect
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  : <XCircle className="w-5 h-5 text-red-500/60" />
                }
              </div>
            ))}
          </div>

          {questionIndex < totalQuestions && (
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              Next question incoming...
            </div>
          )}
        </div>
      </div>

      {/* Mini leaderboard */}
      <aside className="w-64 bg-black/50 border-l border-white/5 p-5 h-screen sticky top-0 flex flex-col gap-3">
        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Standings</p>
        {leaderboard.map((p, idx) => (
          <div key={p.username} className={`flex items-center gap-3 p-3 rounded-xl border ${
            p.username === myUsername ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.03] border-white/8'
          }`}>
            <MedalIcon rank={idx + 1} />
            <p className={`flex-1 text-xs font-bold truncate ${p.username === myUsername ? 'text-indigo-300' : 'text-slate-300'}`}>
              {p.username}
            </p>
            <p className="text-xs font-black text-white font-mono">{p.score.toLocaleString()}</p>
          </div>
        ))}
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6: GAME_OVER — Battle End
// ─────────────────────────────────────────────────────────────────────────────

function GameOverScreen({
  summary, myUsername, onRematch, onHome,
}: {
  summary: { winner: string; isTie: boolean; finalBoard: BattlePlayer[]; xpEarned: Record<string, number>; totalQuestions: number };
  myUsername: string | null;
  onRematch: () => void;
  onHome: () => void;
}) {
  const didWin = !summary.isTie && summary.winner === myUsername;
  const myXP = myUsername ? (summary.xpEarned[myUsername] ?? 0) : 0;

  useEffect(() => {
    if (didWin) {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#6366f1', '#a855f7', '#fbbf24', '#22c55e'] });
      setTimeout(() => confetti({ particleCount: 80, spread: 90, origin: { y: 0.4, x: 0.2 }, angle: 60 }), 400);
      setTimeout(() => confetti({ particleCount: 80, spread: 90, origin: { y: 0.4, x: 0.8 }, angle: 120 }), 600);
    }
  }, [didWin]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#040710' }}>
      <div className="fixed inset-0 pointer-events-none">
        {didWin && <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] rounded-full bg-indigo-600/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl text-center"
      >
        {/* Trophy */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl mb-6"
        >
          {summary.isTie ? '🤝' : didWin ? '🏆' : '🎯'}
        </motion.div>

        <h1 className="text-4xl font-black text-white mb-2">
          {summary.isTie ? 'It\'s a Tie!' : didWin ? 'Victory!' : 'Battle Complete'}
        </h1>
        <p className="text-slate-400 text-lg mb-2">
          {summary.isTie
            ? 'A perfectly matched battle!'
            : didWin
            ? 'You dominated the battlefield!'
            : `${summary.winner} wins this round.`}
        </p>
        {myXP > 0 && (
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="text-2xl font-black text-indigo-400 mb-10"
          >
            +{myXP.toLocaleString()} XP earned
          </motion.p>
        )}

        {/* Final leaderboard */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 mb-8 text-left">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Final Standings</p>
          <div className="space-y-3">
            {summary.finalBoard.map((p, idx) => {
              const xp = summary.xpEarned[p.username] ?? 0;
              return (
                <motion.div
                  key={p.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    p.username === myUsername
                      ? 'bg-indigo-500/10 border-indigo-500/25'
                      : idx === 0
                      ? 'bg-amber-500/5 border-amber-500/15'
                      : 'bg-white/[0.02] border-white/8'
                  }`}
                >
                  <MedalIcon rank={idx + 1} />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-slate-600'
                  }`}>
                    {p.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${p.username === myUsername ? 'text-indigo-300' : 'text-white'}`}>
                      {p.username}{p.username === myUsername ? ' (You)' : ''}
                    </p>
                    {xp > 0 && <p className="text-[10px] text-indigo-400 font-bold">+{xp.toLocaleString()} XP</p>}
                  </div>
                  <p className="text-xl font-black text-white font-mono">{p.score.toLocaleString()}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onRematch}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm tracking-wide transition-all shadow-[0_0_40px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-5 h-5" /> Rematch
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 font-black text-sm tracking-wide transition-all flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" /> Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LiveQuizRoom() {
  const params = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const store = useBattleStore();

  const [categories, setCategories] = useState<BattleCategory[]>(FALLBACK_CATEGORIES);
  const [stats, setStats] = useState<BattleStats>(FALLBACK_STATS);

  // Load initial data
  useEffect(() => {
    battleApi.getCategories().then(setCategories).catch(() => { /* use fallback */ });
    battleApi.getStats().then(setStats).catch(() => { /* use fallback */ });
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { store.disconnect(); }, []);

  // If arriving via /multiplayer/:sessionId (legacy join link), auto-populate join code
  const legacyCode = params.sessionId;

  const handleCreateRoom = useCallback(async (category: string, difficulty: BattleDifficulty, totalQuestions: number) => {
    if (!user?.username) { navigate('/auth'); return; }
    const result = await battleApi.createRoom({ category, difficulty, totalQuestions });
    store.initRoom(result.roomId, result.inviteCode, user.username, true);
    store.connectToRoom(result.roomId, user.username);
  }, [user, store, navigate]);

  const handleJoinRoom = useCallback(async (inviteCode: string) => {
    if (!user?.username) { navigate('/auth'); return; }
    const result = await battleApi.joinRoom(inviteCode);
    store.initRoom(result.roomId, inviteCode, user.username, false);
    store.connectToRoom(result.roomId, user.username);
  }, [user, store, navigate]);

  const handleStartBattle = useCallback(async () => {
    if (store.roomId) await battleApi.startMatch(store.roomId);
  }, [store.roomId]);

  const handleLeave = useCallback(() => {
    store.forfeit();
  }, [store]);

  const handleRematch = useCallback(() => {
    store.disconnect();
    // reset navigates back to idle
  }, [store]);

  // ── Phase Router ──────────────────────────────────────────────────────────

  switch (store.phase) {
    case 'IDLE':
      return (
        <IdleScreen
          categories={categories}
          stats={stats}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      );

    case 'LOBBY':
      return (
        <LobbyScreen
          inviteCode={store.inviteCode ?? '------'}
          players={store.players}
          myUsername={store.myUsername}
          isHost={store.isHost}
          connectionStatus={store.connectionStatus}
          onStart={handleStartBattle}
          onLeave={handleLeave}
        />
      );

    case 'MATCHED':
    case 'COUNTDOWN':
      return (
        <CountdownScreen
          value={store.phase === 'MATCHED' ? 3 : store.countdownValue}
          players={store.players}
          myUsername={store.myUsername}
        />
      );

    case 'IN_QUESTION':
      if (!store.currentQuestion) return null;
      return (
        <InQuestionScreen
          question={store.currentQuestion}
          timeLeft={store.timeLeft}
          selectedAnswer={store.selectedAnswer}
          leaderboard={store.leaderboard}
          myUsername={store.myUsername}
          questionIndex={store.questionIndex}
          totalQuestions={store.totalQuestions}
          onAnswer={store.submitAnswer}
          onForfeit={handleLeave}
        />
      );

    case 'ANSWER_REVEALED':
      if (!store.answerResult) return null;
      return (
        <AnswerRevealedScreen
          result={store.answerResult}
          selectedAnswer={store.selectedAnswer}
          myUsername={store.myUsername}
          leaderboard={store.leaderboard}
          questionIndex={store.questionIndex}
          totalQuestions={store.totalQuestions}
        />
      );

    case 'GAME_OVER':
      if (!store.endSummary) return null;
      return (
        <GameOverScreen
          summary={store.endSummary}
          myUsername={store.myUsername}
          onRematch={handleRematch}
          onHome={() => { store.disconnect(); navigate('/features'); }}
        />
      );

    default:
      return null;
  }
}
