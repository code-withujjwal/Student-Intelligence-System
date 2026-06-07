import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizHistory } from '../../api/analyticsApi';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface QuizHistoryTableProps {
  data: QuizHistory[];
}

export const QuizHistoryTable: React.FC<QuizHistoryTableProps> = ({ data }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
        <p className="text-slate-400">No attempts yet. Complete your first quiz to unlock history.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-black/40 text-slate-400 font-medium tracking-wide">
          <tr>
            <th className="px-6 py-4">Quiz</th>
            <th className="px-6 py-4">Subject</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Score</th>
            <th className="px-6 py-4">Accuracy</th>
            <th className="px-6 py-4">Time</th>
            <th className="px-6 py-4 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-white/[0.01]">
          {data.map((item, idx) => (
            <React.Fragment key={idx}>
              <tr 
                className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                onClick={() => setExpandedId(expandedId === item.quizId + idx ? null : item.quizId + idx)}
              >
                <td className="px-6 py-4 text-white font-medium">{item.quizName}</td>
                <td className="px-6 py-4 text-slate-300">{item.subject}</td>
                <td className="px-6 py-4 text-slate-400 font-mono-data">
                  {format(new Date(item.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 font-mono-data font-semibold text-indigo-400">
                  {item.score}
                </td>
                <td className="px-6 py-4 font-mono-data">
                  <span className={`px-2 py-1 rounded-md bg-white/5 ${item.accuracy >= 80 ? 'text-emerald-400' : item.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {item.accuracy}%
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 font-mono-data">{Math.round(item.timeTaken / 60)}m {item.timeTaken % 60}s</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    {expandedId === item.quizId + idx ? <ChevronUp className="w-5 h-5 ml-auto" /> : <ChevronDown className="w-5 h-5 ml-auto" />}
                  </button>
                </td>
              </tr>
              <AnimatePresence>
                {expandedId === item.quizId + idx && (
                  <tr>
                    <td colSpan={7} className="p-0 border-0">
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/20"
                      >
                        <div className="px-6 py-5 flex items-center gap-8">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-slate-300">Correct: <strong className="text-white font-mono-data">{item.correctCount}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-slate-300">Incorrect: <strong className="text-white font-mono-data">{item.incorrectCount}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MinusCircle className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-300">Skipped: <strong className="text-white font-mono-data">{item.skippedCount}</strong></span>
                          </div>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
