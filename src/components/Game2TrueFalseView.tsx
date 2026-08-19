import React, { useState } from 'react';
import { GAME2_TRUEFALSE_QUESTIONS } from '../data/gameContent';
import { ScoreState } from '../types';
import { 
  ToggleLeft, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface Game2TrueFalseViewProps {
  scoreState: ScoreState;
  onUpdateScore: (gameKey: 'game2', newScore: number, answers: Record<string, boolean>, isCompleted: boolean) => void;
  onNextGame: () => void;
}

export const Game2TrueFalseView: React.FC<Game2TrueFalseViewProps> = ({
  scoreState,
  onUpdateScore,
  onNextGame,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>(scoreState.game2.answers || {});
  const [justAnswered, setJustAnswered] = useState<boolean>(false);

  const currentQ = GAME2_TRUEFALSE_QUESTIONS[currentIdx];
  const userAns = answers[currentQ.id];
  const hasAnswered = userAns !== undefined;

  const handleAnswer = (choice: boolean) => {
    if (hasAnswered) return;

    const isCorrect = choice === currentQ.isTrue;
    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    const nextAnswers = { ...answers, [currentQ.id]: choice };
    setAnswers(nextAnswers);
    setJustAnswered(true);

    // Calculate score
    let points = 0;
    GAME2_TRUEFALSE_QUESTIONS.forEach((q) => {
      if (nextAnswers[q.id] === q.isTrue) {
        points += q.points;
      }
    });

    const isAllCompleted = Object.keys(nextAnswers).length === GAME2_TRUEFALSE_QUESTIONS.length;
    if (isAllCompleted && points === 25) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    }

    onUpdateScore('game2', points, nextAnswers, isAllCompleted);
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIdx + 1 < GAME2_TRUEFALSE_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
      setJustAnswered(false);
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setJustAnswered(false);
    }
  };

  return (
    <div id="game2-truefalse-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black">
            <ToggleLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                TRÒ CHƠI 2 / 4
              </span>
              <span className="text-xs font-bold text-slate-500">
                Tối đa: 25 Điểm (5 điểm/câu)
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Trắc Nghiệm Phán Đoán Đúng / Sai
            </h2>
          </div>
        </div>

        {/* Score Counter */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Điểm Trò 2:</span>
            <span className="text-lg font-black text-blue-600">
              {scoreState.game2.score} / 25 đ
            </span>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {GAME2_TRUEFALSE_QUESTIONS.map((q, idx) => {
          const isDone = answers[q.id] !== undefined;
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={q.id}
              onClick={() => {
                soundManager.playClick();
                setCurrentIdx(idx);
                setJustAnswered(false);
              }}
              className={`flex-1 min-w-[60px] py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                isCurrent
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : isDone
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Nhận định {idx + 1} {isDone && '✓'}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            Chủ đề: {currentQ.context}
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
            Giá trị: 5 Điểm
          </span>
        </div>

        {/* Statement Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Nhận định sư phạm {currentIdx + 1}:
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed max-w-2xl mx-auto">
            "{currentQ.statement}"
          </p>
        </div>

        {/* True / False Decision Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            id="btn-tf-true"
            onClick={() => handleAnswer(true)}
            disabled={hasAnswered}
            className={`p-5 rounded-2xl border text-center transition-all font-black text-sm sm:text-base flex items-center justify-center gap-3 ${
              hasAnswered
                ? currentQ.isTrue
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                  : userAns === true
                  ? 'bg-rose-50 border-rose-400 text-rose-800 ring-1 ring-rose-300 opacity-70'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'
                : 'bg-white border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 hover:shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>ĐÚNG (Chính Xác)</span>
          </button>

          <button
            id="btn-tf-false"
            onClick={() => handleAnswer(false)}
            disabled={hasAnswered}
            className={`p-5 rounded-2xl border text-center transition-all font-black text-sm sm:text-base flex items-center justify-center gap-3 ${
              hasAnswered
                ? !currentQ.isTrue
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                  : userAns === false
                  ? 'bg-rose-50 border-rose-400 text-rose-800 ring-1 ring-rose-300 opacity-70'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'
                : 'bg-white border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-slate-800 hover:text-rose-800 hover:shadow-sm'
            }`}
          >
            <XCircle className="w-6 h-6 text-rose-600" />
            <span>SAI (Không Chuẩn Xác)</span>
          </button>
        </div>

        {/* Explanation Alert */}
        {hasAnswered && (
          <div className="space-y-3 animate-fadeIn">
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium ${
              userAns === currentQ.isTrue
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="font-bold mb-1 flex items-center gap-1.5">
                {userAns === currentQ.isTrue ? (
                  <span className="text-emerald-700">✓ Bạn đã phán đoán CHÍNH XÁC (+5 điểm)</span>
                ) : (
                  <span className="text-rose-700">✗ Phán đoán chưa chính xác</span>
                )}
              </div>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Quy chuẩn sư phạm:</strong> {currentQ.keyRule}
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
          >
            ← Câu trước
          </button>

          {hasAnswered && (
            currentIdx + 1 < GAME2_TRUEFALSE_QUESTIONS.length ? (
              <button
                id="btn-next-tf"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 flex items-center gap-1.5 transition-all"
              >
                <span>Sang Câu Tiếp Theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-finish-game2"
                onClick={onNextGame}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all"
              >
                <span>Hoàn Thành Trò 2 &rarr; Sang Trò 3</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
