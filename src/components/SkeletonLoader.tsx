import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  type?: 'card' | 'text' | 'chart';
  className?: string;
}

export default function SkeletonLoader({ type = 'card', className = '' }: SkeletonProps) {
  const baseClass = "bg-white/5 border border-white/10 rounded-xl overflow-hidden relative";
  
  const pulseVariant = {
    initial: { opacity: 0.5 },
    animate: { opacity: [0.5, 0.8, 0.5], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }
  };

  if (type === 'text') {
    return (
      <motion.div variants={pulseVariant} initial="initial" animate="animate" className={`h-4 bg-white/10 rounded-md ${className}`} />
    );
  }

  if (type === 'chart') {
    return (
      <motion.div variants={pulseVariant} initial="initial" animate="animate" className={`${baseClass} h-64 flex items-end p-4 gap-2 ${className}`}>
        {[40, 70, 30, 90, 50].map((h, i) => (
          <div key={i} className="flex-1 bg-white/10 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </motion.div>
    );
  }

  // Default Card
  return (
    <motion.div variants={pulseVariant} initial="initial" animate="animate" className={`${baseClass} p-5 ${className}`}>
      <div className="h-4 w-1/3 bg-white/10 rounded-md mb-4" />
      <div className="h-8 w-1/2 bg-white/10 rounded-md" />
    </motion.div>
  );
}
