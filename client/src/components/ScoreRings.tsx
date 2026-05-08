import React from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  label: string;
  color: string;
  size?: number;
  delay?: number;
}

export default function ScoreRings({ score, label, color, size = 160, delay = 0 }: ScoreRingProps) {
  const radius = size * 0.4;
  const strokeWidth = size * 0.1;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Track */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Bar */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay, ease: "easeOut" }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        
        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
            className="text-3xl font-extrabold tracking-tighter"
          >
            {score}
          </motion.span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</span>
        </div>
      </div>
    </div>
  );
}
