import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { analyticsApi, ProgressOverview, SubjectAnalytics, QuizHistory, DailyChallengeAnalytics, TopicMastery, PerformanceTrend } from '../api/analyticsApi';
import SkeletonLoader from '../components/SkeletonLoader';
import { Target, TrendingUp, BookOpen, Clock, Activity, ArrowLeft, RefreshCw } from 'lucide-react';

import { ProgressOverviewCards } from '../components/progress/ProgressOverviewCards';
import { PerformanceTrendChart } from '../components/progress/PerformanceTrendChart';
import { SubjectMasteryGrid } from '../components/progress/SubjectMasteryGrid';
import { QuizHistoryTable } from '../components/progress/QuizHistoryTable';
import { DailyChallengeAnalytics as DailyStatsComponent } from '../components/progress/DailyChallengeAnalytics';

export default function MyProgress() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [subjects, setSubjects] = useState<SubjectAnalytics[]>([]);
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyChallengeAnalytics | null>(null);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  // const [topics, setTopics] = useState<TopicMastery[]>([]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewData, subjectsData, historyData, dailyData, trendsData] = await Promise.all([
        analyticsApi.getProgressOverview(),
        analyticsApi.getSubjectAnalytics(),
        analyticsApi.getQuizHistory(),
        analyticsApi.getDailyChallengeAnalytics(),
        analyticsApi.getPerformanceTrends()
      ]);
      setOverview(overviewData);
      setSubjects(subjectsData);
      setHistory(historyData);
      setDailyStats(dailyData);
      setTrends(trendsData);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p className="text-slate-400">Please log in to view your progress.</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Command Center
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            My Progress <Activity className="w-8 h-8 text-indigo-500" />
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Your performance intelligence system.</p>
        </div>
        
        <button 
          onClick={fetchAllData}
          disabled={loading}
          className="karl-btn-ghost flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} /> Sync
        </button>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonLoader key={i} className="h-32" />)}
          </div>
          <SkeletonLoader type="chart" className="h-80" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <SkeletonLoader className="h-48" />
             <SkeletonLoader className="h-48" />
             <SkeletonLoader className="h-48" />
          </div>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          
          {/* Section 1: Overview */}
          <motion.section variants={item}>
            {overview && <ProgressOverviewCards data={overview} />}
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section 2: Performance Trends */}
            <motion.section variants={item} className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> Performance Trends
                </h2>
                <div className="text-xs font-mono-data text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                  ALL TIME
                </div>
              </div>
              <PerformanceTrendChart data={trends} />
            </motion.section>

            {/* Section 3: Daily Challenges */}
            <motion.section variants={item} className="lg:col-span-1 flex flex-col justify-between">
               {dailyStats && <DailyStatsComponent data={dailyStats} />}
               
               <div className="glass-card p-6 rounded-2xl border border-indigo-500/10 mt-6 flex-1 flex flex-col justify-center items-center text-center">
                 <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                    <Target className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2">Recommendation Engine</h3>
                 <p className="text-sm text-slate-400">
                   Based on your recent trends, focus on improving your accuracy in <strong className="text-white font-medium">{subjects.length > 0 ? [...subjects].sort((a,b) => a.accuracy - b.accuracy)[0]?.subject : 'all areas'}</strong>.
                 </p>
                 <button onClick={() => navigate('/quiz-engine')} className="mt-6 karl-btn-primary w-full justify-center">
                   Practice Now
                 </button>
               </div>
            </motion.section>
          </div>

          {/* Section 4: Subject Analytics */}
          <motion.section variants={item}>
            <div className="flex items-center gap-2 mb-4 mt-4">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Subject Mastery</h2>
            </div>
            <SubjectMasteryGrid data={subjects} />
          </motion.section>

          {/* Section 5: Quiz History */}
          <motion.section variants={item}>
            <div className="flex items-center gap-2 mb-4 mt-4">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Quiz History</h2>
            </div>
            <QuizHistoryTable data={history} />
          </motion.section>

        </motion.div>
      )}
    </div>
  );
}
