import api from './axios';

export interface ProgressOverview {
    totalXp: number;
    globalRank: number;
    accuracyPercentage: number;
    quizzesAttempted: number;
    questionsSolved: number;
    currentStreak: number;
}

export interface SubjectAnalytics {
    subject: string;
    accuracy: number;
    questionsSolved: number;
    averageScore: number;
    masteryPercentage: number;
    improvementTrend: number;
}

export interface QuizHistory {
    quizId: string;
    quizName: string;
    subject: string;
    date: string;
    score: number;
    accuracy: number;
    timeTaken: number;
    correctCount: number;
    incorrectCount: number;
    skippedCount: number;
}

export interface DailyChallengeAnalytics {
    challengesAttempted: number;
    challengesSolved: number;
    successRate: number;
    currentStreak: number;
    longestStreak: number;
    xpEarned: number;
}

export interface TopicMastery {
    topic: string;
    subject: string;
    chapter: string;
    accuracy: number;
    masteryPercentage: number;
    strength: 'WEAK' | 'AVERAGE' | 'STRONG';
}

export interface PerformanceTrend {
    date: string;
    xpGrowth: number;
    accuracyTrend: number;
    scoreTrend: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export const analyticsApi = {
    getProgressOverview: async () => {
        const response = await api.get<ApiResponse<ProgressOverview>>('/analytics/progress/overview');
        return response.data.data;
    },
    getSubjectAnalytics: async () => {
        const response = await api.get<ApiResponse<SubjectAnalytics[]>>('/analytics/progress/subjects');
        return response.data.data;
    },
    getQuizHistory: async () => {
        const response = await api.get<ApiResponse<QuizHistory[]>>('/analytics/progress/history');
        return response.data.data;
    },
    getDailyChallengeAnalytics: async () => {
        const response = await api.get<ApiResponse<DailyChallengeAnalytics>>('/analytics/progress/daily-challenges');
        return response.data.data;
    },
    getTopicMastery: async () => {
        const response = await api.get<ApiResponse<TopicMastery[]>>('/analytics/progress/topics');
        return response.data.data;
    },
    getPerformanceTrends: async () => {
        const response = await api.get<ApiResponse<PerformanceTrend[]>>('/analytics/progress/trends');
        return response.data.data;
    }
};
