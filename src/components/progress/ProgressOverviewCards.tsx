import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, CheckCircle2, Flame, BrainCircuit, Activity } from 'lucide-react';
import { ProgressOverview } from '../../api/analyticsApi';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 1.5, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      // Easing function (easeOutExpo)
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(end * easeOut);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toFixed(decimals)}{suffix}</span>;
};

interface ProgressOverviewCardsProps {
  data: ProgressOverview;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export const ProgressOverviewCards: React.FC<ProgressOverviewCardsProps> = ({ data }) => {
  const stats = [
    {
      title: 'Total XP',
      value: <CountUp end={data.totalXp} />,
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      color: 'border-yellow-500/20 bg-yellow-500/5'
    },
    {
      title: 'Global Rank',
      value: <CountUp end={data.globalRank} />,
      icon: <Target className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/20 bg-indigo-500/5'
    },
    {
      title: 'Accuracy',
      value: <CountUp end={data.accuracyPercentage} decimals={1} suffix="%" />,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/20 bg-emerald-500/5'
    },
    {
      title: 'Current Streak',
      value: <CountUp end={data.currentStreak} suffix=" Days" />,
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      color: 'border-orange-500/20 bg-orange-500/5'
    },
    {
      title: 'Quizzes Taken',
      value: <CountUp end={data.quizzesAttempted} />,
      icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/20 bg-purple-500/5'
    },
    {
      title: 'Questions Solved',
      value: <CountUp end={data.questionsSolved} />,
      icon: <Activity className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/20 bg-blue-500/5'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          variants={item}
          key={i}
          className={`glass-card p-5 rounded-2xl border ${stat.color} hover:bg-white/[0.02] transition-colors relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2">
            {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-16 h-16' })}
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 shadow-inner">
              {stat.icon}
            </div>
            <h3 className="text-sm font-medium text-slate-400 tracking-wide">{stat.title}</h3>
          </div>
          <p className="text-3xl font-bold text-white font-mono-data tracking-tight drop-shadow-md">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
