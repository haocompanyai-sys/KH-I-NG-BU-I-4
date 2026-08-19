import React, { useState } from 'react';
import { ActiveView, StudentInfo, ScoreState } from '../types';
import { 
  User, 
  CheckSquare, 
  ToggleLeft, 
  Layers, 
  Zap, 
  Award, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sparkles,
  GraduationCap,
  LogOut,
  Users,
  Trophy,
  Crown,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  student: StudentInfo | null;
  scoreState: ScoreState;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetAll: () => void;
  onUpdateStudentInfo?: (info: Partial<StudentInfo>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  student,
  scoreState,
  isMuted,
  onToggleMute,
  onResetAll,
  onUpdateStudentInfo,
}) => {
  const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>(student?.fullName || '');
  const [editSchool, setEditSchool] = useState<string>(student?.schoolOrOrg || '');
  const [editStudentId, setEditStudentId] = useState<string>(student?.studentId || '');

  const totalScore = 
    scoreState.game1.score + 
    scoreState.game2.score + 
    scoreState.game3.score + 
    scoreState.game4.score;

  const isPassed = totalScore >= 50;

  const navItems = [
    {
      id: 'student_entry' as ActiveView,
      title: 'Thông Tin Học Viên',
      subtitle: student?.fullName || 'Họ tên, đơn vị, mã học viên',
      icon: <User className="w-4 h-4 text-indigo-600" />,
      badge: 'Hồ sơ 📝',
      badgeColor: 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
    },
    {
      id: 'game1_mcq' as ActiveView,
      title: 'Trò 1: Trắc Nghiệm 4 Đáp Án',
      subtitle: 'Tình huống sư phạm & phân hóa',
      icon: <CheckSquare className="w-4 h-4" />,
      points: `${scoreState.game1.score} / 25 đ`,
      isDone: scoreState.game1.isCompleted
    },
    {
      id: 'game2_truefalse' as ActiveView,
      title: 'Trò 2: Trắc Nghiệm Đúng / Sai',
      subtitle: 'Phán đoán chuẩn mực khảo thí AI',
      icon: <ToggleLeft className="w-4 h-4" />,
      points: `${scoreState.game2.score} / 25 đ`,
      isDone: scoreState.game2.isCompleted
    },
    {
      id: 'game3_dragdrop' as ActiveView,
      title: 'Trò 3: Kéo Thả Ma Trận Đánh Giá',
      subtitle: 'Phân loại mức độ tích hợp AI',
      icon: <Layers className="w-4 h-4" />,
      points: `${scoreState.game3.score} / 25 đ`,
      isDone: scoreState.game3.isCompleted
    },
    {
      id: 'game4_speed' as ActiveView,
      title: 'Trò 4: Trả Lời Nhanh 4 Đáp Án',
      subtitle: 'Phản xạ nhận diện thuật ngữ',
      icon: <Zap className="w-4 h-4" />,
      points: `${scoreState.game4.score} / 25 đ`,
      isDone: scoreState.game4.isCompleted
    },
    {
      id: 'results_evaluation' as ActiveView,
      title: 'Chứng Nhận Khởi Động Buổi 4',
      subtitle: isPassed ? 'Xếp loại: ĐẠT' : 'Xếp loại: CHƯA ĐẠT',
      icon: <Award className="w-4 h-4" />,
      points: `${totalScore} / 100 đ`,
      highlight: true
    },
    {
      id: 'my_ranking' as ActiveView,
      title: 'Bảng Xếp Hạng Của Tôi',
      subtitle: 'Vị trí thi đua & Phân tích điểm',
      icon: <Crown className="w-4 h-4 text-amber-500" />,
      badge: 'Cá nhân ⭐',
      badgeColor: 'bg-indigo-100 text-indigo-800 font-black'
    },
    {
      id: 'class_leaderboard' as ActiveView,
      title: 'Bảng Thi Đua Cả Lớp',
      subtitle: 'Bục vinh quang & Kết quả toàn khóa',
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
      badge: 'Cả lớp 🏆',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-200'
    },
    {
      id: 'admin_panel' as ActiveView,
      title: 'Quản Trị Viên (Admin)',
      subtitle: 'Sửa điểm, xóa data, GitHub sync',
      icon: <ShieldCheck className="w-4 h-4 text-rose-500" />,
      badge: 'Admin 🔒',
      badgeColor: 'bg-rose-100 text-rose-800 font-black'
    },
    {
      id: 'handbook' as ActiveView,
      title: 'Cẩm Nang Khảo Thí AI',
      subtitle: 'Tra cứu chuẩn GDPT & UNESCO',
      icon: <BookOpen className="w-4 h-4" />
    }
  ];

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (onUpdateStudentInfo && editFullName.trim()) {
      onUpdateStudentInfo({
        fullName: editFullName.trim(),
        schoolOrOrg: editSchool.trim() || 'Đơn vị giáo dục',
        studentId: editStudentId.trim() || student?.studentId || `HV-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }
    setShowEditNameModal(false);
  };

  return (
    <aside id="app-vertical-sidebar" className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 shadow-sm">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">
              KHẢO THÍ SƯ PHẠM SỐ
            </h1>
            <span className="text-[11px] font-semibold text-indigo-600 block">
              Khởi Động Buổi 4: Đánh Giá AI
            </span>
          </div>
        </div>

        {/* Student Quick Name Badge (Click to edit without login barrier) */}
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="text-2xl shrink-0">{student?.avatar || '👨‍🏫'}</div>
            <div className="overflow-hidden">
              <div className="text-xs font-black text-slate-900 truncate">
                {student?.fullName || 'Học viên'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {student?.schoolOrOrg || 'Đơn vị giáo dục'} &bull; {student?.studentId}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setEditFullName(student?.fullName || '');
              setEditSchool(student?.schoolOrOrg || '');
              setShowEditNameModal(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
            title="Bấm để sửa tên & đơn vị của bạn"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total Score Summary Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Điểm Của Bạn:
            </span>
            <span className="text-indigo-600 text-sm font-black">
              {totalScore} / 100 đ
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isPassed ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${totalScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mt-1.5">
            <span>Chuẩn đạt: &ge; 50 điểm</span>
            <span className={isPassed ? 'text-emerald-700 font-extrabold' : 'text-rose-600 font-extrabold'}>
              {isPassed ? '✓ ĐẠT' : '✗ CHƯA ĐẠT'}
            </span>
          </div>
        </div>

        {/* Vertical Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-btn-${item.id}`}
                onClick={() => {
                  soundManager.playClick();
                  onSelectView(item.id);
                }}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 font-semibold'
                    : item.highlight
                    ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 font-semibold'
                    : 'bg-white border-transparent hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                      {item.title}
                    </div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.points && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-1.5 ${
                    isActive 
                      ? 'bg-white/25 text-white' 
                      : item.highlight
                      ? 'bg-amber-200/80 text-amber-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.points}
                  </span>
                )}
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Sound & Reset */}
      <div className="pt-3 mt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <button
          id="btn-sidebar-toggle-sound"
          onClick={() => {
            onToggleMute();
            soundManager.playClick();
          }}
          className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100 font-medium transition-colors cursor-pointer"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{isMuted ? 'Tắt tiếng' : 'Bật tiếng'}</span>
        </button>

        <button
          id="btn-sidebar-reset"
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn làm lại từ đầu các trò chơi không?')) {
              onResetAll();
            }
          }}
          className="flex items-center gap-1 p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-medium transition-colors cursor-pointer"
          title="Làm lại từ đầu"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm lại bài</span>
        </button>
      </div>

      {/* Quick Edit Name Modal */}
      {showEditNameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900">
                Cập Nhật Họ Tên & Đơn Vị Của Bạn
              </h3>
              <button
                onClick={() => setShowEditNameModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và Tên:</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trường học / Đơn vị:</label>
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  placeholder="Ví dụ: THPT Chuyên, ĐH Sư Phạm..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã Học Viên / SBD:</label>
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  placeholder="Ví dụ: HV-2026..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditNameModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-200"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
