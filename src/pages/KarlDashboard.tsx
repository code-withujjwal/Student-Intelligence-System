import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip,
} from 'recharts';
import {
  Zap, BookOpen, Brain, ArrowRight, RotateCcw, Sparkles, Loader2,
  TrendingUp, AlertTriangle, ChevronRight, Layers, Map, Target, Activity
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAdaptiveStore } from '../store/useAdaptiveStore';
import { aiApi } from '../api/aiApi';
import SkeletonLoader from '../components/SkeletonLoader';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const RADAR_DATA = [
  { subject: 'Mechanics', value: 72 },
  { subject: 'Optics', value: 45 },
  { subject: 'Organic', value: 61 },
  { subject: 'Calculus', value: 83 },
  { subject: 'Electro', value: 38 },
  { subject: 'Thermo', value: 55 },
];

const SCORE_TREND = [
  { day: 'Mon', score: 64 },
  { day: 'Tue', score: 71 },
  { day: 'Wed', score: 58 },
  { day: 'Thu', score: 82 },
  { day: 'Fri', score: 76 },
  { day: 'Sat', score: 89 },
  { day: 'Sun', score: 85 },
];

const WEAK_TOPICS = [
  { topic: 'Electromagnetic Induction', subject: 'Physics', urgency: 0.91, level: 'high' },
  { topic: 'Organic Reaction Mechanisms', subject: 'Chemistry', urgency: 0.67, level: 'medium' },
  { topic: 'Integral Calculus', subject: 'Math', urgency: 0.44, level: 'low' },
];

const FLASHCARD_COUNT = 12;

const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#6366F1',
  Chemistry: '#22d3ee',
  Math: '#a78bfa',
};

