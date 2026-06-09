import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
}

interface LiveQuizState {
  stompClient: Client | null;
  sessionId: string | null;
  username: string | null;
  isConnected: boolean;
  leaderboard: LeaderboardEntry[];
  connectWebSocket: (sessionId: string, username: string) => void;
  disconnectWebSocket: () => void;
  submitAnswer: (questionId: number, answer: string, timeTakenSeconds: number) => void;
}

export const useLiveQuizStore = create<LiveQuizState>((set, get) => ({
  stompClient: null,
  sessionId: null,
  username: null,
  isConnected: false,
  leaderboard: [],

  connectWebSocket: (sessionId: string, username: string) => {
    const token = localStorage.getItem('jwt_token');
    
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8082/ws';
    const socket = new SockJS(`${wsBaseUrl}/quiz`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      debug: (str) => console.log('STOMP: ', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      set({ isConnected: true, stompClient, sessionId, username });
      console.log('Connected to WebSocket');

      // Subscribe to leaderboard
      stompClient.subscribe(`/topic/session/${sessionId}/leaderboard`, (message) => {
        if (message.body) {
          set({ leaderboard: JSON.parse(message.body) });
        }
      });

      // Join the session
      stompClient.publish({
        destination: '/app/quiz/join',
        body: JSON.stringify({ sessionId, username }),
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    stompClient.activate();
  },

  disconnectWebSocket: () => {
    const { stompClient } = get();
    if (stompClient) {
      stompClient.deactivate();
    }
    set({ isConnected: false, stompClient: null, sessionId: null, username: null });
  },

  submitAnswer: (questionId: number, answer: string, timeTakenSeconds: number) => {
    const { stompClient, sessionId, username } = get();
    if (stompClient && stompClient.connected && sessionId && username) {
      stompClient.publish({
        destination: '/app/quiz/answer',
        body: JSON.stringify({
          sessionId,
          username,
          questionId,
          answer,
          timeTakenSeconds
        }),
      });
    } else {
      console.error('Cannot submit answer: Stomp client not connected');
    }
  }
}));
