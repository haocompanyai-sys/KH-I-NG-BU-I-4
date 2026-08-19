import React from 'react';
import { UserStats } from '../types';
import { BADGES_DATA } from '../data/questionsData';
import { 
  BarChart3, 
  Award, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Terminal, 
  TableProperties, 
  SearchCheck,
  Crown
} from 'lucide-react';

interface AnalyticsViewProps {
  stats: UserStats;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats }) => {
  const accuracy = stats.totalAnswered > 0 
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) 
    : 100;

  const competencies = [
    { label: 'Lý thuyết & Thang đo Bloom', value: Math.min(100, stats.competencyScores.assessmentTheory + 20), color: 'bg-indigo-500' },
    { label: 'Đạo đức, Liêm chính & Chống ảo giác', value: Math.min(100, stats.competencyScores.ethicsAndIntegrity + 20), color: 'bg-amber-500' },
    { label: 'Kỹ thuật Prompt Sư phạm', value: Math.min(100, stats.competencyScores.promptCrafting + 20), color: 'bg-purple-500' },
    { label: 'Xây dựng Ma trận Rubric 4.0', value: Math.min(100, stats.competencyScores.rubricDesign + 20), color: 'bg-emerald-500' },
    { label: 'Ứng dụng Đánh giá Thực chất', value: Math.min(100, stats.competencyScores.practicalAIIntegration + 20), color: 'bg-teal-500' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'SearchCheck': return <SearchCheck className="w-5 h-5" />;
      case 'TableProperties': return <TableProperties className="w-5 h-5" />;
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'Crown': return <Crown className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div id="analytics-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-purple-200">
              HỒ SƠ NĂNG LỰC KHẢO THÍ & ĐÁNH GIÁ AI
            </h2>
            <p className="text-xs text-slate-300">
              Theo dõi sự tiến bộ, phân tích 5 miền năng lực chuyên môn và bộ sưu tập huy hiệu thành tựu sư phạm.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Cấp độ hiện tại</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">Level {stats.level}</span>
          <span className="text-[10px] text-slate-400">{stats.rankTitle}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Tỷ lệ chính xác</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{accuracy}%</span>
          <span className="text-[10px] text-slate-400">{stats.totalCorrect} / {stats.totalAnswered} câu</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Chuỗi đúng cao nhất</span>
          <span className="text-2xl font-black text-orange-400 mt-1 block flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 text-orange-500" /> {stats.highestStreak}
          </span>
          <span className="text-[10px] text-slate-400">Combo liên tiếp</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Tổng kinh nghiệm</span>
          <span className="text-2xl font-black text-indigo-400 mt-1 block">{stats.exp}</span>
          <span className="text-[10px] text-slate-400">EXP tích lũy</span>
        </div>
      </div>

      {/* Competency Breakdown Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Phân Tích 5 Miền Năng Lực Sư Phạm Số
        </h3>

        <div className="space-y-4 pt-1">
          {competencies.map((comp, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{comp.label}</span>
                <span className="text-indigo-300 font-bold">{comp.value}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`${comp.color} h-full rounded-full transition-all duration-700`}
                  style={{ width: `${comp.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Award className="w-5 h-5 text-amber-400" />
          Huy Hiệu & Vinh Danh Chuyên Môn
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {BADGES_DATA.map((b) => {
            const isUnlocked = stats.badges.includes(b.id) || (b.id === 'badge_novice' && stats.totalAnswered > 0);

            return (
              <div
                key={b.id}
                id={`badge-card-${b.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/80 border-amber-500/40 text-slate-100 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-slate-850 border-slate-800 text-slate-500 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${b.color} ${!isUnlocked && 'grayscale'}`}>
                    {getIcon(b.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{b.name}</h4>
                    <span className="text-[10px] font-semibold text-amber-400">
                      {isUnlocked ? '✓ Đã Mở Khóa' : 'Chưa mở khóa'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
