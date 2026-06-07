import React from 'react';
import { motion } from 'framer-motion';
import { DailyChallengeAnalytics as DailyStats } from '../../api/analyticsApi';
import { Flame, Star, Zap } from 'lucide-react';

interface DailyChallengeAnalyticsProps {
  data: DailyStats;
}

export const DailyChallengeAnalytics: React.FC<DailyChallengeAnalyticsProps> = ({ data }) => {
  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-black/40 border border-indigo-500/20">
      <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
        <Zap className="w-48 h-48 text-indigo-500" />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Daily Challenges</h2>
          <p className="text-sm text-indigo-200/60">Consistency forms mastery.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
          <p className="text-sm text-slate-400 mb-2">Solved</p>
          <p className="text-2xl font-bold text-white font-mono-data">
            {data.challengesSolved} <span className="text-sm font-normal text-slate-500">/ {data.challengesAttempted}</span>
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
          <p className="text-sm text-slate-400 mb-2">Success Rate</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono-data">
            {data.successRate}%
          </p>
        </div>

        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
             <p className="text-sm text-orange-200/70">Current Streak</p>
             <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-400 font-mono-data">
            {data.currentStreak}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
             <p className="text-sm text-yellow-200/70">XP Earned</p>
             <Star className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-400 font-mono-data">
            +{data.xpEarned}
          </p>
        </div>
      </div>
    </div>
  );
};
