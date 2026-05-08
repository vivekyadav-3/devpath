import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, Cpu, Brain, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 1, text: 'Connecting to GitHub GraphQL...', icon: Terminal, color: 'text-blue-400' },
  { id: 2, text: 'Extracting 50 repositories...', icon: Database, color: 'text-indigo-400' },
  { id: 3, text: 'Running Logic Engine...', icon: Cpu, color: 'text-purple-400' },
  { id: 4, text: 'Calculating skill gaps...', icon: Brain, color: 'text-pink-400' },
  { id: 5, text: 'Consulting NVIDIA NIM AI...', icon: Brain, color: 'text-emerald-400' },
  { id: 6, text: 'Your DevPath is ready.', icon: CheckCircle2, color: 'text-emerald-500' },
];

export default function StoryMode() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(s => (s < STEPS.length - 1 ? s + 1 : s));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-32">
      <div className="glass-card p-12 w-full max-w-xl">
        <div className="space-y-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: isCompleted || isActive ? 1 : 0.2, 
                  x: 0,
                  scale: isActive ? 1.05 : 1
                }}
                className={`flex items-center gap-4 ${isActive ? step.color : 'text-slate-500'}`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                  <Icon size={24} />
                </div>
                <span className={`text-lg font-medium ${isActive ? 'text-white' : ''}`}>
                  {step.text}
                </span>
                {isCompleted && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <motion.p 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 text-slate-500 font-mono text-sm uppercase tracking-widest"
      >
        Processing data pipeline...
      </motion.p>
    </div>
  );
}
