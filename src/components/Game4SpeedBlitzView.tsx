import React, { useState, useEffect } from 'react';
import { GAME4_SPEED_QUESTIONS } from '../data/gameContent';
import { ScoreState } from '../types';
import { 
  Zap, 
  Timer, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  Sparkles,
  Flame
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface Game4SpeedBlitzViewProps {
  scoreState: ScoreState;
  onUpdateScore: (gameKey: 'game4', newScore: number, answers: Record<string, string>, isCompleted: boolean) => void;
  onViewResults: () => void;
}

export const Game4SpeedBlitzView: React.FC<Game4SpeedBlitzViewProps> = ({
  scoreState,
  onUpdateScore,
  onViewResults,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>(scoreState.game4.answers || {});
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(scoreState.game4.isCompleted);

  const currentQ = GAME4_SPEED_QUESTIONS[currentIdx];

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, isFinished]);

  const handleStart = () => {
    soundManager.playClick();
    setIsPlaying(true);
    setTimeLeft(45);
    setCurrentIdx(0);
    setAnswers({});
    setStreak(0);
    setFeedback(null);
    setIsFinished(false);
  };

  const handleTimeOut = () => {
    setIsPlaying(false);
    setIsFinished(true);
    soundManager.playLevelUp();
  };

  const handleAnswer = (optionId: string) => {
    if (!currentQ || !isPlaying || isFinished) return;

    const chosen = currentQ.options.find((o) => o.id === optionId);
    const isCorrect = !!chosen?.isCorrect;

    if (isCorrect) {
      soundManager.playCorrect();
      setStreak((prev) => prev + 1);
      setFeedback({ isCorrect: true, text: `✓ Đúng! ${currentQ.quickExplanation}` });
    } else {
      soundManager.playWrong();
      setStreak(0);
      setFeedback({ isCorrect: false, text: `✗ Chưa đúng. ${currentQ.quickExplanation}` });
    }

    const nextAnswers = { ...answers, [currentQ.id]: optionId };
    setAnswers(nextAnswers);

    // Calculate score
    let points = 0;
    GAME4_SPEED_QUESTIONS.forEach((q) => {
      const ansId = nextAnswers[q.id];
      const opt = q.options.find((o) => o.id === ansId);
      if (opt?.isCorrect) points += q.points;
    });

    if (currentIdx + 1 >= GAME4_SPEED_QUESTIONS.length) {
      setIsFinished(true);
      setIsPlaying(false);
      soundManager.playLevelUp();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      onUpdateScore('game4', points, nextAnswers, true);
    } else {
      setCurrentIdx((prev) => prev + 1);
      onUpdateScore('game4', points, nextAnswers, false);
    }
  };

  return (
    <div id="game4-speed-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                TRÒ CHƠI 4 / 4
              </span>
              <span className="text-xs font-bold text-slate-500">
                Tối đa: 25 Điểm (5 điểm/câu)
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Trả Lời Nhanh - Thử Thách Tập Trung Phản Xạ
            </h2>
          </div>
        </div>

        {/* Timer & Live Score */}
        <div className="flex items-center gap-3">
          {isPlaying && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-2xl font-black text-sm">
              <Timer className="w-4 h-4 text-amber-600 animate-spin" />
              <span>{timeLeft}s</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Điểm Trò 4:</span>
            <span className="text-lg font-black text-emerald-600">
              {scoreState.game4.score} / 25 đ
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {!isPlaying && !isFinished && (
          <div className="py-8 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center font-black shadow-sm">
              <Timer className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Sẵn sàng kiểm tra phản xạ tập trung khảo thí AI?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có <strong>45 giây</strong> để trả lời nhanh 5 câu hỏi tình huống cốt lõi. Hãy giữ sự tập trung cao độ để đạt trọn 25 điểm!
            </p>
            <button
              id="btn-start-speed-game"
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-200 inline-flex items-center gap-2 transition-all hover:scale-102 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Đếm Ngược</span>
            </button>
          </div>
        )}

        {isPlaying && currentQ && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                Câu {currentIdx + 1} / {GAME4_SPEED_QUESTIONS.length}
              </span>
              <span className="text-orange-600 flex items-center gap-1">
                <Flame className="w-4 h-4" /> Chuỗi đúng: {streak}
              </span>
            </div>

            {/* Prompt */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {currentQ.scenarioTag}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {currentQ.prompt}
              </h3>
            </div>

            {/* Feedback ticker */}
            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                feedback.isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {feedback.text}
              </div>
            )}

            {/* 3 Quick Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.id}
                  id={`speed-opt-${opt.id}`}
                  onClick={() => handleAnswer(opt.id)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-950 text-slate-800 text-left font-semibold text-xs sm:text-sm transition-all flex items-center gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99]"
                >
                  <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                    {opt.id}
                  </div>
                  <span className="flex-1">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isFinished && (
          <div className="py-6 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center font-black">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Hoàn Thành Xuất Sắc 4 Trò Chơi!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Kết quả Trò 4: <strong className="text-emerald-600 font-bold">{scoreState.game4.score} / 25 điểm</strong>.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi lại Trò 4</span>
              </button>

              <button
                id="btn-view-final-results"
                onClick={onViewResults}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-200 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                <span>Xem Chứng Nhận Khởi Động Buổi 4 (Tổng 100đ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
