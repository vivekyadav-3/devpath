import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const COMPANIES = ['Google', 'Amazon', 'Meta', 'Netflix', 'Microsoft', 'Apple', 'NVIDIA', 'OpenAI'];

interface SearchBarProps {
  onAnalyze: (username: string, company: string) => void;
}

export default function SearchBar({ onAnalyze }: SearchBarProps) {
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('Google');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onAnalyze(username.trim(), company);
    }
  };

  return (
    <motion.form 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
      onSubmit={handleSubmit}
      className="glass-card p-3 flex flex-col md:flex-row gap-3 w-full max-w-3xl relative group/form backdrop-blur-2xl bg-white/5 border-white/10 hover:border-indigo-500/30 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover/form:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
      
      <div className="flex-1 flex items-center px-5 gap-4 bg-black/20 rounded-2xl border border-white/5 focus-within:border-indigo-500/50 focus-within:bg-black/40 transition-all z-10">
        <Search className="text-indigo-400" size={22} />
        <input 
          type="text"
          placeholder="Enter GitHub Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-transparent border-none outline-none py-5 w-full text-lg text-white placeholder:text-slate-500 font-medium tracking-wide"
          required
        />
      </div>

      <div className="flex items-center px-5 gap-3 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors z-10 shrink-0">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Target</span>
        <select 
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="bg-transparent border-none outline-none py-5 text-white cursor-pointer font-bold appearance-none pr-4"
        >
          {COMPANIES.map(c => <option key={c} value={c} className="bg-slate-900 text-base">{c}</option>)}
        </select>
      </div>

      <button 
        type="submit"
        className="relative z-10 overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-5 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-95 shadow-lg shadow-indigo-500/25 shrink-0"
      >
        <span className="relative z-10 flex items-center gap-2 text-lg">
          Analyze Profile
          <ChevronRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
        </span>
      </button>
    </motion.form>
  );
}
