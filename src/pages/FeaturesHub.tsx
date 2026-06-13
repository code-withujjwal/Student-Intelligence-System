import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Library,
  LineChart,
  History,
  Award,
  Gift,
  Bot,
  BrainCircuit,
  Flame,
  Swords,
  Trophy,
  Users,
  User,
  Settings,
  Bell,
  PlusCircle,
  Shield,
  ArrowLeft,
  Cpu,
  Database,
  BarChart,
  FileText,
  CheckSquare,
  Calendar,
  Archive,
  HelpCircle,
  Lock,
  Sparkles
} from 'lucide-react';
import { useFeaturesStore } from '../store/useFeaturesStore';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

const SECTORS = [
  {
    id: 'SEC_01',
    title: 'Learning Hub',
    description: 'Core Quizzes & Analytics',
    glowColor: 'indigo',
    items: [
      { id: 1, title: 'Start Quiz', desc: 'Jump right into your personalized learning journey.', icon: Play, status: 'Ready' },
      { id: 2, title: 'Quiz Categories', desc: 'Explore a wide variety of topics and subjects.', icon: Library, status: 'Active' },
      { id: 3, title: 'My Progress', desc: 'Track your learning milestones and statistics.', icon: LineChart, status: 'Tracking' },
      { id: 4, title: 'Quiz History', desc: 'Review your past attempts and learn from mistakes.', icon: History, status: 'Saved' },
      { id: 6, title: 'Achievements', desc: 'View badges and rewards you have unlocked.', icon: Award, status: 'New' },
      { id: 7, title: 'Rewards / XP', desc: 'Monitor your level and experience points.', icon: Gift, status: 'Active' },
    ]
  },
  {
    id: 'SEC_02',
    title: 'AI Intelligence',
    description: 'Smart Generation & Feedback',
    glowColor: 'purple',
    items: [
      { id: 8, title: 'AI Quiz Generator', desc: 'Create custom quizzes instantly with AI assistance.', icon: Bot, status: 'Active' },
      { id: 9, title: 'Performance Analysis', desc: 'Get deep AI-driven insights on your weak areas.', icon: BrainCircuit, status: 'Beta' },
      { id: 22, title: 'Engine Control', desc: 'Configure the AI parameters and difficulty.', icon: Cpu, status: 'Running' },
    ]
  },
  {
    id: 'SEC_03',
    title: 'Multiplayer Arena',
    description: 'Compete & Collaborate',
    glowColor: 'cyan',
    items: [
      { id: 10, title: 'Daily Challenge', desc: 'Complete time-sensitive tasks for bonus XP.', icon: Flame, status: 'Live' },
      { id: 11, title: 'Multiplayer Battle', desc: 'Challenge peers in real-time quiz matches.', icon: Swords, status: 'Matchmaking' },
      { id: 12, title: 'Leaderboard', desc: 'See where you stand globally among other learners.', icon: Trophy, status: 'Live' },
      { id: 14, title: 'Friends & Challenges', desc: 'Connect with friends and send direct challenges.', icon: Users, status: 'Online' },
    ]
  },
  {
    id: 'SEC_04',
    title: 'Administration',
    description: 'Settings & Management',
    glowColor: 'emerald',
    items: [
      { id: 16, title: 'My Profile', desc: 'Manage your personal information and preferences.', icon: User, status: 'Secure' },
      { id: 17, title: 'Settings', desc: 'Adjust your app experience and interface.', icon: Settings, status: 'Available' },
      { id: 18, title: 'Notifications', desc: 'View system alerts and upcoming events.', icon: Bell, status: '0 New' },
      { id: 19, title: 'Create Quiz', desc: 'Build and publish new quizzes to the platform.', icon: PlusCircle, status: 'Admin' },
      { id: 20, title: 'Manage Questions', desc: 'Edit, review, and organize the question bank.', icon: Database, status: 'Admin' },
      { id: 21, title: 'User Management', desc: 'Manage roles, permissions, and student data.', icon: Shield, status: 'Admin' },
    ]
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const getGlowStyles = (color: string) => {
  switch(color) {
    case 'indigo': return 'hover:border-indigo-400/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] bg-gradient-to-br from-white/[0.02] to-indigo-900/10 hover:to-indigo-900/30';
    case 'purple': return 'hover:border-purple-400/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] bg-gradient-to-br from-white/[0.02] to-purple-900/10 hover:to-purple-900/30';
    case 'cyan': return 'hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] bg-gradient-to-br from-white/[0.02] to-cyan-900/10 hover:to-cyan-900/30';
    case 'emerald': return 'hover:border-emerald-400/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-gradient-to-br from-white/[0.02] to-emerald-900/10 hover:to-emerald-900/30';
    default: return 'hover:border-slate-400/50 hover:shadow-[0_0_40px_rgba(148,163,184,0.2)] bg-gradient-to-br from-white/[0.02] to-slate-900/10 hover:to-slate-900/30';
  }
};

const getGridClasses = (sectorId: string) => {
  switch (sectorId) {
    case 'SEC_01': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    case 'SEC_02': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    case 'SEC_03': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
    case 'SEC_04': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    default: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  }
};

const getBadgeColor = (color: string) => {
  switch(color) {
    case 'indigo': return 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20';
    case 'purple': return 'text-purple-300 bg-purple-500/10 border-purple-500/20';
    case 'cyan': return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20';
    case 'emerald': return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    default: return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
  }
};

const getIconColor = (color: string) => {
  switch(color) {
    case 'indigo': return 'text-indigo-400 group-hover:text-indigo-300';
    case 'purple': return 'text-purple-400 group-hover:text-purple-300';
    case 'cyan': return 'text-cyan-400 group-hover:text-cyan-300';
    case 'emerald': return 'text-emerald-400 group-hover:text-emerald-300';
    default: return 'text-slate-400 group-hover:text-slate-300';
  }
};

export default function FeaturesHub() {
  const navigate = useNavigate();
  const store = useFeaturesStore();
  const { user } = useAuthStore();

  const isRestrictedForStudent = (itemId: number) => {
    const restrictedIds = [19, 20, 21, 22];
    return user?.role === 'STUDENT' && restrictedIds.includes(itemId);
  };

  const handleCardClick = (id: number) => {
    if (isRestrictedForStudent(id)) {
      toast.error('Access Denied', {
        description: 'Teacher clearance required for this operation.',
        id: 'teacher-auth-required-toast'
      });
      return;
    }
    switch (id) {
      case 1:
        navigate('/start');
        break;
      case 2:
        navigate('/categories');
        break;
      case 3:
      case 4:
        navigate('/my-progress');
        break;
      case 6:
      case 7:
        navigate('/achievements');
        break;
      case 8:
      case 9:
        navigate('/neural-cockpit');
        break;
      case 10:
        navigate('/daily-challenge');
        break;
      case 11:
        navigate('/battle');
        break;
      case 12:
        navigate('/leaderboard');
        break;
      case 14:
        navigate('/friends');
        break;
      case 16:
        navigate('/profile');
        break;
      case 17:
        navigate('/settings');
        break;
      case 18:
        navigate('/notifications');
        break;
      case 19:
        navigate('/quiz-creator');
        break;
      case 20:
        navigate('/manage-questions');
        break;
      case 21:
        navigate('/user-management');
        break;
      case 22:
        navigate('/karl-engine');
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-300 select-none p-6 lg:p-8"
      style={{
        background: '#040710',
        fontFamily: '"Outfit", "Inter", sans-serif',
      }}
    >
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-white/5 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white border border-white/10 cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-medium text-xs text-indigo-400 flex items-center gap-2 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Explore Platform Features
              </p>
              <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">
                Features Overview
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]" />
              <span className="text-sm font-medium text-slate-300">System Online</span>
            </div>
          </div>
        </header>

        <motion.div
          className="flex flex-col gap-14 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Quizzes', value: '24', icon: BarChart, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
              { label: 'Draft Quizzes', value: '5', icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
              { label: 'Published', value: '16', icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Scheduled', value: '2', icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { label: 'Archived', value: '1', icon: Archive, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { label: 'Questions Used', value: '1.2k', icon: HelpCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' }
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className={`backdrop-blur-xl border rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all hover:scale-105 ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {SECTORS.map((sector) => (
            <div key={sector.id} className="flex flex-col gap-6 text-left">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {sector.title}
                </h2>
                <span className="text-xs font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 hidden md:inline-block uppercase tracking-wider">
                  {sector.description}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4"></div>
              </div>

              <div className={getGridClasses(sector.id)}>
                {sector.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={isRestrictedForStudent(item.id) ? {} : { scale: 1.02, y: -4 }}
                      whileTap={isRestrictedForStudent(item.id) ? {} : { scale: 0.98 }}
                      onClick={() => handleCardClick(item.id)}
                      className={`group relative backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 ease-out ${isRestrictedForStudent(item.id) ? 'opacity-50 hover:border-red-500/30 cursor-not-allowed bg-white/5' : getGlowStyles(sector.glowColor)}`}
                    >
                      <div className="relative z-10 flex flex-col h-full text-left">
                        <div className="flex justify-between items-start mb-5">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border shadow-lg ${isRestrictedForStudent(item.id) ? 'bg-red-500/10 border-red-500/20' : getBadgeColor(sector.glowColor)}`}>
                            {isRestrictedForStudent(item.id) ? (
                              <Lock className="w-6 h-6 text-red-400" />
                            ) : (
                              <Icon className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${getIconColor(sector.glowColor)}`} />
                            )}
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md uppercase tracking-wider ${isRestrictedForStudent(item.id) ? 'text-red-400 bg-red-500/10 border-red-500/20' : getBadgeColor(sector.glowColor)}`}>
                            {isRestrictedForStudent(item.id) ? 'Locked' : item.status}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                          {item.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
