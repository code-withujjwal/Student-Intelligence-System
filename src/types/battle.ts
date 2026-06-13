// ─────────────────────────────────────────────────────────────────────────────
// Battle Engine Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type BattlePhase =
  | 'IDLE'              // At lobby screen, choosing settings
  | 'LOBBY'             // Room created, waiting for players to join
  | 'QUEUING'           // In auto-matchmaking queue (future)
  | 'MATCHED'           // Match found, showing VS screen
  | 'COUNTDOWN'         // 3-2-1 countdown before first question
  | 'IN_QUESTION'       // Active question, timer running
  | 'ANSWER_REVEALED'   // Showing correct answer + score deltas
  | 'GAME_OVER';        // Match ended

export type BattleDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AntiCheatFlagType = 'TAB_SWITCH' | 'FOCUS_LOSS' | 'RAPID_ANSWER';

export interface BattlePlayer {
  userId: number;
  username: string;
  score: number;
  streak: number;
  rank: number;
  answeredCurrentQuestion: boolean;
  isHost: boolean;
  isConnected: boolean;
}

export interface BattleQuestion {
  id: number;
  text: string;
  options: string[];           // Always exactly 4 options
  category: string;
  difficulty: BattleDifficulty;
  timeLimit: number;           // seconds (backend-controlled)
}

export interface PlayerResult {
  username: string;
  answeredCorrect: boolean;
  answer: string | null;       // null if timed out
  scoreDelta: number;
  newTotal: number;
  timeTakenMs: number;
  streakBonus: number;
}

export interface BattleAnswerResult {
  questionId: number;
  correctAnswer: string;
  explanation: string;
  playerResults: PlayerResult[];
}

export interface BattleRoomState {
  roomId: string;
  phase: BattlePhase;
  players: BattlePlayer[];
  questionIndex: number;
  totalQuestions: number;
  hostUsername: string;
  category: string;
  difficulty: BattleDifficulty;
}

export interface BattleEndSummary {
  winner: string;
  isTie: boolean;
  finalBoard: BattlePlayer[];
  xpEarned: Record<string, number>;
  matchId: string;
  totalQuestions: number;
  matchDurationMs: number;
}

export interface BattleStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;             // 0–100
  currentStreak: number;
  bestStreak: number;
  totalXpEarned: number;
  averageScore: number;
  favoriteCategory: string;
}

export interface BattleCategory {
  id: string;
  name: string;
  questionCount: number;
  icon: string;
}

export interface CreateRoomPayload {
  category: string;
  difficulty: BattleDifficulty;
  totalQuestions?: number;     // Default 10
}

export interface CreateRoomResponse {
  roomId: string;
  inviteCode: string;
}

export interface JoinRoomResponse {
  roomId: string;
  hostUsername: string;
  players: Array<{ username: string; isHost: boolean }>;
}
