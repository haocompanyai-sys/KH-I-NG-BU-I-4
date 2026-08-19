import React, { useState, useEffect } from 'react';
import { StudentInfo, ScoreState, StudentSubmission, LeaderboardStats, ActiveView } from '../types';
import { 
  Trophy, 
  Crown, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Zap, 
  Layers, 
  CheckSquare, 
  ToggleLeft, 
  ArrowRight, 
  RotateCcw, 
  Printer, 
  Users, 
  Target, 
  Flame, 
  ShieldCheck,
  Star,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface MyRankingViewProps {
  student: StudentInfo | null;
  scoreState: ScoreState;
  onNavigate: (view: ActiveView) => void;
}

export const MyRankingView: React.FC<MyRankingViewProps> = ({
  student,
  scoreState,
  onNavigate,
}) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const totalScore = 
    scoreState.game1.score + 
    scoreState.game2.score + 
    scoreState.game3.score + 
    scoreState.game4.score;

  const isPassed = totalScore >= 50;

  const fetchRankings = async () => {
    try {
      const [resList, resStats] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/submissions/stats')
      ]);

      if (resList.ok) {
        const jsonList = await resList.json();
        if (jsonList.success && Array.isArray(jsonList.data)) {
          setSubmissions(jsonList.data);
        }
      }

      if (resStats.ok) {
        const jsonStats = await resStats.json();
        setStats(jsonStats);
      }
    } catch (e) {
      console.error('Fetch rankings error in MyRankingView:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  // Compute live ranking by injecting/updating current student in the list
  const currentSId = student?.studentId || 'ME';
  const currentFullName = student?.fullName || 'Học viên';

  // Build a synthesized list that ALWAYS includes the current live score
  const mergedList: {
    studentId: string;
    fullName: string;
    schoolOrOrg: string;
    avatar: string;
    totalScore: number;
    game1: number;
    game2: number;
    game3: number;
    game4: number;
    isCurrent: boolean;
  }[] = [];

  let foundCurrent = false;

  submissions.forEach((s) => {
    const isMe = 
      (student && s.studentId === student.studentId) ||
      (student && s.fullName.toLowerCase() === student.fullName.toLowerCase());

    if (isMe) {
      foundCurrent = true;
      mergedList.push({
        studentId: s.studentId,
        fullName: student.fullName,
        schoolOrOrg: student.schoolOrOrg,
        avatar: student.avatar,
        totalScore: Math.max(s.scores.totalScore, totalScore),
        game1: Math.max(s.scores.game1, scoreState.game1.score),
        game2: Math.max(s.scores.game2, scoreState.game2.score),
        game3: Math.max(s.scores.game3, scoreState.game3.score),
        game4: Math.max(s.scores.game4, scoreState.game4.score),
        isCurrent: true,
      });
    } else {
      mergedList.push({
        studentId: s.studentId,
        fullName: s.fullName,
        schoolOrOrg: s.schoolOrOrg,
        avatar: s.avatar,
        totalScore: s.scores.totalScore,
        game1: s.scores.game1,
        game2: s.scores.game2,
        game3: s.scores.game3,
        game4: s.scores.game4,
        isCurrent: false,
      });
    }
  });

  if (!foundCurrent && student) {
    mergedList.push({
      studentId: student.studentId,
      fullName: student.fullName,
      schoolOrOrg: student.schoolOrOrg,
      avatar: student.avatar,
      totalScore,
      game1: scoreState.game1.score,
      game2: scoreState.game2.score,
      game3: scoreState.game3.score,
      game4: scoreState.game4.score,
      isCurrent: true,
    });
  }

  // Sort descending by total score
  mergedList.sort((a, b) => b.totalScore - a.totalScore);

  const myRank = mergedList.findIndex((item) => item.isCurrent) + 1;
  const totalStudentsCount = Math.max(mergedList.length, 1);
  const top1Score = mergedList.length > 0 ? mergedList[0].totalScore : 100;
  const diffToTop1 = Math.max(0, top1Score - totalScore);
  const diffToPass = Math.max(0, 50 - totalScore);

  const avgTotal = stats ? stats.averageTotalScore : 65;
  const scoreDiffVsAvg = Math.round((totalScore - avgTotal) * 10) / 10;

  return (
    <div id="my-ranking-view-root" className="max-w-5xl mx-auto px-2 sm:px-4 py-6 space-y-6 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/50 relative overflow-hidden">
        {/* Glow light effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-300/30 text-amber-300 rounded-full text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>HỒ SƠ THI ĐUA & BẢNG XẾP HẠNG CỦA TÔI</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-3xl flex items-center justify-center shadow-md shrink-0">
                {student?.avatar || '👨‍🏫'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {student?.fullName || 'Học Viên Chưa Ghi Danh'}
                </h1>
                <div className="text-xs text-indigo-200 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{student?.schoolOrOrg || 'Đơn vị giáo dục'}</span>
                  <span>&bull;</span>
                  <span>SBD: {student?.studentId || 'HV-2026'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Big Rank Badge */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 bg-white/10 border border-white/15 p-4 rounded-2xl shrink-0 backdrop-blur-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Vị Trí Hiện Tại
            </span>
            <div className="flex items-center gap-2">
              {myRank === 1 ? (
                <Crown className="w-7 h-7 text-amber-400 animate-bounce" />
              ) : myRank <= 3 ? (
                <Trophy className="w-6 h-6 text-amber-300" />
              ) : (
                <Award className="w-6 h-6 text-indigo-300" />
              )}
              <span className="text-3xl sm:text-4xl font-black text-amber-300">
                #{myRank > 0 ? myRank : 1}
              </span>
              <span className="text-xs font-bold text-indigo-200">
                / {totalStudentsCount} học viên
              </span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
              isPassed ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
            }`}>
              {isPassed ? '✓ XẾP LOẠI: ĐẠT' : '⏳ CẦN HOÀN THIỆN ĐỂ ĐẠT'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Score Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Score */}
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-sm space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>TỔNG ĐIỂM</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">
            {totalScore} <span className="text-xs text-slate-400 font-bold">/ 100đ</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${totalScore}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block pt-0.5">
            Chuẩn hoàn thành: &ge; 50 điểm
          </span>
        </div>

        {/* Vs Class Average */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>SO VỚI TB LỚP</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {scoreDiffVsAvg >= 0 ? `+${scoreDiffVsAvg}` : `${scoreDiffVsAvg}`}đ
          </div>
          <span className="text-[11px] font-bold text-slate-600 block">
            Điểm TB toàn khóa: {avgTotal}đ
          </span>
          <span className={`text-[10px] font-bold block ${scoreDiffVsAvg >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {scoreDiffVsAvg >= 0 ? 'Cao hơn mức trung bình' : 'Dưới mức trung bình'}
          </span>
        </div>

        {/* Distance to Top 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>KHOẢNG CÁCH TOP 1</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">
            {myRank === 1 ? '🥇 QUÁN QUÂN' : `-${diffToTop1}đ`}
          </div>
          <span className="text-[11px] font-bold text-slate-600 block">
            Điểm Top 1 hiện tại: {top1Score}đ
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            {myRank === 1 ? 'Bạn đang dẫn đầu toàn khóa!' : `Cần +${diffToTop1}đ để chiếm vị trí #1`}
          </span>
        </div>

        {/* Status Tier */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>CHỨNG NHẬN BUỔI 4</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPassed ? 'ĐÃ ĐẠT CHUẨN' : 'CHƯA ĐẠT'}
          </div>
          <span className="text-[11px] font-bold text-slate-600 block">
            {isPassed ? 'Đủ điều kiện cấp chứng nhận' : `Cần thêm ${diffToPass}đ để ĐẠT`}
          </span>
          <span className="text-[10px] text-indigo-600 font-bold block">
            Khởi động Buổi 4 AI
          </span>
        </div>
      </div>

      {/* Breakdown 4 Games Of You */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Chi Tiết Điểm Số & Đánh Giá Từng Trò Chơi Của Bạn
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Tổng cộng: 4 Trò &bull; Tối đa 100 điểm
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Game 1 */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Trò 1: Trắc Nghiệm 4 Đáp Án
                  </h3>
                  <span className="text-[10px] text-slate-500">Tình huống phân tích nâng cao</span>
                </div>
              </div>
              <span className="text-base font-black text-indigo-700">
                {scoreState.game1.score} / 25 đ
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(scoreState.game1.score / 25) * 100}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 text-[11px]">
                TB Lớp: {stats ? stats.averageGame1 : 18}đ
              </span>
              <button
                onClick={() => onNavigate('game1_mcq')}
                className="text-indigo-600 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>{scoreState.game1.score === 25 ? 'Xem lại' : 'Làm lại để nâng điểm'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Game 2 */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <ToggleLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Trò 2: Trắc Nghiệm Đúng / Sai
                  </h3>
                  <span className="text-[10px] text-slate-500">Phán đoán chuẩn mực khảo thí AI</span>
                </div>
              </div>
              <span className="text-base font-black text-blue-700">
                {scoreState.game2.score} / 25 đ
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(scoreState.game2.score / 25) * 100}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 text-[11px]">
                TB Lớp: {stats ? stats.averageGame2 : 19}đ
              </span>
              <button
                onClick={() => onNavigate('game2_truefalse')}
                className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>{scoreState.game2.score === 25 ? 'Xem lại' : 'Làm lại để nâng điểm'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Game 3 */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Trò 3: Kéo Thả Ma Trận Đánh Giá
                  </h3>
                  <span className="text-[10px] text-slate-500">Phân loại cấp độ tích hợp AI</span>
                </div>
              </div>
              <span className="text-base font-black text-amber-700">
                {scoreState.game3.score} / 25 đ
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(scoreState.game3.score / 25) * 100}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 text-[11px]">
                TB Lớp: {stats ? stats.averageGame3 : 17}đ
              </span>
              <button
                onClick={() => onNavigate('game3_dragdrop')}
                className="text-amber-600 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>{scoreState.game3.score === 25 ? 'Xem lại' : 'Làm lại để nâng điểm'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Game 4 */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Trò 4: Trả Lời Nhanh 4 Đáp Án
                  </h3>
                  <span className="text-[10px] text-slate-500">Phản xạ nhận diện thuật ngữ</span>
                </div>
              </div>
              <span className="text-base font-black text-emerald-700">
                {scoreState.game4.score} / 25 đ
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(scoreState.game4.score / 25) * 100}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 text-[11px]">
                TB Lớp: {stats ? stats.averageGame4 : 18}đ
              </span>
              <button
                onClick={() => onNavigate('game4_speed')}
                className="text-emerald-600 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>{scoreState.game4.score === 25 ? 'Xem lại' : 'Làm lại để nâng điểm'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onNavigate('class_leaderboard')}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-200 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>Xem Toàn Bộ Bảng Thi Đua Cả Lớp</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('results_evaluation')}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Xem & In Giấy Chứng Nhận (PDF)</span>
          </button>

          <button
            onClick={() => onNavigate('game1_mcq')}
            className="px-4 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại bài thi</span>
          </button>
        </div>
      </div>

    </div>
  );
};
