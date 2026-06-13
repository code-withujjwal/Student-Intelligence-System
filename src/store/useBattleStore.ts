import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type {
  BattlePhase,
  BattlePlayer,
  BattleQuestion,
  BattleAnswerResult,
  BattleRoomState,
  BattleEndSummary,
  AntiCheatFlagType,
} from '../types/battle';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE-LEVEL STATE (outside Zustand — for RAF/event-listener lifecycle)
// ─────────────────────────────────────────────────────────────────────────────

// rAF timer
let _rafHandle: number | null = null;
let _questionStartTime: number = 0;
let _questionTimeLimit: number = 30;
let _questionReceivedAt: number = 0;

function _startTimer(timeLimit: number) {
  _questionStartTime = performance.now();
  _questionTimeLimit = timeLimit;
  _questionReceivedAt = performance.now();
  if (_rafHandle !== null) cancelAnimationFrame(_rafHandle);

  const tick = () => {
    const elapsed = (performance.now() - _questionStartTime) / 1000;
    const remaining = Math.max(0, _questionTimeLimit - elapsed);
    useBattleStore.setState({ timeLeft: remaining });
    if (remaining > 0) {
      _rafHandle = requestAnimationFrame(tick);
    } else {
      _rafHandle = null;
      useBattleStore.setState({ myAnswerLocked: true });
    }
  };
  _rafHandle = requestAnimationFrame(tick);
}

function _stopTimer() {
  if (_rafHandle !== null) {
    cancelAnimationFrame(_rafHandle);
    _rafHandle = null;
  }
}

// Queue wait timer
let _queueTimerHandle: ReturnType<typeof setInterval> | null = null;
function _startQueueTimer() {
  useBattleStore.setState({ queueWaitTime: 0 });
  _queueTimerHandle = setInterval(() => {
    useBattleStore.setState(s => ({ queueWaitTime: s.queueWaitTime + 1 }));
  }, 1000);
}
function _stopQueueTimer() {
  if (_queueTimerHandle !== null) {
    clearInterval(_queueTimerHandle);
    _queueTimerHandle = null;
  }
}

// STOMP subscriptions
let _subscriptions: Array<{ unsubscribe: () => void }> = [];
function _clearSubscriptions() {
  _subscriptions.forEach(sub => { try { sub.unsubscribe(); } catch { /* ignore */ } });
  _subscriptions = [];
}

// Anti-cheat event listeners
let _antiCheatActive = false;
let _visibilityHandler: (() => void) | null = null;
let _blurHandler: (() => void) | null = null;

function _publishFlag(flagType: AntiCheatFlagType) {
  const { stompClient, roomId, myUsername, phase } = useBattleStore.getState();
  if (!stompClient?.connected || !roomId || !myUsername) return;
  if (flagType === 'FOCUS_LOSS' && phase !== 'IN_QUESTION') return;
  useBattleStore.setState(s => ({ antiCheatFlags: s.antiCheatFlags + 1 }));
  stompClient.publish({
    destination: '/app/battle/flag',
    body: JSON.stringify({ roomId, username: myUsername, flagType, timestamp: Date.now() }),
  });
}

function _setupAntiCheat() {
  if (_antiCheatActive) return;
  _antiCheatActive = true;

  _visibilityHandler = () => {
    if (document.hidden) _publishFlag('TAB_SWITCH');
  };
  _blurHandler = () => _publishFlag('FOCUS_LOSS');

  document.addEventListener('visibilitychange', _visibilityHandler);
  window.addEventListener('blur', _blurHandler);
}

