import React, { useState } from 'react';
import { UserStats } from '../types';
import { 
  Bot, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Lightbulb, 
  Send, 
  Zap, 
  Award,
  Layers
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface GeminiLiveArenaViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

const SUBJECT_OPTIONS = [
  'Toán học & Tư duy logic',
  'Ngữ văn & Viết luận nghị luận',
  'Tiếng Anh & Đánh giá năng lực giao tiếp',
  'KHTN (Vật lý - Hóa học - Sinh học)',
  'Lịch sử & Địa lý & GDCD',
  'Tin học & Khoa học máy tính / STEM',
];

const BLOOM_LEVELS = [
  'Vận dụng cao (Higher-order application)',
  'Phân tích & Thẩm định đối chiếu (Analyze)',
  'Đánh giá & Phê phán (Evaluate & Critique)',
  'Sáng tạo giải pháp mới (Create & Synthesize)',
];

export const GeminiLiveArenaView: React.FC<GeminiLiveArenaViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(BLOOM_LEVELS[2]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    soundManager.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedQuestion(null);
    setSelectedOptionId(null);
    setIsAnswered(false);

    try {
      const res = await fetch('/api/gemini/generate-custom-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          difficulty: selectedDifficulty,
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedQuestion(data.data);
      } else {
        // Fallback realistic question if API offline or rate-limited
        setGeneratedQuestion({
          id: `fallback_${Date.now()}`,
          topic: selectedSubject,
          type: 'scenario',
          difficulty: selectedDifficulty,
          title: `Tình huống Khảo thí: ${selectedSubject} trong bối cảnh GenAI`,
          scenario: `Tại một trường trung học, giáo viên ${selectedSubject} nhận thấy học sinh thường xuyên dùng AI để giải trọn vẹn các bài tập về nhà trong 10 giây. Thầy cô cần thiết kế lại đề đánh giá định kỳ để đo lường năng lực tư duy bậc cao.`,
          question: `Giải pháp sư phạm nào giúp chuyển đổi đề kiểm tra ${selectedSubject} sang dạng thức tích hợp AI hiệu quả nhất?`,
          options: [
            {
              id: 'A',
              text: 'Cung cấp bài giải có sẵn lỗi sai logic do AI sinh ra, yêu cầu học sinh thẩm định, tìm lỗi và chứng minh lại bằng kiến thức chuẩn.',
              isCorrect: true,
              rationale: 'Buộc học sinh vận dụng tư duy phân tích và phản biện (Evaluate) thay vì chỉ học vẹt công thức.'
            },
            {
              id: 'B',
              text: 'Tăng gấp đôi số lượng câu hỏi trắc nghiệm ghi nhớ công thức.',
              isCorrect: false,
              rationale: 'Không giải quyết được vấn đề năng lực và làm quá tải người học.'
            },
            {
              id: 'C',
              text: 'Cấm hoàn toàn học sinh sử dụng máy tính và internet ở mọi nơi.',
              isCorrect: false,
              rationale: 'Thiếu tính khả thi và đi ngược xu thế chuyển đổi số giáo dục.'
            },
            {
              id: 'D',
              text: 'Chỉ giao bài tập về nhà dạng sao chép sách giáo khoa.',
              isCorrect: false,
              rationale: 'Hạ thấp chuẩn năng lực của chương trình giáo dục.'
            }
          ],
          pedagogicalInsight: 'Kiểm tra đánh giá hiện đại tập trung vào năng lực "Thẩm định chất lượng đầu ra của AI" và "Tự bảo vệ luận điểm khoa học".',
          proTip: 'Hãy xem AI là một trợ giảng tạo dữ liệu đối chiếu, học sinh là nhà nghiên cứu trẻ.'
        });
      }
    } catch (err: any) {
      setErrorMsg('Không thể kết nối với Gemini. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (id: string) => {
    if (isAnswered) return;
    soundManager.playClick();
    setSelectedOptionId(id);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswered || !generatedQuestion) return;
    setIsAnswered(true);

    const chosen = generatedQuestion.options.find((o: any) => o.id === selectedOptionId);
    if (chosen?.isCorrect) {
      soundManager.playCorrect();
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 }
      });

      const newExp = stats.exp + 35;
      onUpdateStats({
        exp: newExp,
        level: Math.floor(newExp / 100) + 1,
        streak: stats.streak + 1,
        highestStreak: Math.max(stats.highestStreak, stats.streak + 1),
        totalAnswered: stats.totalAnswered + 1,
        totalCorrect: stats.totalCorrect + 1,
        competencyScores: {
          ...stats.competencyScores,
          practicalAIIntegration: stats.competencyScores.practicalAIIntegration + 25,
        }
      });
    } else {
      soundManager.playWrong();
      onUpdateStats({
        streak: 0,
        totalAnswered: stats.totalAnswered + 1,
      });
    }
  };

  return (
    <div id="gemini-live-arena-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-emerald-200">
                AI ĐẤU TRÍ TRỰC TIẾP (LIVE GEMINI 3.7 ARENA)
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                Gemini 3.7 Flash Engine
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Chọn bộ môn và cấp độ nhận thức để AI tạo ngay một câu hỏi tình huống khảo thí nâng cao độc bản trong thời gian thực!
            </p>
          </div>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Chọn Bộ Môn Khảo Thí:</label>
            <select
              id="select-subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Chọn Thang Nhận Thức Bloom:</label>
            <select
              id="select-difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {BLOOM_LEVELS.map((diff) => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          id="btn-generate-live-quiz"
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Gemini 3.7 Đang Thiết Kế Tình Huống Sư Phạm Độc Bản...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Tạo Tình Huống Khảo Thí Mới
            </>
          )}
        </button>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Generated Quiz Display Card */}
      {generatedQuestion && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              {generatedQuestion.topic}
            </span>
            <span className="text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
              {generatedQuestion.bloomLevel || generatedQuestion.difficulty}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              {generatedQuestion.title}
            </h3>
            <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 leading-relaxed">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-300 block mb-1">
                Bối Cảnh Sư Phạm:
              </span>
              {generatedQuestion.scenario}
            </div>
          </div>

          <div className="font-semibold text-sm sm:text-base text-emerald-200">
            ❓ {generatedQuestion.question}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {generatedQuestion.options.map((opt: any) => {
              const isSelected = selectedOptionId === opt.id;
              let cardStyle = 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-200';

              if (isAnswered) {
                if (opt.isCorrect) {
                  cardStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50';
                } else if (isSelected && !opt.isCorrect) {
                  cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 ring-1 ring-rose-500';
                } else {
                  cardStyle = 'bg-slate-850 border-slate-800 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                cardStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400/50';
              }

              return (
                <div
                  key={opt.id}
                  id={`live-opt-${opt.id}`}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${cardStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isAnswered && opt.isCorrect
                        ? 'bg-emerald-500 text-white'
                        : isAnswered && isSelected && !opt.isCorrect
                        ? 'bg-rose-500 text-white'
                        : isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {opt.id}
                    </div>
                    <div className="flex-1 text-sm leading-relaxed">
                      <span>{opt.text}</span>
                      {isAnswered && (
                        <div className={`mt-2 pt-2 border-t text-xs ${
                          opt.isCorrect ? 'border-emerald-500/30 text-emerald-300' : 'border-rose-500/30 text-rose-300'
                        }`}>
                          <strong>{opt.isCorrect ? '✓ Cơ sở sư phạm:' : '✗ Phản biện:'}</strong> {opt.rationale}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            {!isAnswered ? (
              <button
                id="btn-submit-live-quiz"
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Kiểm Tra Đáp Án
              </button>
            ) : (
              <button
                id="btn-next-live-quiz"
                onClick={handleGenerateQuiz}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Tạo Thử Thách Mới Tiếp Theo
              </button>
            )}
          </div>

          {/* Pedagogical summary */}
          {isAnswered && (
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 text-xs text-indigo-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Đúc Kết Cốt Lõi Từ Gemini:
              </div>
              <p>{generatedQuestion.pedagogicalInsight}</p>
              {generatedQuestion.proTip && (
                <div className="text-emerald-300 pt-1">
                  <strong>★ Mẹo thực chiến:</strong> {generatedQuestion.proTip}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
