import axiosInstance from './axios';
import type {
  BattleStats,
  BattleCategory,
  CreateRoomPayload,
  CreateRoomResponse,
  JoinRoomResponse,
} from '../types/battle';

// ─────────────────────────────────────────────────────────────────────────────
// Battle REST API — wraps axiosInstance with typed responses
// ─────────────────────────────────────────────────────────────────────────────

export const battleApi = {
  /**
   * Create a new battle room as host.
   * POST /api/battle/create
   * Returns { roomId, inviteCode }
   */
  createRoom: async (payload: CreateRoomPayload): Promise<CreateRoomResponse> => {
    const res = await axiosInstance.post<{ data: CreateRoomResponse }>('/battle/create', payload);
    return res.data.data ?? res.data;
  },

  /**
   * Join an existing battle room via invite code.
   * POST /api/battle/join/:inviteCode
   */
  joinRoom: async (inviteCode: string): Promise<JoinRoomResponse> => {
    const res = await axiosInstance.post<{ data: JoinRoomResponse }>(`/battle/join/${inviteCode.trim().toUpperCase()}`);
    return res.data.data ?? res.data;
  },

  /**
   * Host triggers match start (validates ≥2 players server-side).
   * POST /api/battle/start/:roomId
   */
  startMatch: async (roomId: string): Promise<void> => {
    await axiosInstance.post(`/battle/start/${roomId}`);
  },

  /**
   * Get the authenticated user's battle statistics.
   * GET /api/battle/stats
   */
  getStats: async (): Promise<BattleStats> => {
    const res = await axiosInstance.get<{ data: BattleStats }>('/battle/stats');
    return res.data.data ?? res.data;
  },

  /**
   * Get available categories for battle matchmaking.
   * GET /api/battle/categories
   */
  getCategories: async (): Promise<BattleCategory[]> => {
    const res = await axiosInstance.get<{ data: BattleCategory[] }>('/battle/categories');
    return res.data.data ?? res.data;
  },

  /**
   * Get the user's recent battle match history.
   * GET /api/battle/history
   */
  getHistory: async () => {
    const res = await axiosInstance.get('/battle/history');
    return res.data.data ?? res.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Static fallback data (used when backend endpoints are not yet implemented)
// ─────────────────────────────────────────────────────────────────────────────

export const FALLBACK_CATEGORIES: BattleCategory[] = [
  { id: 'DSA',      name: 'Data Structures & Algorithms', questionCount: 200, icon: '🧠' },
  { id: 'DBMS',     name: 'Database Systems',              questionCount: 150, icon: '🗄️' },
  { id: 'OS',       name: 'Operating Systems',             questionCount: 120, icon: '⚙️' },
  { id: 'CN',       name: 'Computer Networks',             questionCount: 130, icon: '🌐' },
  { id: 'OOP',      name: 'Object Oriented Programming',   questionCount: 100, icon: '🔷' },
  { id: 'MATH',     name: 'Engineering Mathematics',        questionCount: 160, icon: '📐' },
  { id: 'PHYSICS',  name: 'Applied Physics',               questionCount: 110, icon: '⚡' },
  { id: 'GENERAL',  name: 'General Knowledge',             questionCount: 250, icon: '🎓' },
];

export const FALLBACK_STATS: BattleStats = {
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalXpEarned: 0,
  averageScore: 0,
  favoriteCategory: 'DSA',
};
