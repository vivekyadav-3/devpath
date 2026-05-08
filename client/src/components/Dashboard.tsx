import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Rocket, Lightbulb, MapPin, Calendar, Sparkles } from 'lucide-react';
import ScoreRings from './ScoreRings';

interface DashboardProps {
  data: any;
  onReset: () => void;
}

export default function Dashboard({ data, onReset }: DashboardProps) {
  const roadmap = data.roadmap;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20 w-full"
    >
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Analysis
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-5 py-2.5 glass-card rounded-full flex items-center gap-2 border-indigo-500/30 bg-indigo-500/10">
            <Target size={16} className="text-indigo-400" />
            <span className="text-sm font-bold tracking-wide">{data.targetCompany}</span>
          </div>
          <div className="px-5 py-2.5 glass-card rounded-full flex items-center gap-2 border-emerald-500/30 bg-emerald-500/10">
            <Rocket size={16} className="text-emerald-400" />
            <span className="text-sm font-bold uppercase tracking-widest">{data.level}</span>
          </div>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card p-6 md:p-8 flex justify-center items-center hover:bg-indigo-900/10 transition-colors">
          <ScoreRings score={data.scores.backend} label="Backend" color="#6366f1" />
        </div>
        <div className="glass-card p-6 md:p-8 flex justify-center items-center hover:bg-purple-900/10 transition-colors">
          <ScoreRings score={data.scores.frontend} label="Frontend" color="#a855f7" delay={0.1} />
        </div>
        <div className="glass-card p-6 md:p-8 flex justify-center items-center hover:bg-pink-900/10 transition-colors">
          <ScoreRings score={data.scores.systems} label="Systems" color="#ec4899" delay={0.2} />
        </div>
        <div className="glass-card p-6 md:p-8 flex justify-center items-center hover:bg-amber-900/10 transition-colors">
          <ScoreRings score={data.scores.consistency} label="Activity" color="#f59e0b" delay={0.3} />
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Skills & Gaps */}
        <div className="space-y-8 xl:col-span-1">
          <section className="glass-card p-8">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Lightbulb className="text-emerald-400" size={28} /> Skill Analysis
            </h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-xs uppercase text-slate-500 font-extrabold mb-4 tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Missing Gaps
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.missingSkills.map((s: string) => (
                    <span key={s} className="px-4 py-1.5 bg-red-500/10 text-red-300 border border-red-500/20 rounded-xl text-sm font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase text-slate-500 font-extrabold mb-4 tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Strong Foundations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.strongSkills.map((s: string) => (
                    <span key={s} className="px-4 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-sm font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={24} /> AI Summary
            </h3>
            <p className="text-slate-300 leading-relaxed text-lg font-light relative z-10">
              "{roadmap.skill_gap_summary}"
            </p>
          </section>
        </div>

        {/* Right Column: Roadmap Timeline */}
        <div className="xl:col-span-2 glass-card p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4 relative z-10">
            <h3 className="text-3xl font-black flex items-center gap-4 drop-shadow-lg">
              <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                <MapPin className="text-indigo-400" size={28} />
              </div>
              Career Roadmap
            </h3>
            <div className="text-left sm:text-right bg-black/20 p-4 rounded-2xl border border-white/5">
              <span className="block text-xs uppercase text-slate-500 font-black tracking-widest mb-1">Estimated Time</span>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                {roadmap.estimated_ready_in}
              </span>
            </div>
          </div>

          <div className="space-y-16 relative z-10 mt-8">
            {/* Timeline Line */}
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-30" />

            {roadmap.roadmap_steps.map((step: any, idx: number) => (
              <motion.div 
                key={step.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (idx * 0.1) }}
                className="relative pl-20"
              >
                <div className="absolute left-0 w-12 h-12 bg-slate-950 border-2 border-indigo-500 rounded-full flex items-center justify-center font-black text-lg z-10 shadow-[0_0_20px_rgba(99,102,241,0.4)] text-indigo-300">
                  {step.step}
                </div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white/5 hover:bg-white/10 p-6 rounded-2xl border border-white/5 transition-colors">
                  <div className="flex-1">
                    <h5 className="text-xl font-bold text-white mb-2 leading-snug">{step.action}</h5>
                    <p className="text-slate-400 text-base leading-relaxed">
                      {roadmap.projects_to_build[idx]?.why || "Complete this milestone to level up your technical foundations."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-widest shrink-0 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                    <Calendar size={16} /> {step.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-emerald-900/30 to-emerald-800/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 shadow-2xl">
            <div>
              <p className="text-lg text-emerald-100 font-bold mb-1">Hiring Probability Boost</p>
              <p className="text-sm text-emerald-400/70">Calculated based on completing all roadmap milestones</p>
            </div>
            <div className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              +{roadmap.hiring_probability_boost}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