const TemperatureBar: React.FC<{ value: number; level: string }> = ({ value, level }) => (
  <div className="temperature-bar mt-2">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value * 100}%` }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
      className={`h-full rounded-full temperature-fill-${level}`}
    />
  </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="karl-card-inset px-3 py-2">
      <p className="label-caps mb-1">{label}</p>
      <p className="font-mono-data text-sm text-white font-semibold">{payload[0].value}</p>
    </div>
  );
};

const KarlDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [aiCoachFeedback, setAiCoachFeedback] = useState<string | null>(null);
  const [loadingAiCoach, setLoadingAiCoach] = useState(false);
  
  const { user } = useAuthStore();
  const { profile, prediction, recommendations, loading, fetchAdaptiveData } = useAdaptiveStore();

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      fetchAdaptiveData(user.id || 1).then(() => {
        // After fetching adaptive data, get AI Coach feedback
        const localProfile = useAdaptiveStore.getState().profile;
        if (localProfile) {
          setLoadingAiCoach(true);
          aiApi.getFeedback(JSON.stringify(localProfile))
            .then(res => setAiCoachFeedback(res.data))
            .catch(() => setAiCoachFeedback('Keep practicing to generate insights!'))
            .finally(() => setLoadingAiCoach(false));
        }
      });
    }
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, [user]);

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen surface-0 p-6 lg:p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-3"
      >
        <motion.div variants={item} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Zap className="w-4 h-4" style={{ color: '#6366F1' }} />
            </div>
            <div>
              <span className="label-caps">Project Karl</span>
              <p className="text-white font-semibold text-sm leading-none mt-0.5">Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/syllabus')}
              className="karl-btn-ghost flex items-center gap-2"
            >
              <Map className="w-3.5 h-3.5" /> Syllabus Map
            </button>
            {user && (user.role === 'TEACHER' || user.role === 'ADMIN') && (
              <button
                onClick={() => navigate('/teach')}
                className="karl-btn-ghost flex items-center gap-2"
              >
                <Brain className="w-3.5 h-3.5" /> Teacher Mode
              </button>
            )}
            <button
              onClick={() => navigate('/my-progress')}
              className="karl-btn-ghost flex items-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5" /> Analytics
            </button>
          </div>
        </motion.div>

        <div className="bento-grid">
          {loading ? (
            <>
              <SkeletonLoader className="col-span-12 lg:col-span-8 min-h-[160px]" />
              <SkeletonLoader className="col-span-12 lg:col-span-4 min-h-[160px]" />
              <SkeletonLoader type="chart" className="col-span-12 lg:col-span-5 h-[280px]" />
              <SkeletonLoader className="col-span-12 lg:col-span-4 h-[280px]" />
              <SkeletonLoader className="col-span-12 lg:col-span-3 h-[280px]" />
              <SkeletonLoader type="chart" className="col-span-12 h-[200px]" />
            </>
          ) : (
            <>
              <motion.div
                variants={item}
                className="col-span-12 lg:col-span-8 karl-card p-6 flex flex-col justify-between min-h-[160px]"
              >
            <div>
              <p className="label-caps mb-2">{greeting}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
                Ready to sharpen your edge,<br />
                <span style={{ color: '#6366F1' }}>Aspirant?</span>
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#94A3B8' }}>
                Your last session covered Kinematics — 3 questions remain unmarked.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/quiz-engine')}
                className="karl-btn-primary flex items-center gap-2"
              >
                Start Adaptive Quiz <Zap className="w-3.5 h-3.5" />
              </motion.button>
              {recommendations && (
                <span className="text-sm text-green-400 flex items-center gap-2 border border-green-500/20 bg-green-500/10 px-3 py-1.5 rounded-md">
                  <Target className="w-4 h-4" /> Recommended: {recommendations.nextRecommendedQuiz}
                </span>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="col-span-12 lg:col-span-4 karl-card p-5 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-center justify-between">
              <p className="label-caps">Revision Deck</p>
              <Layers className="w-4 h-4" style={{ color: '#94A3B8' }} />
            </div>
            <div className="flex-1 flex items-center justify-center py-4">
              <div className="relative">
                {[2, 1, 0].map(i => (
                  <div
                    key={i}
                    className="karl-card-inset absolute"
                    style={{
                      width: 160 - i * 8,
                      height: 90 - i * 6,
                      top: i * 4,
                      left: i * 4,
                      zIndex: 3 - i,
                    }}
                  />
                ))}
                <div className="karl-card-inset relative z-10 w-40 h-24 flex flex-col items-center justify-center gap-1" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                  <p className="font-mono-data text-2xl font-bold" style={{ color: '#6366F1' }}>{FLASHCARD_COUNT}</p>
                  <p className="label-caps">pending cards</p>
                </div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/my-progress')}
              className="karl-btn-primary w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Review Now
            </motion.button>
          </motion.div>

          <motion.div
            variants={item}
            className="col-span-12 lg:col-span-5 karl-card p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="label-caps">Subject Mastery</p>
              <span className="label-caps" style={{ color: '#6366F1' }}>Radar</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'Inter' }}
                />
                <Radar
                  name="Mastery"
                  dataKey="value"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.12}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={item}
            className="col-span-12 lg:col-span-4 karl-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="label-caps">Neural Gap Priority</p>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
            </div>
            <div className="space-y-4">
              {profile?.weakAreas.map((weakArea, i) => (
                <div key={i} className="glass-card p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-medium text-white leading-tight">{weakArea.split(' - ')[1] || weakArea}</p>
                      <p className="text-xs mt-0.5 text-red-400">
                        {weakArea.split(' - ')[0]}
                      </p>
                    </div>
                    <span className="font-mono-data text-xs font-semibold text-red-400 shrink-0">HIGH</span>
                  </div>
                </div>
              ))}
              
              {recommendations && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <p className="label-caps text-indigo-400">AI Learning Coach</p>
                  </div>
                  {loadingAiCoach ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="w-3 h-3 animate-spin" /> Thinking...</div>
                  ) : (
                    <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/50 pl-3 py-1">{aiCoachFeedback || 'No data yet.'}</p>
                  )}
                </div>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="karl-btn-ghost w-full flex items-center justify-center gap-2 mt-5"
            >
              View All Gaps <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>

          <motion.div
            variants={item}
            className="col-span-12 lg:col-span-3 karl-card p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="label-caps">AI Prediction Engine</p>
            </div>
            <div className="flex-1 space-y-4 mt-3">
              <div className="karl-card-inset px-3 py-2.5 flex items-center justify-between border border-primary/20">
                <p className="label-caps text-primary">Expected Score</p>
                <p className="font-mono-data font-bold text-white text-lg">
                  {prediction?.expectedScore || '--'}<span style={{ color: '#6366F1' }}>%</span>
                </p>
              </div>
              <div className="karl-card-inset px-3 py-2.5 flex items-center justify-between">
                <p className="label-caps">Risk Level</p>
                <p className={`font-mono-data font-bold text-sm ${prediction?.riskLevel === 'HIGH' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {prediction?.riskLevel || '--'}
                </p>
              </div>
              <div className="karl-card-inset px-3 py-2.5 flex items-center justify-between">
                <p className="label-caps">Avg Response</p>
                <p className="font-mono-data font-bold text-white text-sm">
                  {profile?.avgResponseTime || '--'}<span style={{ color: '#6366F1' }}>s</span>
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="col-span-12 karl-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="label-caps">Recent Performance — 7 Day Trend</p>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={SCORE_TREND} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[40, 100]}
                  tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.2)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366F1', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
          </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default KarlDashboard;