function _teardownAntiCheat() {
  _antiCheatActive = false;
  if (_visibilityHandler) { document.removeEventListener('visibilitychange', _visibilityHandler); _visibilityHandler = null; }
  if (_blurHandler) { window.removeEventListener('blur', _blurHandler); _blurHandler = null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZUSTAND STORE
// ─────────────────────────────────────────────────────────────────────────────

export interface BattleState {
  // WebSocket
  stompClient: Client | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastError: string | null;

  // Room
  phase: BattlePhase;
  roomId: string | null;
  inviteCode: string | null;
  myUsername: string | null;
  isHost: boolean;
  hostUsername: string | null;

  // Players
  players: BattlePlayer[];
  leaderboard: BattlePlayer[];

  // Question
  currentQuestion: BattleQuestion | null;
  questionIndex: number;         // 0-indexed
  totalQuestions: number;
  timeLeft: number;              // seconds, driven by rAF
  selectedAnswer: string | null;
  myAnswerLocked: boolean;
  answerResult: BattleAnswerResult | null;

  // End state
  endSummary: BattleEndSummary | null;
  countdownValue: number;        // 3, 2, 1

  // Matchmaking
  matchmakingStatus: 'idle' | 'queuing' | 'found';
  queueWaitTime: number;         // seconds elapsed in queue

  // Anti-cheat
  antiCheatFlags: number;

  // ── Actions ──
  /** Called after REST create/join — sets roomId, inviteCode, phase=LOBBY */
  initRoom: (roomId: string, inviteCode: string | null, username: string, isHost: boolean) => void;
  /** Opens the STOMP connection and subscribes to all 6 battle topics */
  connectToRoom: (roomId: string, username: string) => void;
  /** Submit an answer with built-in rapid-answer guard */
  submitAnswer: (answer: string) => void;
  /** Send a forfeit message and disconnect */
  forfeit: () => void;
  /** Full reset — disconnects WS, clears all state */
  disconnect: () => void;
  /** Manual phase override (for lobby host controls) */
  setPhase: (phase: BattlePhase) => void;
}

const INITIAL_STATE: Omit<BattleState,
  'initRoom' | 'connectToRoom' | 'submitAnswer' | 'forfeit' | 'disconnect' | 'setPhase'
> = {
  stompClient: null,
  connectionStatus: 'disconnected',
  lastError: null,
  phase: 'IDLE',
  roomId: null,
  inviteCode: null,
  myUsername: null,
  isHost: false,
  hostUsername: null,
  players: [],
  leaderboard: [],
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 10,
  timeLeft: 30,
  selectedAnswer: null,
  myAnswerLocked: false,
  answerResult: null,
  endSummary: null,
  countdownValue: 3,
  matchmakingStatus: 'idle',
  queueWaitTime: 0,
  antiCheatFlags: 0,
};

export const useBattleStore = create<BattleState>((set, get) => ({
  ...INITIAL_STATE,

  setPhase: (phase) => set({ phase }),

  initRoom: (roomId, inviteCode, username, isHost) => {
    set({ roomId, inviteCode, myUsername: username, isHost, phase: 'LOBBY' });
  },

  connectToRoom: (roomId, username) => {
    // Build WS URL using same logic as existing useLiveQuizStore
    const wsBase = window.location.hostname !== 'localhost'
      ? 'https://student-intelligence-system.onrender.com/ws'
      : (import.meta.env.VITE_WS_URL || 'http://localhost:8082/ws');

    const token = localStorage.getItem('jwt_token');
    const socket = new SockJS(`${wsBase}/quiz`);

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: token ? `Bearer ${token}` : '' },
      debug: (str) => {
        if (str.includes('ERROR') || str.startsWith('CONNECT') || str.startsWith('CONNECTED')) {
          console.log('[Battle WS]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    set({ connectionStatus: 'connecting', stompClient: client, myUsername: username, roomId });

    client.onConnect = () => {
      set({ connectionStatus: 'connected', lastError: null });
      _setupAntiCheat();
      _clearSubscriptions();

      // ── Topic 1: Full room state snapshot (reconnects / late join) ──
      _subscriptions.push(client.subscribe(
        `/topic/battle/${roomId}/state`,
        (msg) => {
          const state: BattleRoomState = JSON.parse(msg.body);
          set({
            phase: state.phase,
            players: state.players,
            leaderboard: [...state.players].sort((a, b) => b.score - a.score),
            questionIndex: state.questionIndex,
            totalQuestions: state.totalQuestions,
            hostUsername: state.hostUsername,
          });
        }
      ));

      // ── Topic 2: Player list updates (join/leave in lobby) ──
      _subscriptions.push(client.subscribe(
        `/topic/battle/${roomId}/players`,
        (msg) => {
          const players: BattlePlayer[] = JSON.parse(msg.body);
          set({ players, leaderboard: [...players].sort((a, b) => b.score - a.score) });
        }
      ));

      // ── Topic 3: New question pushed by backend ──
      _subscriptions.push(client.subscribe(
        `/topic/battle/${roomId}/question`,
        (msg) => {
          const question: BattleQuestion = JSON.parse(msg.body);
          _stopTimer();
          _startTimer(question.timeLimit);
          set({
            phase: 'IN_QUESTION',
            currentQuestion: question,
            selectedAnswer: null,
            myAnswerLocked: false,
            answerResult: null,
            timeLeft: question.timeLimit,
          });
        }
      ));

      // ── Topic 4: Answer revealed — correct answer + score deltas ──
      _subscriptions.push(client.subscribe(
        `/topic/battle/${roomId}/result`,
        (msg) => {
          const result: BattleAnswerResult = JSON.parse(msg.body);
          _stopTimer();
          set({
            phase: 'ANSWER_REVEALED',
            answerResult: result,
            myAnswerLocked: true,
            questionIndex: (get().questionIndex) + 1,
          });
        }
      ));

      // ── Topic 5: Live leaderboard (score-sorted) ──
      _subscriptions.push(client.subscribe(
        `/topic/battle/${roomId}/board`,
        (msg) => {
          const board: BattlePlayer[] = JSON.parse(msg.body);
          set({ leaderboard: board });
        }
      ));

      // ── Topic 6: Match end ──
      _subscriptions.push(client.subscribe(
        `/topic/battle/${roomId}/end`,
        (msg) => {
          const summary: BattleEndSummary = JSON.parse(msg.body);
          _stopTimer();
          _teardownAntiCheat();
          set({ phase: 'GAME_OVER', endSummary: summary, leaderboard: summary.finalBoard });
        }
      ));

      // ── Topic 7: Countdown (backend-driven 3-2-1 before first question) ──
      _subscriptions.push(client.subscribe(
        `/topic/battle/${roomId}/countdown`,
        (msg) => {
          const { value } = JSON.parse(msg.body) as { value: number };
          set({ phase: 'COUNTDOWN', countdownValue: value });
        }
      ));

      // Announce joining the room
      client.publish({
        destination: '/app/battle/join',
        body: JSON.stringify({ roomId, username }),
      });
    };

    client.onStompError = (frame) => {
      const errMsg = frame.headers['message'] || 'WebSocket connection failed';
      console.error('[Battle WS] STOMP Error:', errMsg, frame.body);
      set({ connectionStatus: 'error', lastError: errMsg });
    };

    client.onDisconnect = () => {
      const { phase } = get();
      if (phase !== 'GAME_OVER') {
        set({ connectionStatus: 'disconnected', lastError: 'Connection lost. Reconnecting...' });
      }
    };

    client.activate();
  },

  submitAnswer: (answer: string) => {
    const { stompClient, roomId, myUsername, currentQuestion, myAnswerLocked } = get();
    if (myAnswerLocked || !stompClient?.connected || !roomId || !currentQuestion) return;

    const timeTakenMs = Math.round(performance.now() - _questionReceivedAt);

    // Anti-cheat: rapid-answer guard (< 500ms is statistically impossible for legitimate human answers)
    const suspicious = timeTakenMs < 500;
    const delay = suspicious ? 300 : 0;
    if (suspicious) _publishFlag('RAPID_ANSWER');

    // Optimistically lock the UI immediately
    set({ selectedAnswer: answer, myAnswerLocked: true });

    setTimeout(() => {
      if (!stompClient.connected) return;
      stompClient.publish({
        destination: '/app/battle/answer',
        body: JSON.stringify({
          roomId,
          username: myUsername,
          questionId: currentQuestion.id,
          answer,
          timeTakenMs: timeTakenMs + delay,
        }),
      });
    }, delay);
  },

  forfeit: () => {
    const { stompClient, roomId, myUsername } = get();
    if (stompClient?.connected && roomId && myUsername) {
      stompClient.publish({
        destination: '/app/battle/leave',
        body: JSON.stringify({ roomId, username: myUsername }),
      });
    }
    get().disconnect();
  },

  disconnect: () => {
    _stopTimer();
    _stopQueueTimer();
    _teardownAntiCheat();
    _clearSubscriptions();
    const { stompClient } = get();
    if (stompClient) {
      try { stompClient.deactivate(); } catch { /* ignore */ }
    }
    set({ ...INITIAL_STATE });
  },
}));
