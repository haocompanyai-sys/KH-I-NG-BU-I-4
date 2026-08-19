import React from 'react';
import { GameMode, UserStats } from '../types';
import { 
  Trophy, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  SearchCheck, 
  Terminal, 
  TableProperties, 
  Timer, 
  BrainCircuit, 
  Bot
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  stats: UserStats;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  stats,
  isMuted,
  onToggleMute,
}) => {
  const modes: { id: GameMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'campaign', label: 'Tháp Khảo Thí', icon: <Trophy className="w-4 h-4" /> },
    { id: 'hallucination_hunter', label: 'Bẫy Ảo Giác AI', icon: <SearchCheck className="w-4 h-4" /> },
    { id: 'prompt_battle', label: 'Đấu Trường Prompt', icon: <Terminal className="w-4 h-4" /> },
    { id: 'rubric_matcher', label: 'Ghép Rubric AI', icon: <TableProperties className="w-4 h-4" /> },
    { id: 'speed_sorter', label: 'Phân Loại Cấp Tốc', icon: <Timer className="w-4 h-4" /> },
    { id: 'gemini_live', label: 'AI Đấu Trí Live', icon: <Bot className="w-4 h-4 text-emerald-400" />, badge: 'Gemini 3.7' },
    { id: 'handbook', label: 'Cẩm Nang Khảo Thí', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'analytics', label: 'Hồ Sơ Năng Lực', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header id="app-main-header" className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top bar: Brand + Gamification metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-200 via-white to-purple-200 bg-clip-text text-transparent">
                  ĐẤU TRƯỜNG ĐÁNH GIÁ AI
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  EdTech 4.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Làm chủ phương pháp Kiểm tra & Đánh giá Nâng cao thời kỳ Trí tuệ Nhân tạo
              </p>
            </div>
          </div>

          {/* User gamified badge bar */}
          <div className="flex items-center flex-wrap gap-2.5 justify-end">
            {/* Level & Rank */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl shadow-inner">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs font-black">
                {stats.level}
              </div>
              <div className="text-left leading-none">
                <span className="text-[10px] uppercase text-slate-400 block font-medium">Cấp bậc</span>
                <span className="text-xs font-bold text-amber-300">{stats.rankTitle}</span>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="hidden md:flex flex-col gap-1 w-28 bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-xl">
              <div className="flex justify-between text-[10px] text-slate-300 font-semibold">
                <span className="flex items-center gap-0.5 text-indigo-300">
                  <Sparkles className="w-2.5 h-2.5" /> EXP
                </span>
                <span>{stats.exp % 100}/100</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.exp % 100}%` }}
                ></div>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-orange-950/40 border border-orange-500/30 px-3 py-1.5 rounded-xl text-orange-400 font-bold text-xs">
              <Flame className={`w-4 h-4 ${stats.streak > 0 ? 'text-orange-500 animate-bounce' : 'text-slate-500'}`} />
              <span>Chuỗi: {stats.streak}</span>
            </div>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={() => {
                onToggleMute();
                soundManager.playClick();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 scrollbar-none">
          {modes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                id={`tab-mode-${m.id}`}
                onClick={() => {
                  soundManager.playClick();
                  onSelectMode(m.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30 ring-1 ring-indigo-400/20'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
                {m.badge && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 ml-1">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
