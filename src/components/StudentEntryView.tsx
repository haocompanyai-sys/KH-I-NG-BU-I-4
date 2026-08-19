import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { 
  User, 
  School, 
  Hash, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  BookOpen,
  RefreshCw,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface StudentEntryViewProps {
  student: StudentInfo | null;
  onSaveStudent: (info: StudentInfo) => void;
  onProceedToQuiz: () => void;
}

const AVATARS = ['👨‍🏫', '👩‍🏫', '🎓', '💡', '🚀', '🧠', '🔬', '📚', '🌟', '🧑‍💻'];

export const StudentEntryView: React.FC<StudentEntryViewProps> = ({
  student,
  onSaveStudent,
  onProceedToQuiz,
}) => {
  const [fullName, setFullName] = useState<string>(
    student?.fullName && student.fullName !== 'Học viên' ? student.fullName : ''
  );
  const [schoolOrOrg, setSchoolOrOrg] = useState<string>(
    student?.schoolOrOrg && student.schoolOrOrg !== 'Đơn vị giáo dục' ? student.schoolOrOrg : ''
  );
  const [studentId, setStudentId] = useState<string>(
    student?.studentId || `HV-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [avatar, setAvatar] = useState<string>(student?.avatar || AVATARS[0]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleGenerateStudentId = () => {
    soundManager.playClick();
    const randomId = `HV-${Math.floor(1000 + Math.random() * 9000)}`;
    setStudentId(randomId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên học viên!');
      soundManager.playWrong();
      return;
    }
    if (!schoolOrOrg.trim()) {
      setErrorMsg('Vui lòng nhập Đơn vị / Trường học / Cơ quan công tác!');
      soundManager.playWrong();
      return;
    }
    if (!studentId.trim()) {
      setErrorMsg('Vui lòng nhập Mã học viên / Số báo danh (hoặc bấm Tạo mã tự động)!');
      soundManager.playWrong();
      return;
    }

    const info: StudentInfo = {
      fullName: fullName.trim(),
      schoolOrOrg: schoolOrOrg.trim(),
      studentId: studentId.trim(),
      avatar,
      startedAt: student?.startedAt || new Date().toISOString(),
    };

    soundManager.playLevelUp();
    onSaveStudent(info);
    onProceedToQuiz();
  };

  return (
    <div id="student-entry-container" className="max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white border border-indigo-700/50 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CHUYÊN ĐỀ 4: KHẢO THÍ & ĐÁNH GIÁ SƯ PHẠM SỐ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ghi Danh Học Viên Trước Khi Vào Thi
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto leading-relaxed">
            Vui lòng điền đầy đủ <strong>Họ tên</strong>, <strong>Đơn vị</strong> và <strong>Mã học viên</strong> để hệ thống cấp quyền làm bài thi và ghi nhận bảng điểm thi đua.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. Chọn Avatar Đại Diện:
            </label>
            <div className="flex flex-wrap gap-2.5">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    soundManager.playClick();
                    setAvatar(av);
                  }}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500 scale-110 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="input-fullname" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                Họ và Tên Học Viên <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-fullname"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Ví dụ: Nguyễn Văn An, ThS. Trần Thị Mai..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="input-school" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-indigo-600" />
                  Đơn Vị / Trường Học / Cơ Quan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-school"
                  type="text"
                  value={schoolOrOrg}
                  onChange={(e) => {
                    setSchoolOrOrg(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Ví dụ: THPT Chuyên Hà Nội - Amsterdam"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-student-id" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-indigo-600" />
                    Mã Số Học Viên / SBD <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateStudentId}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Tạo mã tự động</span>
                  </button>
                </div>
                <input
                  id="input-student-id"
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Ví dụ: HV-2026 hoặc SBD-08..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 4 Games Structure Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Target className="w-4 h-4 text-indigo-600" />
                Cơ Cấu 4 Trò Chơi Đánh Giá (Tổng 100 Điểm):
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Chuẩn: &ge; 50đ Đạt
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
                <span className="font-black text-indigo-600 block">Trò 1: Trắc Nghiệm</span>
                <span className="text-[11px] text-slate-500 font-medium">5 câu &bull; 25 điểm</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
                <span className="font-black text-blue-600 block">Trò 2: Đúng / Sai</span>
                <span className="text-[11px] text-slate-500 font-medium">5 câu &bull; 25 điểm</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
                <span className="font-black text-amber-600 block">Trò 3: Kéo Thả</span>
                <span className="text-[11px] text-slate-500 font-medium">5 mục &bull; 25 điểm</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
                <span className="font-black text-emerald-600 block">Trò 4: Tốc Độ</span>
                <span className="text-[11px] text-slate-500 font-medium">5 câu &bull; 25 điểm</span>
              </div>
            </div>
          </div>

          <button
            id="btn-submit-student"
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <span>Xác Nhận Thông Tin & Vào Làm Bài Thi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
