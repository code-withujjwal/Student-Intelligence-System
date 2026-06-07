import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import NotificationsFeed from '../components/NotificationsFeed';
import SkeletonLoader from '../components/SkeletonLoader';
import { Download, Target, TrendingUp, BookOpen, Clock, BarChart3, Users, Award, ArrowLeft } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line 
} from 'recharts';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    platformStats, studentStats, teacherStats, loading, 
    fetchPlatformAnalytics, fetchStudentAnalytics, fetchTeacherAnalytics, downloadStudentReport 
  } = useAnalyticsStore();

  useEffect(() => {
    if (!user) return;
    
    // Always fetch platform stats for demo
    fetchPlatformAnalytics();

    if (user.role === 'STUDENT') {
      fetchStudentAnalytics(user.id || 1); // fallback ID 1
    } else {
      fetchTeacherAnalytics(user.id || 1);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <SkeletonLoader type="text" className="w-1/3 h-8 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
        <SkeletonLoader type="chart" className="mt-8" />
      </div>
    );
  }

  // Dummy Chart Data for Recharts Display
  const scoreTrends = [
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 72 },
    { name: 'Week 3', score: 85 },
    { name: 'Week 4', score: 82 },
    { name: 'Week 5', score: 90 },
  ];

  const subjectDist = [
    { name: 'DSA', value: 400 },
    { name: 'DBMS', value: 300 },
    { name: 'OS', value: 300 },
    { name: 'Networks', value: 200 },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/features')}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Back to Command Center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Engine</h1>
            <p className="text-muted-foreground mt-1">Real-time performance and insights.</p>
          </div>
        </div>
        {user?.role === 'STUDENT' && (
          <button 
            onClick={() => downloadStudentReport(user.id || 1)}
            className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-colors border border-primary/50"
          >
            <Download className="w-4 h-4" />
            Export PDF Report
          </button>
        )}
      </div>

      {user?.role === 'STUDENT' && studentStats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Student Performance Engine
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<TrendingUp />} label="Average Accuracy" value={`${studentStats.averageAccuracy}%`} color="text-green-400" />
            <StatCard icon={<BookOpen />} label="Strongest Subject" value={studentStats.strongestSubject} color="text-blue-400" />
            <StatCard icon={<AlertTriangle />} label="Weakest Subject" value={studentStats.weakestSubject} color="text-red-400" />
            <StatCard icon={<Clock />} label="Avg Completion Time" value={`${studentStats.averageCompletionTime}m`} color="text-purple-400" />
          </div>

          <div className="glass-card p-6 rounded-2xl h-80 mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Score Trend Analysis</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && teacherStats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Teacher Insights Panel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={<BookOpen />} label="Quizzes Created" value={teacherStats.totalQuizzesCreated} color="text-blue-400" />
              <StatCard icon={<Users />} label="Students Reached" value={teacherStats.totalStudentsReached} color="text-green-400" />
              <StatCard icon={<Award />} label="Avg Quiz Score" value={`${teacherStats.averageQuizScore}%`} color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <h4 className="text-sm font-medium text-red-400 mb-1">Hardest Question (Most Failed)</h4>
                <p className="text-white">"{teacherStats.hardestQuestion}"</p>
              </div>
              <div className="glass-card p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                <h4 className="text-sm font-medium text-green-400 mb-1">Easiest Question (Highest Pass)</h4>
                <p className="text-white">"{teacherStats.easiestQuestion}"</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Platform Global Metrics</h2>
            {platformStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Users />} label="Total Users" value={platformStats.totalUsers} />
                <StatCard icon={<Target />} label="Active Sessions" value={platformStats.activeUsers} />
                <StatCard icon={<BarChart3 />} label="Platform Avg" value={`${platformStats.averageScore}%`} />
                <StatCard icon={<Award />} label="Completion Rate" value={`${platformStats.completionRate}%`} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl h-80">
                <h3 className="text-lg font-medium text-white mb-4">Subject Popularity Matrix</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                    <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-1">
                <NotificationsFeed />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
    </div>
  );
}

// Helper Component for consistency
function StatCard({ icon, label, value, color = "text-primary" }: { icon: React.ReactNode, label: string, value: string | number, color?: string }) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-black/50 ${color}`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

// Temporary icon for AlertTriangle since it might not be imported above
function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  );
}
