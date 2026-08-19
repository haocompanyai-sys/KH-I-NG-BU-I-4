import React, { useRef } from 'react';
import { StudentInfo, ScoreState, EvaluationResult } from '../types';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  BookOpen, 
  ShieldCheck, 
  User, 
  School, 
  Calendar, 
  Hash,
  GraduationCap,
  XCircle
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ResultsEvaluationViewProps {
  student: StudentInfo | null;
  scoreState: ScoreState;
  onNavigateGame: (gameId: any) => void;
}

export const ResultsEvaluationView: React.FC<ResultsEvaluationViewProps> = ({
  student,
  scoreState,
  onNavigateGame,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  const g1 = scoreState.game1.score;
  const g2 = scoreState.game2.score;
  const g3 = scoreState.game3.score;
  const g4 = scoreState.game4.score;
  const totalScore = g1 + g2 + g3 + g4;

  const getEvaluationTier = (score: number): EvaluationResult => {
    if (score >= 50) {
      return {
        totalScore: score,
        percentage: score,
        tier: 'Đạt',
        title: 'ĐẠT YÊU CẦU NĂNG LỰC KHỞI ĐỘNG BUỔI 4',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        strengths: [
          'Nắm vững nguyên tắc cơ bản trong thiết kế đề kiểm tra hạn chế việc học sinh lạm dụng AI.',
          'Hiểu đúng vai trò và giới hạn của các phần mềm phát hiện AI (AI Detector) theo khuyến nghị UNESCO.',
          'Biết ứng dụng cơ chế Human-in-the-loop để rà soát, thẩm định câu hỏi và kiểm soát ảo giác dữ liệu.',
          'Phân biệt được các cấp độ nhiệm vụ đánh giá từ mức nhận biết đến mức phản biện và sáng tạo thực chất.'
        ],
        growthAreas: [
          'Tiếp tục trau chuốt cấu trúc câu lệnh Prompt khảo thí theo khung C-R-A-F-T để tự động hóa tạo câu hỏi phân hóa cao.',
          'Tích cực áp dụng hình thức phỏng vấn vấn đáp nhanh (Oral Defense) trong các bài tập dự án thực tế.'
        ],
        recommendation: 'Chúc mừng Thầy/Cô và Học viên đã hoàn thành xuất sắc bài tập khởi động Buổi 4! Sẵn sàng bước vào các nội dung thực hành chuyên sâu tiếp theo.'
      };
    } else {
      return {
        totalScore: score,
        percentage: score,
        tier: 'Chưa đạt',
        title: 'CHƯA ĐẠT CHUẨN ĐẦU RA BÀI TẬP KHỞI ĐỘNG',
        color: 'text-rose-700 bg-rose-50 border-rose-300',
        strengths: [
          'Đã tham gia đầy đủ cả 4 trò chơi khảo sát nhận thức ban đầu.'
        ],
        growthAreas: [
          'Cần lưu ý: Không sử dụng AI Detector làm bằng chứng duy nhất để phạt học sinh mà cần đối thoại trực tiếp.',
          'Cần hiểu rõ hiện tượng ảo giác AI (Hallucination) để luôn tự thẩm định đề thi trước khi sử dụng.',
          'Cần chuyển dần các câu hỏi tái hiện định nghĩa sang các câu hỏi yêu cầu so sánh, phản biện và vận dụng.'
        ],
        recommendation: 'Thầy/Cô và Học viên nên đọc lại mục Cẩm Nang Khảo Thí và thực hiện lại các trò chơi để củng cố kiến thức trước khi tiếp tục chương trình.'
      };
    }
  };

  const evalResult = getEvaluationTier(totalScore);

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div id="results-evaluation-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            BÁO CÁO ĐÁNH GIÁ KẾT QUẢ KHỞI ĐỘNG BUỔI 4
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Kết Quả Tổng Hợp 4 Trò Chơi Khảo Thí
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Học viên: <strong className="text-slate-800">{student?.fullName || 'Chưa ghi danh'}</strong> &bull; Đơn vị: {student?.schoolOrOrg || 'Tự do'}
          </p>
        </div>

        {/* Big Score Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center sm:text-right shrink-0">
          <span className="text-[11px] uppercase font-bold text-slate-500 block">Tổng Điểm Khảo Thí:</span>
          <span className="text-3xl sm:text-4xl font-black text-indigo-600 block mt-0.5">
            {totalScore} <span className="text-lg text-slate-400 font-bold">/ 100</span>
          </span>
          <div className="mt-1">
            <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full border ${
              evalResult.tier === 'Đạt' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}>
              {evalResult.tier === 'Đạt' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              XẾP LOẠI: {evalResult.tier.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Games Score Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => onNavigateGame('game1_mcq')}
          className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-indigo-300 hover:shadow-xs transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Trò 1: Trắc Nghiệm</span>
          <div className="text-xl font-black text-indigo-600 my-1">{g1} / 25 đ</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(g1 / 25) * 100}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">5 câu x 5 điểm</span>
        </div>

        <div 
          onClick={() => onNavigateGame('game2_truefalse')}
          className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-xs transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Trò 2: Đúng / Sai</span>
          <div className="text-xl font-black text-blue-600 my-1">{g2} / 25 đ</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(g2 / 25) * 100}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">5 câu x 5 điểm</span>
        </div>

        <div 
          onClick={() => onNavigateGame('game3_dragdrop')}
          className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-amber-300 hover:shadow-xs transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Trò 3: Kéo Thả</span>
          <div className="text-xl font-black text-amber-600 my-1">{g3} / 25 đ</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(g3 / 25) * 100}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">5 mục x 5 điểm</span>
        </div>

        <div 
          onClick={() => onNavigateGame('game4_speed')}
          className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-emerald-300 hover:shadow-xs transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Trò 4: Trả Lời Nhanh</span>
          <div className="text-xl font-black text-emerald-600 my-1">{g4} / 25 đ</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(g4 / 25) * 100}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">5 câu x 5 điểm</span>
        </div>
      </div>

      {/* Differentiated Analysis & Strengths */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-black text-slate-900">
            Đánh Giá Chuẩn Đầu Ra Năng Lực Sư Phạm Số
          </h3>
        </div>

        <div className={`p-4 rounded-2xl border ${evalResult.color} space-y-1`}>
          <div className="text-xs font-bold uppercase tracking-wider">Kết Luận Đánh Giá:</div>
          <div className="text-base font-black tracking-tight">{evalResult.title}</div>
          <p className="text-xs font-medium leading-relaxed pt-1">{evalResult.recommendation}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Strengths */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Các Năng Lực Đã Đạt Chuẩn:
            </span>
            <ul className="space-y-2">
              {evalResult.strengths.map((st, i) => (
                <li key={i} className="text-xs text-slate-700 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 leading-relaxed">
                  &bull; {st}
                </li>
              ))}
            </ul>
          </div>

          {/* Growth Areas */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Nội Dung Cần Lưu Ý & Hoàn Thiện Thêm:
            </span>
            <ul className="space-y-2">
              {evalResult.growthAreas.map((ga, i) => (
                <li key={i} className="text-xs text-slate-700 bg-amber-50/60 border border-amber-100 rounded-xl p-3 leading-relaxed">
                  &bull; {ga}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Printable Certificate Card */}
      <div 
        ref={certRef}
        id="certificate-print-area"
        className="bg-gradient-to-b from-white via-indigo-50/30 to-amber-50/30 border-4 border-double border-indigo-200 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-4 relative overflow-hidden"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center font-black shadow-md shadow-indigo-200">
          <GraduationCap className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 block">
            CHUYÊN ĐỀ ỨNG DỤNG AI TRONG KHẢO THÍ & ĐÁNH GIÁ
          </span>
          {/* USER SPECIFIED EXACT TITLE */}
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            CHỨNG NHẬN HOÀN THÀNH BÀI TẬP KHỞI ĐỘNG BUỔI 4
          </h3>
          <span className="text-xs text-slate-500 font-medium block mt-0.5">
            Khóa bồi dưỡng nâng cao năng lực sư phạm số và khảo thí hiện đại
          </span>
        </div>

        <div className="py-2 border-y border-slate-200 max-w-lg mx-auto space-y-1">
          <span className="text-xs text-slate-500">Chứng nhận Học viên:</span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {student?.fullName || 'Thầy/Cô Học Viên'}
          </div>
          <div className="text-xs text-slate-600">
            {student?.schoolOrOrg || 'Đơn vị giáo dục'} &bull; SBD: {student?.studentId || 'HV-2026'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-xs py-1">
          <div className="bg-white/80 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block uppercase">Tổng Điểm</span>
            <span className="text-base font-black text-indigo-600">{totalScore} / 100</span>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block uppercase">Xếp Loại</span>
            <span className={`text-base font-black ${evalResult.tier === 'Đạt' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {evalResult.tier.toUpperCase()}
            </span>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block uppercase">Ngày Cấp</span>
            <span className="text-xs font-bold text-slate-700 mt-1 block">
              {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/80 max-w-lg mx-auto">
          <span>Mã xác thực: KD4-AI-{Math.abs(totalScore * 73 + 1024)}</span>
          <span className="font-bold text-indigo-700">BAN ĐÀO TẠO & KHẢO THÍ SƯ PHẠM</span>
        </div>
      </div>

      {/* Print / Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={handlePrint}
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-102"
        >
          <Printer className="w-4 h-4" />
          <span>In / Lưu Giấy Chứng Nhận (PDF)</span>
        </button>

        <button
          onClick={() => onNavigateGame('student_entry')}
          className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <User className="w-4 h-4" />
          <span>Đổi Thông Tin Học Viên</span>
        </button>
      </div>
    </div>
  );
};
