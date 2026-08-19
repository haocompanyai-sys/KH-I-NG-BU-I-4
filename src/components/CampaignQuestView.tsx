import React, { useState } from 'react';
import { QuestionItem, UserStats } from '../types';
import { VisualDiagram } from './VisualDiagram';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  Lightbulb, 
  BookOpenCheck,
  Bot,
  Brain,
  Award,
  RefreshCw
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface CampaignQuestViewProps {
  questions: QuestionItem[];
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const CampaignQuestView: React.FC<CampaignQuestViewProps> = ({
  questions,
  stats,
  onUpdateStats,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showAiDeepDive, setShowAiDeepDive] = useState<boolean>(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  const currentQ = questions[currentIdx] || questions[0];
  const isStageCleared = stats.stageProgress[currentQ.id];

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    soundManager.playClick();
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswered) return;
    setIsAnswered(true);

    const chosenOption = currentQ.options.find(o => o.id === selectedOptionId);
    const isCorrect = chosenOption?.isCorrect || false;

    if (isCorrect) {
      soundManager.playCorrect();
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
      });

      const newExp = stats.exp + 25;
      const newLevel = Math.floor(newExp / 100) + 1;
      if (newLevel > stats.level) {
        soundManager.playLevelUp();
      }

      const newStreak = stats.streak + 1;
      if (newStreak > 2) {
        soundManager.playStreak();
      }

      const newStageProgress = { ...stats.stageProgress, [currentQ.id]: true };
      const newCompetency = { ...stats.competencyScores };

      // Update specific domain scores
      if (currentQ.topic.includes('Bloom')) newCompetency.assessmentTheory += 20;
      if (currentQ.topic.includes('Hallucination')) newCompetency.ethicsAndIntegrity += 20;
      if (currentQ.topic.includes('Feedback')) newCompetency.practicalAIIntegration += 20;
      if (currentQ.topic.includes('Rubric')) newCompetency.rubricDesign += 20;
      if (currentQ.topic.includes('Liêm chính')) newCompetency.ethicsAndIntegrity += 20;

      onUpdateStats({
        exp: newExp,
        level: newLevel,
        streak: newStreak,
        highestStreak: Math.max(stats.highestStreak, newStreak),
        totalAnswered: stats.totalAnswered + 1,
        totalCorrect: stats.totalCorrect + 1,
        stageProgress: newStageProgress,
        competencyScores: newCompetency,
      });
    } else {
      soundManager.playWrong();
      onUpdateStats({
        streak: 0,
        totalAnswered: stats.totalAnswered + 1,
      });
    }
  };

  const handleNextQuestion = () => {
    soundManager.playClick();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setShowAiDeepDive(false);
      setAiAnalysisResult(null);
    }
  };

  const handlePrevQuestion = () => {
    soundManager.playClick();
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setShowAiDeepDive(false);
      setAiAnalysisResult(null);
    }
  };

  const handleFetchAiDeepDive = async () => {
    soundManager.playClick();
    setShowAiDeepDive(true);
    if (aiAnalysisResult) return;

    setAiAnalysisLoading(true);
    try {
      const chosenOption = currentQ.options.find(o => o.id === selectedOptionId);
      const correctOption = currentQ.options.find(o => o.isCorrect);

      const res = await fetch('/api/gemini/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionTitle: currentQ.title,
          questionDetails: currentQ.scenario + ' | Câu hỏi: ' + currentQ.question,
          userAnswer: chosenOption ? `${chosenOption.id}: ${chosenOption.text}` : 'Chưa chọn',
          correctAnswer: `${correctOption?.id}: ${correctOption?.text}`,
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysisResult(data.data);
      } else {
        // Fallback pedagogical analysis
        setAiAnalysisResult({
          summary: "Tối ưu hóa thiết kế khảo thí thời đại AI đòi hỏi chuyển dịch từ kiểm tra ghi nhớ sang thẩm định phản biện.",
          whyCorrect: currentQ.pedagogicalInsight,
          commonMisconception: "Lầm tưởng rằng cấm AI hoặc dùng AI Detector là đủ để đảm bảo tính công bằng.",
          futureTrend: "Đánh giá quá trình đa phương thức kết hợp bảo vệ trực tiếp (Oral Defense).",
          actionableTakeaway: currentQ.proTip
        });
      }
    } catch (e) {
      setAiAnalysisResult({
        summary: "Phân tích sư phạm chuyên sâu",
        whyCorrect: currentQ.pedagogicalInsight,
        commonMisconception: "Tập trung vào giải pháp kỹ thuật thụ động thay vì thay đổi bản chất mục tiêu đánh giá.",
        futureTrend: "Đánh giá năng lực giải quyết vấn đề mở.",
        actionableTakeaway: currentQ.proTip
      });
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  return (
    <div id="campaign-quest-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Level selector stage map */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-slate-200">Lộ Trình Thám Hiểm Tháp Năng Lực</span>
          </div>
          <span className="text-xs text-slate-400">
            Màn {currentIdx + 1} / {questions.length}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isCompleted = stats.stageProgress[q.id];
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={q.id}
                id={`btn-stage-${idx}`}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentIdx(idx);
                  setSelectedOptionId(null);
                  setIsAnswered(false);
                  setShowAiDeepDive(false);
                  setAiAnalysisResult(null);
                }}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/40'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold">Ải {idx + 1}</div>
                <div className="text-xs font-bold truncate">
                  {isCompleted ? '✓ Đã vượt' : `Ải ${idx + 1}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-2.5 py-1 rounded-lg">
              {currentQ.stageName}
            </span>
            <span className="bg-purple-950 text-purple-300 border border-purple-500/30 text-xs font-semibold px-2.5 py-1 rounded-lg">
              Thang Bloom: {currentQ.bloomLevel}
            </span>
          </div>
          <span className="text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            Độ khó: {currentQ.difficulty}
          </span>
        </div>

        {/* Title & Scenario */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
            {currentQ.title}
          </h2>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 leading-relaxed">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">
              <BookOpenCheck className="w-4 h-4" />
              Tình Huống Sư Phạm Khảo Thí:
            </div>
            {currentQ.scenario}
          </div>
        </div>

        {/* Visual Diagram */}
        {currentQ.visualType && (
          <VisualDiagram type={currentQ.visualType} data={currentQ.visualData} />
        )}

        {/* Question Prompt */}
        <div className="font-semibold text-sm sm:text-base text-indigo-200 pt-1">
          ❓ {currentQ.question}
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let containerStyle = 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-200';

            if (isAnswered) {
              if (opt.isCorrect) {
                containerStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500';
              } else if (isSelected && !opt.isCorrect) {
                containerStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 ring-1 ring-rose-500';
              } else {
                containerStyle = 'bg-slate-850 border-slate-800 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              containerStyle = 'bg-indigo-950/80 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/50';
            }

            return (
              <div
                key={opt.id}
                id={`option-${opt.id}`}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${containerStyle}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isAnswered && opt.isCorrect
                      ? 'bg-emerald-500 text-white'
                      : isAnswered && isSelected && !opt.isCorrect
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {opt.id}
                  </div>
                  <div className="flex-1 text-sm leading-relaxed">
                    <span>{opt.text}</span>

                    {/* Detailed Rationale displayed after answering */}
                    {isAnswered && (
                      <div className={`mt-2.5 pt-2 border-t text-xs leading-relaxed ${
                        opt.isCorrect ? 'border-emerald-500/30 text-emerald-300' : 'border-rose-500/30 text-rose-300'
                      }`}>
                        <div className="font-semibold mb-0.5 flex items-center gap-1">
                          {opt.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 inline" /> : <XCircle className="w-3.5 h-3.5 inline" />}
                          {opt.isCorrect ? 'Lý giải chuẩn mực sư phạm:' : 'Phản biện lỗi sư phạm / phương án nhiễu:'}
                        </div>
                        {opt.rationale}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-prev-question"
              onClick={handlePrevQuestion}
              disabled={currentIdx === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Câu trước
            </button>
            <button
              id="btn-next-question"
              onClick={handleNextQuestion}
              disabled={currentIdx === questions.length - 1}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Câu tiếp
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {isAnswered && (
              <button
                id="btn-ask-gemini-deepdive"
                onClick={handleFetchAiDeepDive}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all"
              >
                <Bot className="w-4 h-4 text-amber-300" />
                Hỏi Trợ Lý AI Phân Tích Sâu
              </button>
            )}

            {!isAnswered ? (
              <button
                id="btn-submit-answer"
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác Nhận Đáp Án
              </button>
            ) : (
              <button
                id="btn-continue-quest"
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                Tiếp Tục Chinh Phục
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pedagogical Insight Box after answering */}
        {isAnswered && (
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 text-xs text-indigo-100 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Bài Học Cốt Lõi (Pedagogical Takeaway):
            </div>
            <p className="leading-relaxed text-slate-200">
              {currentQ.pedagogicalInsight}
            </p>
            <div className="pt-2 border-t border-indigo-500/20 text-slate-300">
              <strong className="text-emerald-400">★ Mẹo thực chiến cho thầy cô:</strong> {currentQ.proTip}
            </div>
          </div>
        )}

        {/* AI Deep Dive Modal / Expandable */}
        {showAiDeepDive && (
          <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="font-bold text-sm text-purple-200">Chuyên Gia Khảo Thí AI (Gemini 3.7) Phản Biện</span>
              </div>
              <button
                onClick={() => setShowAiDeepDive(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Đóng
              </button>
            </div>

            {aiAnalysisLoading ? (
              <div className="py-6 text-center text-xs text-purple-300 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                Đang đối chiếu lý thuyết Khảo thí hiện đại và nguyên lý Đánh giá năng lực...
              </div>
            ) : aiAnalysisResult ? (
              <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">📌 Bản chất vấn đề:</span>
                  {aiAnalysisResult.summary}
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1">🎯 Phân tích chiều sâu đo lường:</span>
                  {aiAnalysisResult.whyCorrect}
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-rose-400 block mb-1">⚠️ Hiểu lầm thường gặp của nhà trường & giáo viên:</span>
                  {aiAnalysisResult.commonMisconception}
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-1">🚀 Hành động áp dụng ngay:</span>
                  {aiAnalysisResult.actionableTakeaway}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
