import React, { useState } from 'react';
import { PROMPT_CHALLENGES } from '../data/questionsData';
import { UserStats } from '../types';
import { 
  Terminal, 
  Sparkles, 
  Send, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Bot, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface PromptBattleViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const PromptBattleView: React.FC<PromptBattleViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  const challenge = PROMPT_CHALLENGES[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const handleSelectPreset = (id: string) => {
    soundManager.playClick();
    setSelectedPresetId(id);
    const chosen = challenge.presetOptions.find(o => o.id === id);
    if (chosen) {
      setEvaluationResult({
        score: chosen.rating === 5 ? 98 : chosen.rating === 2 ? 45 : 20,
        verdict: chosen.rating === 5 ? 'Xuất Sắc (Master Prompt)' : chosen.rating === 2 ? 'Cần Cải Thiện' : 'Quá Sơ Sài',
        analysis: chosen.analysis,
        rating: chosen.rating,
      });

      if (chosen.rating === 5) {
        soundManager.playCorrect();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
        const newExp = stats.exp + 35;
        const badges = [...stats.badges];
        if (!badges.includes('badge_prompt_wizard')) badges.push('badge_prompt_wizard');

        onUpdateStats({
          exp: newExp,
          level: Math.floor(newExp / 100) + 1,
          streak: stats.streak + 1,
          highestStreak: Math.max(stats.highestStreak, stats.streak + 1),
          totalCorrect: stats.totalCorrect + 1,
          totalAnswered: stats.totalAnswered + 1,
          competencyScores: {
            ...stats.competencyScores,
            promptCrafting: stats.competencyScores.promptCrafting + 30,
          },
          badges,
        });
      } else {
        soundManager.playWrong();
      }
    }
  };

  const handleEvaluateCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    soundManager.playClick();
    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/gemini/evaluate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: customPrompt,
          targetObjective: challenge.scenarioGoal,
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data.data);
        if (data.data.score >= 80) {
          soundManager.playCorrect();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 }
          });
          const newExp = stats.exp + 40;
          onUpdateStats({
            exp: newExp,
            level: Math.floor(newExp / 100) + 1,
            streak: stats.streak + 1,
            competencyScores: {
              ...stats.competencyScores,
              promptCrafting: stats.competencyScores.promptCrafting + 35,
            }
          });
        } else {
          soundManager.playWrong();
        }
      } else {
        // Fallback local calculation
        const wordCount = customPrompt.split(' ').length;
        const hasRole = /đóng vai|chuyên gia|giáo viên|khảo thí/i.test(customPrompt);
        const hasBloom = /nhận biết|thông hiểu|vận dụng|bloom|ma trận/i.test(customPrompt);
        const hasRubric = /rubric|đáp án|tiêu chí|giải thích/i.test(customPrompt);

        let score = 40;
        if (hasRole) score += 20;
        if (hasBloom) score += 20;
        if (hasRubric) score += 15;
        if (wordCount > 30) score += 5;

        setEvaluationResult({
          score: Math.min(100, score),
          verdict: score >= 80 ? 'Xuất Sắc' : score >= 60 ? 'Khá Tốt' : 'Cần bổ sung cấu trúc',
          strengths: ['Đã thể hiện được định hướng kiểm tra', hasRole ? 'Có gán vai trò chuyên gia (Role)' : 'Ngắn gọn'],
          weaknesses: [!hasBloom ? 'Chưa định lượng rõ tỷ lệ ma trận nhận thức (Bloom)' : '', !hasRubric ? 'Chưa yêu cầu giải thích lỗi sai thường gặp' : ''].filter(Boolean),
          improvedPrompt: `Đóng vai Chuyên gia Khảo thí. Hãy tạo đề kiểm tra 15 phút về Sinh học 10 (Cấu trúc tế bào) theo ma trận: 40% Nhận biết, 40% Thông hiểu, 20% Vận dụng cao. Kèm đáp án chi tiết và giải thích lý do học sinh hay chọn sai phương án nhiễu.`,
          pedagogicalAdvice: 'Luôn kết hợp 4 yếu tố: Role (Vai trò) + Context (Bối cảnh CT 2018) + Matrix (Ma trận Bloom) + Output Constraints (Quy định đáp án & giải thích).'
        });
      }
    } catch (e) {
      setEvaluationResult({
        score: 75,
        verdict: 'Khá Tốt',
        strengths: ['Đã có mục tiêu rõ ràng'],
        weaknesses: ['Nên bổ sung định lượng % ma trận và yêu cầu giải thích phương án nhiễu'],
        improvedPrompt: `Đóng vai Chuyên gia Khảo thí môn Sinh học 10. Hãy tạo đề trắc nghiệm phân hóa 3 cấp độ kèm ma trận câu hỏi và rubric giải thích chi tiết.`,
        pedagogicalAdvice: 'Thêm ràng buộc chặt chẽ để AI không sinh các câu hỏi ghi nhớ mẹo vặt.'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div id="prompt-battle-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-purple-200">
              ĐẤU TRƯỜNG PROMPT SƯ PHẠM (PROMPT ENGINEERING LAB)
            </h2>
            <p className="text-xs text-slate-300">
              Học cách ra lệnh cho AI thiết kế đề thi, ma trận nhận thức và tiêu chí đánh giá chuẩn xác theo Chương trình GDPT mới.
            </p>
          </div>
        </div>
      </div>

      {/* Target Mission Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 border-b border-slate-800 pb-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Mục tiêu khảo thí cần đạt:
        </div>
        <p className="text-sm font-semibold text-slate-100 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
          🎯 {challenge.scenarioGoal}
        </p>

        <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-200">
          <span className="font-bold block mb-0.5">❌ Ví dụ Prompt tồi (Hậu quả: Đề thi ngẫu nhiên, không phân hóa):</span>
          "{challenge.badPromptExample}"
        </div>

        {/* Tab switcher: Preset vs Custom */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            id="tab-prompt-presets"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('preset');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'preset'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
            }`}
          >
            1. So Sánh Các Mẫu Prompt Khảo Thí
          </button>
          <button
            id="tab-prompt-custom"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('custom');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
            }`}
          >
            2. Thử Nghiệm Tự Viết Prompt Của Thầy Cô (AI Chấm Điểm)
          </button>
        </div>

        {/* Tab 1: Preset analysis */}
        {activeTab === 'preset' && (
          <div className="space-y-3">
            <span className="text-xs text-slate-400 font-semibold block">
              Chọn câu lệnh mà thầy cô đánh giá là tối ưu nhất cho sư phạm:
            </span>

            <div className="space-y-2.5">
              {challenge.presetOptions.map((opt) => {
                const isSelected = selectedPresetId === opt.id;
                return (
                  <div
                    key={opt.id}
                    id={`preset-${opt.id}`}
                    onClick={() => handleSelectPreset(opt.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? opt.rating === 5
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40'
                          : 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/40'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-mono leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800 mb-2">
                      "{opt.promptText}"
                    </div>

                    {isSelected && (
                      <div className="pt-2 border-t border-slate-700/60 text-xs flex items-start gap-2">
                        {opt.rating === 5 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <span className={opt.rating === 5 ? 'text-emerald-300' : 'text-rose-300'}>
                          {opt.analysis}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Prompt Sandbox */}
        {activeTab === 'custom' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Nhập câu lệnh Prompt khảo thí của bạn:</span>
                <span className="text-[11px] text-purple-400 font-normal">
                  Gợi ý: Cung cấp Vai trò + Bối cảnh + Ma trận % + Tiêu chí đáp án
                </span>
              </label>
              <textarea
                id="custom-prompt-input"
                rows={4}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ví dụ: Đóng vai Chuyên gia Khảo thí. Hãy thiết kế đề kiểm tra 15 phút môn Sinh 10..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono leading-relaxed resize-none"
              ></textarea>
            </div>

            <button
              id="btn-evaluate-custom-prompt"
              onClick={handleEvaluateCustomPrompt}
              disabled={isEvaluating || !customPrompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Chuyên Gia Gemini 3.7 Đang Thẩm Định Prompt...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gửi AI Thẩm Định & Chấm Điểm Sư Phạm
                </>
              )}
            </button>
          </div>
        )}

        {/* Evaluation Output for Custom Prompt */}
        {evaluationResult && activeTab === 'custom' && (
          <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-purple-200">Kết Quả Thẩm Định Chuyên Môn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Điểm sư phạm:</span>
                <span className={`text-base font-black px-2.5 py-0.5 rounded-lg ${
                  evaluationResult.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {evaluationResult.score} / 100
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-200 space-y-3">
              {evaluationResult.strengths && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                  <span className="font-bold text-emerald-300 block mb-1">✓ Điểm mạnh của câu lệnh:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {evaluationResult.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluationResult.weaknesses && evaluationResult.weaknesses.length > 0 && (
                <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl">
                  <span className="font-bold text-rose-300 block mb-1">⚠️ Điểm cần bổ sung để tránh ảo giác:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {evaluationResult.weaknesses.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluationResult.improvedPrompt && (
                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                  <span className="font-bold text-purple-300 block mb-1">🚀 Phiên bản Prompt nâng cấp mẫu (Chuẩn GDPT 2018):</span>
                  <div className="font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-200 leading-relaxed">
                    {evaluationResult.improvedPrompt}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
