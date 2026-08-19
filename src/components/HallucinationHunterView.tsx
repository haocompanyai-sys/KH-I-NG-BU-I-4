import React, { useState } from 'react';
import { HALLUCINATION_CHALLENGES } from '../data/questionsData';
import { UserStats } from '../types';
import { 
  SearchCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  Lightbulb 
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface HallucinationHunterViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const HallucinationHunterView: React.FC<HallucinationHunterViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState<number | null>(null);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);

  const challenge = HALLUCINATION_CHALLENGES[currentIdx];

  const handleSelectSnippet = (index: number) => {
    if (isEvaluated) return;
    soundManager.playClick();
    setSelectedSnippetIdx(index);
  };

  const handleVerify = () => {
    if (selectedSnippetIdx === null || isEvaluated) return;
    setIsEvaluated(true);

    const isCorrect = selectedSnippetIdx === challenge.flawedIndex;
    if (isCorrect) {
      soundManager.playCorrect();
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#6366f1']
      });

      const newExp = stats.exp + 30;
      const newLevel = Math.floor(newExp / 100) + 1;
      const newCompetency = {
        ...stats.competencyScores,
        ethicsAndIntegrity: stats.competencyScores.ethicsAndIntegrity + 25,
      };

      const badges = [...stats.badges];
      if (!badges.includes('badge_hallucination_hunter')) {
        badges.push('badge_hallucination_hunter');
      }

      onUpdateStats({
        exp: newExp,
        level: newLevel,
        streak: stats.streak + 1,
        highestStreak: Math.max(stats.highestStreak, stats.streak + 1),
        totalAnswered: stats.totalAnswered + 1,
        totalCorrect: stats.totalCorrect + 1,
        competencyScores: newCompetency,
        badges,
      });
    } else {
      soundManager.playWrong();
      onUpdateStats({
        streak: 0,
        totalAnswered: stats.totalAnswered + 1,
      });
    }
  };

  const handleNextChallenge = () => {
    soundManager.playClick();
    setCurrentIdx((prev) => (prev + 1) % HALLUCINATION_CHALLENGES.length);
    setSelectedSnippetIdx(null);
    setIsEvaluated(false);
  };

  return (
    <div id="hallucination-hunter-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <SearchCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-amber-200">
              VẠCH TRẦN ẢO GIÁC & THIÊN KIẾN AI
            </h2>
            <p className="text-xs text-slate-300">
              Đọc kỹ văn bản đề thi do AI sinh ra và nhấp chọn trực tiếp đoạn văn chứa "ảo giác dữ liệu", "thiên kiến ngầm" hoặc "phương án nhiễu vô nghĩa".
            </p>
          </div>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Thử thách {currentIdx + 1} / {HALLUCINATION_CHALLENGES.length}: {challenge.title}
          </span>
          <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            Loại lỗi cần tìm: {challenge.flawType}
          </span>
        </div>

        {/* Context */}
        <div className="text-sm text-slate-300 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
          <span className="font-semibold text-amber-300 block mb-1">Bối cảnh khảo thí:</span>
          {challenge.context}
        </div>

        {/* AI Output Snippets (Clickable) */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            👇 Nhấp chọn phương án có lỗi ảo giác hoặc thiên kiến:
          </span>
          {challenge.aiOutputSnippet.map((text, idx) => {
            const isSelected = selectedSnippetIdx === idx;
            const isFlawed = challenge.flawedIndex === idx;

            let cardStyle = 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-200';
            if (isEvaluated) {
              if (isFlawed) {
                cardStyle = 'bg-amber-950/90 border-amber-500 text-amber-100 ring-2 ring-amber-500/60';
              } else if (isSelected && !isFlawed) {
                cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
              } else {
                cardStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
              }
            } else if (isSelected) {
              cardStyle = 'bg-amber-950/70 border-amber-400 text-amber-100 ring-2 ring-amber-400/50';
            }

            return (
              <div
                key={idx}
                id={`snippet-${idx}`}
                onClick={() => handleSelectSnippet(idx)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${cardStyle}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="text-sm leading-relaxed flex-1">
                    {text}
                  </div>
                  {isEvaluated && isFlawed && (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Evaluation controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            {selectedSnippetIdx !== null ? `Đã chọn đoạn #${selectedSnippetIdx + 1}` : 'Chưa chọn đoạn nào'}
          </span>

          <div className="flex items-center gap-2">
            {!isEvaluated ? (
              <button
                id="btn-verify-hallucination"
                onClick={handleVerify}
                disabled={selectedSnippetIdx === null}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <SearchCheck className="w-4 h-4" />
                Vạch Trần Lỗi Này
              </button>
            ) : (
              <button
                id="btn-next-hallucination"
                onClick={handleNextChallenge}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                Thử Thách Tiếp Theo
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Detailed Explanation Box */}
        {isEvaluated && (
          <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Phân Tích Sư Phạm & Bản Chất Ảo Giác AI:</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {challenge.explanation}
            </p>
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
              <span className="font-bold block mb-1">✓ Phương án hiệu chỉnh chuẩn mực:</span>
              {challenge.correctAlternative}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
