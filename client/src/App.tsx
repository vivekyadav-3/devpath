import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, History, Trophy, Sparkles } from 'lucide-react';
import axios from 'axios';

// Component Imports
import SearchBar from './components/SearchBar';
import StoryMode from './components/StoryMode';
import Dashboard from './components/Dashboard';

const API_URL = 'http://localhost:3005/api';

export default function App() {
  const [view, setView] = useState<'home' | 'loading' | 'dashboard'>('home');
  const [analysisData, setAnalysisData] = useState<any>(null);

  const startAnalysis = async (username: string, targetCompany: string) => {
    setView('loading');
    try {
      const response = await axios.post(`${API_URL}/analyze`, { username, targetCompany });
      setAnalysisData(response.data);
      // Let the loading animation finish its "story" before showing dashboard
      setTimeout(() => setView('dashboard'), 3000); 
    } catch (error) {
      console.error('Analysis failed', error);
      alert('Failed to analyze profile. Check console for details.');
      setView('home');
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
            DevPath
          </h1>
        </div>
        
        <nav className="flex gap-6 text-sm font-bold text-slate-400">
          <button className="hover:text-white transition-colors flex items-center gap-2 tracking-wide uppercase">
            <Trophy size={16} className="text-emerald-400" /> Leaderboard
          </button>
          <button className="hover:text-white transition-colors flex items-center gap-2 tracking-wide uppercase">
            <History size={16} className="text-indigo-400" /> History
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center mt-20"
            >
              <h2 className="text-5xl md:text-8xl mb-6 max-w-4xl leading-tight font-black tracking-tighter drop-shadow-2xl">
                Your GitHub is a Story. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-xl">AI finds the next chapter.</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl font-light">
                Analyze your coding metrics across 50+ repositories. Get an AI-synthesized roadmap 
                to land your dream job at top tech companies.
              </p>
              
              <SearchBar onAnalyze={startAnalysis} />
            </motion.div>
          )}

          {view === 'loading' && (
            <StoryMode key="loading" />
          )}

          {view === 'dashboard' && analysisData && (
            <Dashboard key="dashboard" data={analysisData} onReset={() => setView('home')} />
          )}
        </AnimatePresence>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-70 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/40 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-fuchsia-600/30 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-purple-600/40 rounded-full blur-[150px] mix-blend-screen" />
      </div>
    </div>
  );
}
