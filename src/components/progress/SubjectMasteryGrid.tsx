import React from 'react';
import { motion } from 'framer-motion';
import { SubjectAnalytics } from '../../api/analyticsApi';
import { BookOpen } from 'lucide-react';

interface SubjectMasteryGridProps {
  data: SubjectAnalytics[];
}

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

export const SubjectMasteryGrid: React.FC<SubjectMasteryGridProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
        <p className="text-slate-400">Complete quizzes across different subjects to see your mastery levels.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.map((subject, idx) => (
        <motion.div variants={item} key={idx} className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white tracking-wide">{subject.subject}</h3>
            </div>
            <span className="text-xs font-mono-data text-slate-400 bg-white/5 px-2 py-1 rounded-md">
              {subject.questionsSolved} Qs
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-400">Mastery</span>
                <span className="text-white font-mono-data font-medium">{subject.masteryPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.masteryPercentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Accuracy</p>
                <p className="text-sm text-slate-200 font-mono-data">{subject.accuracy}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Avg Score</p>
                <p className="text-sm text-slate-200 font-mono-data">{subject.averageScore}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
