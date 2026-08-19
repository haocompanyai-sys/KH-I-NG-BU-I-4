import React, { useState } from 'react';
import { GAME1_MCQ_QUESTIONS } from '../data/gameContent';
import { ScoreState } from '../types';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  Award
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface Game1MCQViewProps {
  scoreState: ScoreState;
  onUpdateScore: (gameKey: 'game1', newScore: number, answers: Record<string, string>, isCompleted: boolean) => void;
  onNextGame: () => void;
}

export const Game1MCQView: React.FC<Game1MCQViewProps> = ({
  scoreState,
  onUpdateScore,
  onNextGame,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(scoreState.game1.answers || {});
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const currentQ = GAME1_MCQ_QUESTIONS[currentIdx];
  const answeredOptionId = answers[currentQ.id];

  const handleSelectOption = (optId: string) => {
    if (answeredOptionId || isAnswered) return;
    soundManager.playClick();
    setSelectedOptionId(optId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId || answeredOptionId || isAnswered) return;

    const chosen = currentQ.options.find((o) => o.id === selectedOptionId);
    const isCorrect = !!chosen?.isCorrect;

    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    const nextAnswers = { ...answers, [currentQ.id]: selectedOptionId };
    setAnswers(nextAnswers);
    setIsAnswered(true);

    // Calculate score
    let points = 0;
    GAME1_MCQ_QUESTIONS.forEach((q) => {
      const ansId = nextAnswers[q.id];
      const opt = q.options.find((o) => o.id === ansId);
      if (opt?.isCorrect) points += q.points;
    });

    const isAllCompleted = Object.keys(nextAnswers).length === GAME1_MCQ_QUESTIONS.length;
    if (isAllCompleted && points === 25) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    }

    onUpdateScore('game1', points, nextAnswers, isAllCompleted);
  };

  const handleNextQuestion = () => {
    soundManager.playClick();
    if (currentIdx + 1 < GAME1_MCQ_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    }
  };

  const handlePrevQuestion = () => {
    soundManager.playClick();
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    }
  };

  const activeOptionId = answeredOptionId || selectedOptionId;
  const isCurrentQAnswered = !!answeredOptionId || isAnswered;

  return (
    <div id="game1-mcq-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                TRÒ CHƠI 1 / 4
              </span>
              <span className="text-xs font-bold text-slate-500">
                Tối đa: 25 Điểm (5 điểm/câu)
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Trắc Nghiệm Khách Quan Nhiều Lựa Chọn
            </h2>
          </div>
        </div>

        {/* Score Counter */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Điểm Trò 1:</span>
            <span className="text-lg font-black text-indigo-600">
              {scoreState.game1.score} / 25 đ
            </span>
          </div>
        </div>
      </div>

      {/* Question Stepper */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {GAME1_MCQ_QUESTIONS.map((q, idx) => {
          const isDone = !!answers[q.id];
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={q.id}
              onClick={() => {
                soundManager.playClick();
                setCurrentIdx(idx);
                setSelectedOptionId(null);
                setIsAnswered(false);
              }}
              className={`flex-1 min-w-[60px] py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                isCurrent
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : isDone
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Câu {idx + 1} {isDone && '✓'}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            Thang Bloom: {currentQ.bloomLevel}
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
            Giá trị: 5 Điểm
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3">
            {currentQ.title}
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            <strong className="text-indigo-900 block mb-1 text-xs uppercase tracking-wider">
              Bối cảnh sư phạm:
            </strong>
            {currentQ.scenario}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = activeOptionId === opt.id;
            let cardClass = 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-800';

            if (isCurrentQAnswered) {
              if (opt.isCorrect) {
                cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-300';
              } else if (isSelected && !opt.isCorrect) {
                cardClass = 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-300';
              } else {
                cardClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              cardClass = 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-200';
            }

            return (
              <div
                key={opt.id}
                id={`game1-opt-${opt.id}`}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${cardClass}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                    isCurrentQAnswered && opt.isCorrect
                      ? 'bg-emerald-600 text-white'
                      : isCurrentQAnswered && isSelected && !opt.isCorrect
                      ? 'bg-rose-600 text-white'
                      : isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {opt.id}
                  </div>
                  <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                    <span>{opt.text}</span>
                    {isCurrentQAnswered && (
                      <div className={`mt-2 pt-2 border-t text-xs font-semibold ${
                        opt.isCorrect ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'
                      }`}>
                        {opt.isCorrect ? '✓ Cơ sở đánh giá:' : '✗ Chưa tối ưu:'} {opt.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pedagogical Insight */}
        {isCurrentQAnswered && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Đúc Kết Sư Phạm Cốt Lõi:
            </div>
            <p className="leading-relaxed">{currentQ.pedagogicalInsight}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handlePrevQuestion}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
          >
            ← Câu trước
          </button>

          {!isCurrentQAnswered ? (
            <button
              id="btn-check-mcq"
              onClick={handleCheckAnswer}
              disabled={!selectedOptionId}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Xác Nhận Đáp Án
            </button>
          ) : currentIdx + 1 < GAME1_MCQ_QUESTIONS.length ? (
            <button
              id="btn-next-mcq"
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all"
            >
              <span>Sang Câu Tiếp Theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-finish-game1"
              onClick={onNextGame}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all"
            >
              <span>Hoàn Thành Trò 1 &rarr; Sang Trò 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
