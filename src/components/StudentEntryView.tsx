import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { User, School, Hash, ArrowRight, CheckCircle2, Award, Sparkles, BookOpen } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface StudentEntryViewProps {
  student: StudentInfo | null;
  onSaveStudent: (info: StudentInfo) => void;
  onProceedToQuiz: () => void;
}

const AVATARS = ['👨‍🏫', '👩‍🏫', '🎓', '💡', '🚀', '🧠', '🔬', '📚'];

export const StudentEntryView: React.FC<StudentEntryViewProps> = ({
  student,
  onSaveStudent,
  onProceedToQuiz,
}) => {
  const [fullName, setFullName] = useState<string>(student?.fullName || '');
  const [schoolOrOrg, setSchoolOrOrg] = useState<string>(student?.schoolOrOrg || '');
  const [studentId, setStudentId] = useState<string>(student?.studentId || '');
  const [avatar, setAvatar] = useState<string>(student?.avatar || AVATARS[0]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên của bạn để tạo hồ sơ khảo thí!');
      soundManager.playWrong();
      return;
    }

    const info: StudentInfo = {
      fullName: fullName.trim(),
      schoolOrOrg: schoolOrOrg.trim() || 'Đơn vị giáo dục',
      studentId: studentId.trim() || `HV-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar,
      startedAt: student?.startedAt || new Date().toLocaleString('vi-VN'),
    };

    soundManager.playLevelUp();
    onSaveStudent(info);
    onProceedToQuiz();
  };

  return (
    <div id="student-entry-container" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          HỆ THỐNG KHẢO THÍ & ĐÁNH GIÁ NĂNG LỰC SƯ PHẠM SỐ
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Ghi Danh Học Viên & Bắt Đầu Thử Thách
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Hoàn thành 4 trò chơi tương tác (tổng 100 điểm) để nhận báo cáo phân hóa năng lực và Chứng nhận hoàn thành chuyên đề Khảo thí AI.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. Chọn Biểu Tượng Đại Diện:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    soundManager.playClick();
                    setAvatar(av);
                  }}
                  className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border transition-all ${
                    avatar === av
                      ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500 scale-105 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
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
                placeholder="Ví dụ: ThS. Nguyễn Văn An hoặc Trần Thị Mai..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="input-school" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-indigo-600" />
                  Đơn Vị / Trường Học / Tổ Chuyên Môn
                </label>
                <input
                  id="input-school"
                  type="text"
                  value={schoolOrOrg}
                  onChange={(e) => setSchoolOrOrg(e.target.value)}
                  placeholder="Ví dụ: THPT Chuyên Hà Nội - Amsterdam"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="input-student-id" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-indigo-600" />
                  Mã Số Học Viên / SBD (Tùy chọn)
                </label>
                <input
                  id="input-student-id"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Ví dụ: HV-2026"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 4 Games Structure Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Cơ Cấu 4 Trò Chơi Đánh Giá (Tổng 100 Điểm):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="font-bold text-indigo-600 block">Trò 1: Trắc Nghiệm</span>
                <span className="text-[11px] text-slate-500">5 câu = 25 điểm</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="font-bold text-blue-600 block">Trò 2: Đúng / Sai</span>
                <span className="text-[11px] text-slate-500">5 câu = 25 điểm</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="font-bold text-amber-600 block">Trò 3: Kéo Thả</span>
                <span className="text-[11px] text-slate-500">5 mục = 25 điểm</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="font-bold text-emerald-600 block">Trò 4: Trả Lời Nhanh</span>
                <span className="text-[11px] text-slate-500">5 câu = 25 điểm</span>
              </div>
            </div>
          </div>

          <button
            id="btn-submit-student"
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
          >
            <span>Lưu Thông Tin & Bắt Đầu Trò 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
