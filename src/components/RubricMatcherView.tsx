import React, { useState } from 'react';
import { RUBRIC_MATCH_DATA } from '../data/questionsData';
import { UserStats, RubricMatchItem } from '../types';
import { TableProperties, CheckCircle2, RefreshCw, Award, Sparkles, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface RubricMatcherViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const RubricMatcherView: React.FC<RubricMatcherViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  // Shuffle descriptors
  const [descriptors, setDescriptors] = useState<RubricMatchItem[]>(() => {
    return [...RUBRIC_MATCH_DATA].sort(() => Math.random() - 0.5);
  });

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedDescId, setSelectedDescId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // levelId -> descId
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleSelectLevel = (levelId: string) => {
    if (isCompleted || matchedPairs[levelId]) return;
    soundManager.playClick();
    setSelectedLevelId(levelId);

    if (selectedDescId) {
      checkMatch(levelId, selectedDescId);
    }
  };

  const handleSelectDesc = (descId: string) => {
    if (isCompleted || Object.values(matchedPairs).includes(descId)) return;
    soundManager.playClick();
    setSelectedDescId(descId);

    if (selectedLevelId) {
      checkMatch(selectedLevelId, descId);
    }
  };

  const checkMatch = (levelId: string, descId: string) => {
    if (levelId === descId) {
      // Correct match!
      soundManager.playCorrect();
      const nextMatched = { ...matchedPairs, [levelId]: descId };
      setMatchedPairs(nextMatched);
      setSelectedLevelId(null);
      setSelectedDescId(null);

      if (Object.keys(nextMatched).length === RUBRIC_MATCH_DATA.length) {
        setIsCompleted(true);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });

        const newExp = stats.exp + 35;
        const badges = [...stats.badges];
        if (!badges.includes('badge_rubric_master')) badges.push('badge_rubric_master');

        onUpdateStats({
          exp: newExp,
          level: Math.floor(newExp / 100) + 1,
          totalCorrect: stats.totalCorrect + 1,
          competencyScores: {
            ...stats.competencyScores,
            rubricDesign: stats.competencyScores.rubricDesign + 30,
          },
          badges,
        });
      }
    } else {
      soundManager.playWrong();
      setSelectedLevelId(null);
      setSelectedDescId(null);
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    setMatchedPairs({});
    setSelectedLevelId(null);
    setSelectedDescId(null);
    setIsCompleted(false);
    setDescriptors([...RUBRIC_MATCH_DATA].sort(() => Math.random() - 0.5));
  };

  return (
    <div id="rubric-matcher-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TableProperties className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-emerald-200">
              GHÉP MA TRẬN RUBRIC ĐÁNH GIÁ NĂNG LỰC AI
            </h2>
            <p className="text-xs text-slate-300">
              Nhấp chọn 1 Cấp độ năng lực ở cột trái và ghép nối với Tiêu chí mô tả tương ứng ở cột phải.
            </p>
          </div>
        </div>
      </div>

      {/* Matching Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-300">
            Tiến độ ghép nối: {Object.keys(matchedPairs).length} / {RUBRIC_MATCH_DATA.length}
          </span>
          <button
            id="btn-reset-rubric"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm lại
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Proficiency Levels */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              1. Cấp Độ Đánh Giá Năng Lực (Tải Sản Phẩm AI)
            </h3>
            {RUBRIC_MATCH_DATA.map((item) => {
              const isMatched = !!matchedPairs[item.id];
              const isSelected = selectedLevelId === item.id;

              return (
                <div
                  key={item.id}
                  id={`rubric-level-${item.id}`}
                  onClick={() => handleSelectLevel(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isMatched
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                      : isSelected
                      ? 'bg-indigo-950/80 border-indigo-400 text-indigo-100 ring-2 ring-indigo-400'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white mb-0.5">
                        {item.criterionTitle}
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold">
                        {item.aiUseLevel}
                      </div>
                    </div>
                    {isMatched && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Descriptors */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              2. Tiêu Chí Hành Vi & Bằng Chứng Khảo Thí
            </h3>
            {descriptors.map((item) => {
              const isMatched = Object.values(matchedPairs).includes(item.id);
              const isSelected = selectedDescId === item.id;

              return (
                <div
                  key={item.id}
                  id={`rubric-desc-${item.id}`}
                  onClick={() => handleSelectDesc(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isMatched
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50 opacity-90'
                      : isSelected
                      ? 'bg-teal-950/80 border-teal-400 text-teal-100 ring-2 ring-teal-400'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-200'
                  }`}
                >
                  <div className="text-xs leading-relaxed">
                    {item.descriptor}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Victory Card */}
        {isCompleted && (
          <div className="bg-emerald-950/90 border border-emerald-500/50 rounded-2xl p-5 text-center space-y-2 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              Xuất Sắc! Thầy Cô Đã Hoàn Thành Ma Trận Rubric 4 Cấp Độ
            </h4>
            <p className="text-xs text-emerald-200 max-w-lg mx-auto">
              Ma trận này sẵn sàng áp dụng ngay cho các bài tập dự án, bài tập tự luận và thuyết trình có tích hợp công nghệ AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
