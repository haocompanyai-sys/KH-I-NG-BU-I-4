import React, { useState, useEffect } from 'react';
import { SPEED_SORT_CARDS } from '../data/questionsData';
import { UserStats, SpeedSortCard } from '../types';
import { Timer, Zap, CheckCircle2, XCircle, RotateCcw, Award, Play } from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface SpeedSortViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

const CATEGORIES = [
  { id: 'Diagnostic (Chẩn đoán)', label: 'Chẩn Đoán (Diagnostic)', color: 'from-amber-600 to-orange-600', border: 'border-amber-500/40' },
  { id: 'Formative (Quá trình)', label: 'Quá Trình (Formative)', color: 'from-blue-600 to-indigo-600', border: 'border-blue-500/40' },
  { id: 'Summative (Tổng kết)', label: 'Tổng Kết (Summative)', color: 'from-purple-600 to-pink-600', border: 'border-purple-500/40' },
  { id: 'Authentic (Thực chất)', label: 'Thực Chất (Authentic)', color: 'from-emerald-600 to-teal-600', border: 'border-emerald-500/40' },
];

export const SpeedSortView: React.FC<SpeedSortViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const currentCard: SpeedSortCard | undefined = SPEED_SORT_CARDS[currentIdx];

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, isFinished]);

  const handleStartGame = () => {
    soundManager.playClick();
    setIsPlaying(true);
    setTimeLeft(45);
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setFeedback(null);
  };

  const handleGameOver = () => {
    setIsFinished(true);
    setIsPlaying(false);
    soundManager.playLevelUp();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });

    const newExp = stats.exp + score * 10;
    onUpdateStats({
      exp: newExp,
      level: Math.floor(newExp / 100) + 1,
      totalAnswered: stats.totalAnswered + currentIdx,
      totalCorrect: stats.totalCorrect + score,
      competencyScores: {
        ...stats.competencyScores,
        assessmentTheory: stats.competencyScores.assessmentTheory + score * 5,
      }
    });
  };

  const handleSort = (category: string) => {
    if (!currentCard || !isPlaying || isFinished) return;

    const isCorrect = currentCard.correctCategory === category;
    if (isCorrect) {
      soundManager.playCorrect();
      setScore((prev) => prev + 1);
      setFeedback({ isCorrect: true, text: `✓ Chính xác! ${currentCard.explanation}` });
    } else {
      soundManager.playWrong();
      setFeedback({ isCorrect: false, text: `✗ Chưa đúng. Đây là: ${currentCard.correctCategory}. ${currentCard.explanation}` });
    }

    if (currentIdx + 1 >= SPEED_SORT_CARDS.length) {
      handleGameOver();
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  return (
    <div id="speed-sort-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-blue-200">
                PHÂN LOẠI KHẢO THÍ CẤP TỐC (SPEED ASSESSMENT SORT)
              </h2>
              <p className="text-xs text-slate-300">
                Phân loại nhanh các tình huống thực tiễn vào 4 trụ cột đánh giá trong thời gian có hạn!
              </p>
            </div>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-amber-400 font-bold text-sm">
              <Timer className="w-5 h-5 animate-spin" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Game Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
        {!isPlaying && !isFinished && (
          <div className="py-10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 mx-auto flex items-center justify-center">
              <Timer className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Sẵn sàng thử thách tốc độ phản xạ sư phạm?</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Bạn có 45 giây để phân loại chính xác các kỹ thuật kiểm tra đánh giá tích hợp AI.
            </p>
            <button
              id="btn-start-speed-game"
              onClick={handleStartGame}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Bắt Đầu Trò Chơi
            </button>
          </div>
        )}

        {isPlaying && currentCard && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>Thẻ {currentIdx + 1} / {SPEED_SORT_CARDS.length}</span>
              <span className="text-emerald-400 font-bold">Điểm số: {score}</span>
            </div>

            {/* Current Scenario Card */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-850 border border-slate-700 rounded-2xl p-6 shadow-inner text-sm sm:text-base font-semibold text-white leading-relaxed min-h-[120px] flex items-center justify-center">
              "{currentCard.text}"
            </div>

            {/* Feedback alert */}
            {feedback && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                feedback.isCorrect ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
              }`}>
                {feedback.text}
              </div>
            )}

            {/* 4 Classification Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`btn-cat-${cat.id}`}
                  onClick={() => handleSort(cat.id)}
                  className={`p-4 rounded-xl border bg-gradient-to-r ${cat.color} ${cat.border} text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95 text-left`}
                >
                  <div className="text-[10px] uppercase opacity-80 mb-0.5">Phân loại vào:</div>
                  <div className="text-sm truncate">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isFinished && (
          <div className="py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Hoàn Thành Thử Thách Cấp Tốc!</h3>
            <p className="text-sm text-slate-300">
              Kết quả: <strong className="text-emerald-400 font-bold">{score} / {SPEED_SORT_CARDS.length}</strong> câu phân loại chính xác.
            </p>
            <div className="pt-2">
              <button
                id="btn-restart-speed-game"
                onClick={handleStartGame}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Chơi Lại Lần Nữa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
