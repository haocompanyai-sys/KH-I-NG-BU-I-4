import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { 
  User, 
  School, 
  Hash, 
  LogIn, 
  Sparkles, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckSquare, 
  ToggleLeft 
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface LoginPageProps {
  onLogin: (student: StudentInfo) => void;
  initialStudent: StudentInfo | null;
}

const AVATARS = ['👨‍🏫', '👩‍🏫', '🎓', '💡', '🌟', '🚀', '📚', '🎯'];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, initialStudent }) => {
  const [fullName, setFullName] = useState<string>(initialStudent?.fullName || '');
  const [schoolOrOrg, setSchoolOrOrg] = useState<string>(initialStudent?.schoolOrOrg || '');
  const [studentId, setStudentId] = useState<string>(
    initialStudent?.studentId || `HV-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [selectedAvatar, setSelectedAvatar] = useState<string>(initialStudent?.avatar || '👨‍🏫');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và Tên của Thầy/Cô hoặc Học viên để tiếp tục.');
      soundManager.playWrong();
      return;
    }

    soundManager.playLevelUp();
    onLogin({
      fullName: fullName.trim(),
      schoolOrOrg: schoolOrOrg.trim() || 'Đơn vị giáo dục',
      studentId: studentId.trim() || 'HV-2026',
      avatar: selectedAvatar,
      startedAt: new Date().toISOString(),
    });
  };

  return (
    <div id="login-page-root" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Left Side: Overview & Instructions */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black shadow-inner">
              <GraduationCap className="w-8 h-8 text-indigo-300" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 inline-block mb-2">
                BÀI TẬP KHỞI ĐỘNG BUỔI 4
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                Sử Dụng AI Trong Kiểm Tra & Đánh Giá
              </h1>
              <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
                Hệ thống 4 trò chơi khảo thí chuẩn hóa, câu hỏi trắc nghiệm 4 đáp án A-B-C-D, phân loại Đạt / Chưa đạt trên thang điểm 100.
              </p>
            </div>

            {/* 4 Games Quick Preview */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 truncate">
                  <strong className="block text-white font-bold">Trò 1: Trắc Nghiệm 4 Đáp Án</strong>
                  <span className="text-[11px] text-indigo-200">5 câu x 5đ = 25 điểm (A, B, C, D)</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <ToggleLeft className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="flex-1 truncate">
                  <strong className="block text-white font-bold">Trò 2: Trắc Nghiệm Đúng / Sai</strong>
                  <span className="text-[11px] text-indigo-200">5 câu x 5đ = 25 điểm</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 truncate">
                  <strong className="block text-white font-bold">Trò 3: Kéo Thả Ma Trận Đánh Giá</strong>
                  <span className="text-[11px] text-indigo-200">5 mục x 5đ = 25 điểm</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <Zap className="w-4 h-4 text-orange-400 shrink-0" />
                <div className="flex-1 truncate">
                  <strong className="block text-white font-bold">Trò 4: Trả Lời Nhanh 4 Đáp Án</strong>
                  <span className="text-[11px] text-indigo-200">5 câu x 5đ = 25 điểm (A, B, C, D)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-indigo-300/80 border-t border-white/10 pt-3 flex items-center justify-between">
            <span>Tổng điểm: <strong>100 điểm</strong></span>
            <span className="font-bold text-emerald-300">Xếp loại: Đạt &ge; 50đ</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Đăng Nhập Khảo Thí
            </h2>
            <p className="text-xs text-slate-500">
              Vui lòng điền thông tin học viên để khởi tạo bài làm và in Giấy chứng nhận hoàn thành.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-shake">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Họ và Tên Học Viên <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-login-fullname"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold transition-all"
                autoFocus
              />
            </div>

            {/* School / Organization */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-indigo-600" />
                Đơn Vị / Trường Học / Tổ Chuyên Môn
              </label>
              <input
                id="input-login-school"
                type="text"
                value={schoolOrOrg}
                onChange={(e) => setSchoolOrOrg(e.target.value)}
                placeholder="Ví dụ: THPT Chuyên / Đại học Sư phạm..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold transition-all"
              />
            </div>

            {/* Student ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                Số Báo Danh / Mã Học Viên
              </label>
              <input
                id="input-login-studentid"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Ví dụ: HV-2026"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold transition-all"
              />
            </div>

            {/* Avatar Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Chọn Biểu Tượng Đại Diện:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedAvatar(av);
                    }}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                      selectedAvatar === av
                        ? 'bg-indigo-100 border-2 border-indigo-600 scale-110 shadow-xs'
                        : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              className="w-full mt-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>ĐĂNG NHẬP & BẮT ĐẦU BÀI TẬP KHỞI ĐỘNG</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
