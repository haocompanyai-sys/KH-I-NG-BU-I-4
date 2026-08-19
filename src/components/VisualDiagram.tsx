import React from 'react';
import { Layers, ShieldAlert, Cpu, Award, Zap, GitCommit } from 'lucide-react';

interface VisualDiagramProps {
  type: 'bloom' | 'samr' | 'rubric' | 'hallucination_meter' | 'ethics_scale' | 'process_flow';
  data?: any;
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({ type, data }) => {
  if (type === 'bloom') {
    return (
      <div id="visual-diagram-bloom" className="my-4 p-4 rounded-xl bg-slate-900/90 text-white border border-slate-700 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm text-indigo-200">Mô hình Thang Bloom 4.0 - Tích Hợp AI</span>
          </div>
          <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
            Kháng chép AI (AI-Resistant)
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-between transition-all hover:translate-x-1">
            <span className="font-bold text-emerald-300">BẬC 6: SÁNG TẠO (Create)</span>
            <span className="text-slate-300">Đồng sáng tạo giải pháp mới cùng AI</span>
          </div>
          <div className="p-2 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-between transition-all hover:translate-x-1">
            <span className="font-bold text-teal-300">BẬC 5: ĐÁNH GIÁ (Evaluate)</span>
            <span className="text-amber-300 font-medium">★ Trọng tâm bài kiểm tra: Thẩm định & Phản biện AI</span>
          </div>
          <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-between transition-all hover:translate-x-1">
            <span className="font-bold text-blue-300">BẬC 4: PHÂN TÍCH (Analyze)</span>
            <span className="text-slate-300">So sánh, đối chiếu dữ liệu đa nguồn</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between opacity-70">
            <span className="font-semibold text-slate-400">BẬC 3: VẬN DỤNG (Apply)</span>
            <span className="text-slate-400">AI giải quyết nhanh 80-90%</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-850 border border-slate-800 flex items-center justify-between opacity-50">
            <span className="font-normal text-slate-400">BẬC 1-2: NHỚ & HIỂU (Recall)</span>
            <span className="text-rose-400 text-[11px]">Dễ bị AI giải trong 1 giây (Nên hạn chế)</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'hallucination_meter') {
    return (
      <div id="visual-diagram-hallucination" className="my-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="font-bold text-sm text-amber-300">Hệ Thống Cảnh Báo Ảo Giác AI (Hallucination Alert)</span>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 h-full rounded-full w-[85%] transition-all duration-1000"></div>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>An toàn (0%)</span>
          <span className="text-amber-300 font-semibold">Nguy cơ cao (85% với phép tính đa bước)</span>
          <span>Bịa đặt hoàn toàn (100%)</span>
        </div>
      </div>
    );
  }

  if (type === 'process_flow') {
    return (
      <div id="visual-diagram-process" className="my-4 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-100">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-indigo-200">Quy trình Vòng lặp Phản hồi Sư phạm (Socrate Loop)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-slate-800 border border-indigo-500/20">
            <span className="block font-bold text-indigo-300 mb-1">1. Bài nộp HS</span>
            <span className="text-[11px] text-slate-300">Bản nháp ban đầu</span>
          </div>
          <div className="p-2 rounded-lg bg-indigo-900/60 border border-indigo-400/40">
            <span className="block font-bold text-amber-300 mb-1">2. AI Socrate</span>
            <span className="text-[11px] text-indigo-200">Đặt câu hỏi gợi mở</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800 border border-indigo-500/20">
            <span className="block font-bold text-teal-300 mb-1">3. Siêu nhận thức</span>
            <span className="text-[11px] text-slate-300">HS tự phát hiện lỗ hổng</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-400/40">
            <span className="block font-bold text-emerald-300 mb-1">4. Bản nâng cấp</span>
            <span className="text-[11px] text-emerald-200">Hoàn thiện tư duy sâu</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'rubric') {
    return (
      <div id="visual-diagram-rubric" className="my-4 p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200">
        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-emerald-400">
          <Award className="w-4 h-4" />
          <span>Ma Trận Rubric Đánh Giá Khi Có Trợ Lực AI</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-slate-800 border border-slate-700">
            <div className="font-bold text-rose-400 mb-0.5">Tiêu chí truyền thống (Giảm tỷ trọng):</div>
            <p className="text-slate-400 text-[11px]">Trình bày mẫu, nhớ công thức, câu chữ bóng bẩy (AI làm thay dễ dàng).</p>
          </div>
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">
            <div className="font-bold text-emerald-300 mb-0.5">Tiêu chí năng lực 4.0 (Tăng tỷ trọng):</div>
            <p className="text-slate-300 text-[11px]">Nhật ký prompt, kiểm chứng dữ liệu, phản biện và bảo vệ ý tưởng trực tiếp.</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'ethics_scale') {
    return (
      <div id="visual-diagram-ethics" className="my-4 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-400" />
            Nguyên Tắc Khảo Thí Nhân Văn (UNESCO Guidelines)
          </span>
          <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded border border-purple-400/20">
            Human Agency
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Không bao giờ sử dụng phán quyết tự động của thuật toán đơn lẻ làm căn cứ kỷ luật. Giáo viên luôn là người đưa ra quyết định sư phạm cuối cùng dựa trên bằng chứng toàn diện và sự tôn trọng nhân phẩm người học.
        </p>
      </div>
    );
  }

  return null;
};
