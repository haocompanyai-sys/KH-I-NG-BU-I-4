import React, { useState, useEffect } from 'react';
import { StudentSubmission, LeaderboardStats, StudentInfo } from '../types';
import { 
  Users, 
  Trophy, 
  Sparkles, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Github, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Layers, 
  Zap, 
  CheckSquare, 
  ToggleLeft,
  FileSpreadsheet,
  Crown,
  Medal,
  School,
  Flame,
  Star,
  Target,
  ShieldCheck,
  Building2,
  ChevronRight,
  RotateCcw,
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { googleSignIn, getGoogleAccessToken } from '../utils/googleAuth';
import { uploadFileToGoogleDrive, findOrCreateFolder } from '../utils/googleDrive';
import { createOrExportToGoogleSheet } from '../utils/googleSheets';

interface ClassLeaderboardViewProps {
  currentStudent: StudentInfo | null;
  onNavigateToStudent?: (student: StudentSubmission) => void;
  onNavigate?: (view: any) => void;
}

export const ClassLeaderboardView: React.FC<ClassLeaderboardViewProps> = ({
  currentStudent,
  onNavigate,
}) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dat' | 'chua_dat' | 'in_progress'>('all');
  const [activeTab, setActiveTab] = useState<'my_standing' | 'individual' | 'schools' | 'honors'>('my_standing');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);
  const [githubMarkdown, setGithubMarkdown] = useState<string>('');

  const fetchLeaderboard = async () => {
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
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Auto-refresh interval every 6 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    soundManager.playClick();
    setLoading(true);
    fetchLeaderboard();
  };

  const handleExportJson = () => {
    soundManager.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bang_thi_dua_buoi4_ai_assessment_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    soundManager.playClick();
    let csv = "\uFEFFXếp Hạng,Họ và tên,Đơn vị / Trường học,SBD,Trò 1 (25đ),Trò 2 (25đ),Trò 3 (25đ),Trò 4 (25đ),Tổng Điểm (100đ),Tiến độ %,Xếp loại,Thời gian cập nhật\n";
    submissions.forEach((s, idx) => {
      csv += `${idx + 1},"${s.fullName}","${s.schoolOrOrg}","${s.studentId}",${s.scores.game1},${s.scores.game2},${s.scores.game3},${s.scores.game4},${s.scores.totalScore},"${s.completionStatus.percentage}%","${s.tier}","${new Date(s.updatedAt).toLocaleString('vi-VN')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bang_thi_dua_khoi_dong_buoi4_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleOpenGithubExport = async () => {
    soundManager.playClick();
    try {
      const res = await fetch('/api/submissions/export/github');
      if (res.ok) {
        const data = await res.json();
        setGithubMarkdown(data.markdown);
        setShowGithubModal(true);
      }
    } catch (e) {
      console.error('Github export error:', e);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(githubMarkdown);
    setCopiedMd(true);
    soundManager.playClick();
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(submissions, null, 2));
    setCopiedJson(true);
    soundManager.playClick();
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Top 3 Podium
  const top1 = submissions.length > 0 ? submissions[0] : null;
  const top2 = submissions.length > 1 ? submissions[1] : null;
  const top3 = submissions.length > 2 ? submissions[2] : null;

  // Find current student standing
  const currentStudentIndex = submissions.findIndex(
    (s) => currentStudent && (
      s.studentId === currentStudent.studentId || 
      s.fullName.toLowerCase() === currentStudent.fullName.toLowerCase()
    )
  );
  const currentStudentSubmission = currentStudentIndex >= 0 ? submissions[currentStudentIndex] : null;

  // Group by School / Organization for school competition
  const schoolMap: Record<string, { totalStudents: number; passedStudents: number; totalScoreSum: number; highestScore: number }> = {};
  submissions.forEach((s) => {
    const school = s.schoolOrOrg || 'Khác';
    if (!schoolMap[school]) {
      schoolMap[school] = { totalStudents: 0, passedStudents: 0, totalScoreSum: 0, highestScore: 0 };
    }
    schoolMap[school].totalStudents += 1;
    if (s.scores.totalScore >= 50) schoolMap[school].passedStudents += 1;
    schoolMap[school].totalScoreSum += s.scores.totalScore;
    if (s.scores.totalScore > schoolMap[school].highestScore) {
      schoolMap[school].highestScore = s.scores.totalScore;
    }
  });

  const schoolRankings = Object.entries(schoolMap)
    .map(([schoolName, data]) => ({
      schoolName,
      totalStudents: data.totalStudents,
      passedStudents: data.passedStudents,
      passRate: Math.round((data.passedStudents / data.totalStudents) * 100),
      avgScore: Math.round((data.totalScoreSum / data.totalStudents) * 10) / 10,
      highestScore: data.highestScore
    }))
    .sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      return b.passedStudents - a.passedStudents;
    });

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchQuery = 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.schoolOrOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchQuery) return false;

    if (statusFilter === 'dat') return s.tier === 'Đạt' || s.scores.totalScore >= 50;
    if (statusFilter === 'chua_dat') return s.tier === 'Chưa đạt' || (s.completionStatus.completedGamesCount === 4 && s.scores.totalScore < 50);
    if (statusFilter === 'in_progress') return s.tier === 'Đang thực hiện' || s.completionStatus.completedGamesCount < 4;

    return true;
  });

  // Honors Lists
  const perfectScorers = submissions.filter((s) => s.scores.totalScore === 100);
  const highScorers = submissions.filter((s) => s.scores.totalScore >= 80 && s.scores.totalScore < 100);
  const speedMasters = submissions.filter((s) => s.scores.game4 === 25);
  const matrixMasters = submissions.filter((s) => s.scores.game3 === 25);

  const myTotal = currentStudentSubmission ? currentStudentSubmission.scores.totalScore : 0;
  const myRank = currentStudentIndex >= 0 ? currentStudentIndex + 1 : 1;
  const totalCount = Math.max(submissions.length, 1);
  const avgTotal = stats ? stats.averageTotalScore : 65;
  const diffVsAvg = Math.round((myTotal - avgTotal) * 10) / 10;
  const top1Score = top1 ? top1.scores.totalScore : 100;
  const diffToTop1 = Math.max(0, top1Score - myTotal);

  const [savingToDrive, setSavingToDrive] = useState<boolean>(false);
  const [exportingSheet, setExportingSheet] = useState<boolean>(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState<string | null>(null);

  const handleExportToGoogleSheet = async () => {
    soundManager.playClick();
    setExportingSheet(true);
    setDriveSaveSuccess(null);
    try {
      let token = await getGoogleAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (res) token = res.accessToken;
      }
      if (!token) throw new Error('Cần đăng nhập tài khoản Google.');

      const result = await createOrExportToGoogleSheet(token, submissions);
      soundManager.playCorrect();
      setDriveSaveSuccess(result.spreadsheetUrl);
    } catch (err: any) {
      soundManager.playWrong();
      alert(`Lỗi xuất Google Sheets: ${err.message}`);
    } finally {
      setExportingSheet(false);
    }
  };

  const handleSaveToDrive = async () => {
    soundManager.playClick();
    setSavingToDrive(true);
    setDriveSaveSuccess(null);
    try {
      let token = await getGoogleAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (res) token = res.accessToken;
      }
      if (!token) throw new Error('Cần đăng nhập tài khoản Google.');

      const folderId = await findOrCreateFolder(token, 'Khao_Thi_Su_Pham_So_Buoi_4');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `Bang_Thi_Dua_Buoi4_${timestamp}.json`;
      const uploaded = await uploadFileToGoogleDrive(token, fileName, JSON.stringify(submissions, null, 2), 'application/json', folderId);
      
      soundManager.playCorrect();
      setDriveSaveSuccess(uploaded.webViewLink || 'Đã lưu thành công lên Google Drive!');
    } catch (err: any) {
      soundManager.playWrong();
      alert(`Lỗi lưu Google Drive: ${err.message}`);
    } finally {
      setSavingToDrive(false);
    }
  };

  return (
    <div id="class-competition-board-root" className="max-w-6xl mx-auto px-2 sm:px-4 py-6 space-y-6 animate-fadeIn">
      
      {/* Top Main Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white border border-indigo-700/50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>BẢNG THI ĐUA HỌC TẬP KHẢO THÍ SƯ PHẠM SỐ</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1"></span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
              <span>Bảng Xếp Hạng & Thi Đua Toàn Khóa</span>
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Theo dõi bảng xếp hạng cá nhân của bạn, bục vinh quang Top 3 dẫn đầu, điểm số 4 trò chơi và thi đua theo từng đơn vị trường học.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                autoRefresh 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                  : 'bg-white/10 text-white/70 border-white/20'
              }`}
              title="Tự động cập nhật trực tiếp mỗi 6 giây"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Live: BẬT' : 'Live: TẮT'}</span>
            </button>

            <button
              onClick={handleManualRefresh}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>

            <button
              onClick={handleOpenGithubExport}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-900/50 transition-all hover:scale-102 cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>Xuất Data GitHub</span>
            </button>

            <button
              onClick={handleExportToGoogleSheet}
              disabled={exportingSheet}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Xuất bảng điểm trực tiếp thành Google Spreadsheet"
            >
              <FileSpreadsheet className={`w-4 h-4 ${exportingSheet ? 'animate-spin' : ''}`} />
              <span>{exportingSheet ? 'Đang tạo Sheet...' : 'Xuất Google Sheets'}</span>
            </button>

            <button
              onClick={handleSaveToDrive}
              disabled={savingToDrive}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Lưu bảng điểm trực tiếp vào Google Drive của bạn"
            >
              <HardDrive className={`w-4 h-4 ${savingToDrive ? 'animate-spin' : ''}`} />
              <span>{savingToDrive ? 'Đang lưu...' : 'Lưu Drive'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Tải bảng tính Excel CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('admin_panel')}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Mở Bảng Điều Khiển Quản Trị Viên (Xóa data, sửa điểm, GitHub sync)"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Quản Trị Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {driveSaveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {driveSaveSuccess.includes('spreadsheets')
                ? 'Đã tạo và xuất thành công Bảng Điểm lên Google Sheets trong Google Drive của bạn!'
                : 'Đã lưu thành công dữ liệu bảng thi đua vào Google Drive của bạn!'}
            </span>
          </div>
          {driveSaveSuccess.startsWith('http') && (
            <a
              href={driveSaveSuccess}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shrink-0 shadow-sm"
            >
              <span>{driveSaveSuccess.includes('spreadsheets') ? 'Mở Google Sheets' : 'Xem trên Google Drive'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* TOP 3 PODIUM (BỤC VINH QUANG THI ĐUA) */}
      {submissions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Bục Vinh Quang Thi Đua (Top 3 Dẫn Đầu)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
            {/* Top 2 - Á Quân (Silver) */}
            {top2 ? (
              <div className="order-2 md:order-1 bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-slate-300/80 rounded-3xl p-5 text-center space-y-3 shadow-sm hover:shadow-md transition-all relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <span>🥈 Á QUÂN #2</span>
                </div>
                <div className="text-4xl pt-2">{top2.avatar || '👩‍🏫'}</div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm truncate">{top2.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{top2.schoolOrOrg}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 space-y-0.5">
                  <div className="text-xl font-black text-slate-800">{top2.scores.totalScore} <span className="text-xs text-slate-400 font-bold">/100đ</span></div>
                  <div className="text-[10px] text-slate-500 font-semibold">T1:{top2.scores.game1} &bull; T2:{top2.scores.game2} &bull; T3:{top2.scores.game3} &bull; T4:{top2.scores.game4}</div>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ✓ Xếp loại: ĐẠT
                </span>
              </div>
            ) : (
              <div className="order-2 md:order-1 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-5 text-center text-xs text-slate-400">
                Đang chờ Á quân #2
              </div>
            )}

            {/* Top 1 - Quán Quân (Gold) */}
            {top1 ? (
              <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 via-amber-50/60 to-amber-100/70 border-2 border-amber-400 rounded-3xl p-6 text-center space-y-3.5 shadow-md hover:shadow-lg transition-all relative scale-100 md:-translate-y-2">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-300">
                  <Crown className="w-3.5 h-3.5 text-yellow-200" />
                  <span>🥇 QUÁN QUÂN #1</span>
                </div>
                <div className="text-5xl pt-3">{top1.avatar || '👨‍🏫'}</div>
                <div>
                  <div className="font-black text-slate-900 text-base truncate">{top1.fullName}</div>
                  <div className="text-xs text-amber-900 font-medium truncate">{top1.schoolOrOrg}</div>
                </div>
                <div className="bg-white border border-amber-300 rounded-2xl p-3 space-y-0.5 shadow-xs">
                  <div className="text-2xl font-black text-amber-600">{top1.scores.totalScore} <span className="text-xs text-slate-400 font-bold">/100đ</span></div>
                  <div className="text-[11px] text-amber-800 font-bold">T1:{top1.scores.game1} &bull; T2:{top1.scores.game2} &bull; T3:{top1.scores.game3} &bull; T4:{top1.scores.game4}</div>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-300">
                    🏆 Thủ Khoa Khảo Thí AI
                  </span>
                </div>
              </div>
            ) : null}

            {/* Top 3 - Quý Quân (Bronze) */}
            {top3 ? (
              <div className="order-3 md:order-3 bg-gradient-to-b from-orange-50/50 to-amber-50/80 border-2 border-amber-300/80 rounded-3xl p-5 text-center space-y-3 shadow-sm hover:shadow-md transition-all relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-800 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <span>🥉 QUÝ QUÂN #3</span>
                </div>
                <div className="text-4xl pt-2">{top3.avatar || '💡'}</div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm truncate">{top3.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{top3.schoolOrOrg}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 space-y-0.5">
                  <div className="text-xl font-black text-amber-800">{top3.scores.totalScore} <span className="text-xs text-slate-400 font-bold">/100đ</span></div>
                  <div className="text-[10px] text-slate-500 font-semibold">T1:{top3.scores.game1} &bull; T2:{top3.scores.game2} &bull; T3:{top3.scores.game3} &bull; T4:{top3.scores.game4}</div>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ✓ Xếp loại: ĐẠT
                </span>
              </div>
            ) : (
              <div className="order-3 md:order-3 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-5 text-center text-xs text-slate-400">
                Đang chờ Quý quân #3
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 Main Emulation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="tab-competition-my-standing"
          onClick={() => {
            soundManager.playClick();
            setActiveTab('my_standing');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'my_standing'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>⭐ Bảng Xếp Hạng Của Tôi</span>
        </button>

        <button
          id="tab-competition-individual"
          onClick={() => {
            soundManager.playClick();
            setActiveTab('individual');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'individual'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Bảng Xếp Hạng Cả Lớp ({submissions.length})</span>
        </button>

        <button
          id="tab-competition-schools"
          onClick={() => {
            soundManager.playClick();
            setActiveTab('schools');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'schools'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Thi Đua Theo Trường ({schoolRankings.length})</span>
        </button>

        <button
          id="tab-competition-honors"
          onClick={() => {
            soundManager.playClick();
            setActiveTab('honors');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'honors'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Bảng Vinh Danh Danh Hiệu</span>
        </button>
      </div>

      {/* TAB 0: MY STANDING & BREAKDOWN */}
      {activeTab === 'my_standing' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Hero My Profile Card */}
          <div className="bg-gradient-to-r from-indigo-50 via-white to-amber-50/60 border-2 border-indigo-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-md shadow-indigo-200 shrink-0">
                  {currentStudent?.avatar || '👨‍🏫'}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                    Vị Trí Thi Đua Của Bạn
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {currentStudent?.fullName || 'Học viên'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentStudent?.schoolOrOrg || 'Đơn vị giáo dục'} &bull; SBD: {currentStudent?.studentId || 'HV-2026'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-white border border-indigo-100 px-4 py-3 rounded-2xl text-center shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Thứ Hạng Toàn Khóa</span>
                  <span className="text-2xl font-black text-indigo-700 flex items-center justify-center gap-1">
                    {myRank <= 3 ? <Trophy className="w-5 h-5 text-amber-500" /> : null}
                    #{myRank} <span className="text-xs font-bold text-slate-400">/ {totalCount}</span>
                  </span>
                </div>

                <div className="bg-white border border-indigo-100 px-4 py-3 rounded-2xl text-center shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Điểm Của Bạn</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {myTotal} <span className="text-xs font-bold text-slate-400">/ 100đ</span>
                  </span>
                </div>

                <div className="bg-white border border-indigo-100 px-4 py-3 rounded-2xl text-center shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Xếp Loại</span>
                  <span className={`text-sm font-black block mt-1 ${myTotal >= 50 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {myTotal >= 50 ? '✓ ĐẠT' : '⏳ ĐANG LÀM'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-200/80 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">So với điểm trung bình lớp ({avgTotal}đ):</span>
                <span className={`text-sm font-black ${diffVsAvg >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {diffVsAvg >= 0 ? `+${diffVsAvg}đ (Vượt trội)` : `${diffVsAvg}đ (Dưới TB)`}
                </span>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Khoảng cách đến Top 1 ({top1Score}đ):</span>
                <span className="text-sm font-black text-amber-700">
                  {myRank === 1 ? '🥇 Bạn là Quán Quân #1' : `Cần +${diffToTop1}đ để vươn lên #1`}
                </span>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Điều kiện nhận Chứng nhận:</span>
                <span className={`text-sm font-black ${myTotal >= 50 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {myTotal >= 50 ? '✓ Đã đủ chuẩn hoàn thành' : `Cần thêm ${Math.max(0, 50 - myTotal)}đ`}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Games Detailed Cards */}
          {currentStudentSubmission && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Bảng Điểm Chi Tiết 4 Trò Chơi Của Bạn</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-indigo-50/60 border border-indigo-200 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Trò 1: Trắc Nghiệm</span>
                    <span className="font-black text-indigo-700 text-sm">{currentStudentSubmission.scores.game1} / 25đ</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(currentStudentSubmission.scores.game1 / 25) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">TB lớp: {stats ? stats.averageGame1 : 18}đ</span>
                </div>

                <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Trò 2: Đúng / Sai</span>
                    <span className="font-black text-blue-700 text-sm">{currentStudentSubmission.scores.game2} / 25đ</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(currentStudentSubmission.scores.game2 / 25) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">TB lớp: {stats ? stats.averageGame2 : 19}đ</span>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Trò 3: Kéo Thả Ma Trận</span>
                    <span className="font-black text-amber-700 text-sm">{currentStudentSubmission.scores.game3} / 25đ</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(currentStudentSubmission.scores.game3 / 25) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">TB lớp: {stats ? stats.averageGame3 : 17}đ</span>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Trò 4: Trả Lời Nhanh</span>
                    <span className="font-black text-emerald-700 text-sm">{currentStudentSubmission.scores.game4} / 25đ</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(currentStudentSubmission.scores.game4 / 25) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">TB lớp: {stats ? stats.averageGame4 : 18}đ</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: INDIVIDUAL LEADERBOARD */}
      {activeTab === 'individual' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm học viên theo tên, đơn vị trường học, SBD..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({submissions.length})
              </button>
              <button
                onClick={() => setStatusFilter('dat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'dat' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                ✓ Đạt ({submissions.filter((s) => s.scores.totalScore >= 50).length})
              </button>
              <button
                onClick={() => setStatusFilter('chua_dat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'chua_dat' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                ✗ Chưa đạt ({submissions.filter((s) => s.completionStatus.completedGamesCount === 4 && s.scores.totalScore < 50).length})
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'in_progress' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                ⏳ Đang làm ({submissions.filter((s) => s.completionStatus.completedGamesCount < 4).length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 text-center w-14">Hạng</th>
                    <th className="py-3.5 px-4">Học Viên</th>
                    <th className="py-3.5 px-4">Đơn Vị / Trường Học</th>
                    <th className="py-3.5 px-3 text-center">Trò 1 (25đ)</th>
                    <th className="py-3.5 px-3 text-center">Trò 2 (25đ)</th>
                    <th className="py-3.5 px-3 text-center">Trò 3 (25đ)</th>
                    <th className="py-3.5 px-3 text-center">Trò 4 (25đ)</th>
                    <th className="py-3.5 px-4 text-center">Tổng Điểm</th>
                    <th className="py-3.5 px-4 text-center">Tiến Độ</th>
                    <th className="py-3.5 px-4 text-center">Xếp Loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Không tìm thấy học viên nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub, index) => {
                      const isCurrent = currentStudent?.fullName.toLowerCase() === sub.fullName.toLowerCase();
                      const isTop1 = index === 0;
                      const isTop2 = index === 1;
                      const isTop3 = index === 2;

                      return (
                        <tr 
                          key={sub.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isCurrent ? 'bg-indigo-50/70 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center font-black">
                            {isTop1 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-sm shadow-xs">
                                🥇
                              </span>
                            ) : isTop2 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-sm shadow-xs">
                                🥈
                              </span>
                            ) : isTop3 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-700 text-sm shadow-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">#{index + 1}</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl shrink-0">{sub.avatar || '👨‍🏫'}</span>
                              <div className="overflow-hidden">
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
                                  <span>{sub.fullName}</span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded text-[9px] font-black uppercase">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  SBD: {sub.studentId}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                            {sub.schoolOrOrg}
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-indigo-700">
                            {sub.scores.game1} <span className="text-[10px] text-slate-300 font-normal">/25</span>
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-blue-700">
                            {sub.scores.game2} <span className="text-[10px] text-slate-300 font-normal">/25</span>
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-amber-700">
                            {sub.scores.game3} <span className="text-[10px] text-slate-300 font-normal">/25</span>
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-emerald-700">
                            {sub.scores.game4} <span className="text-[10px] text-slate-300 font-normal">/25</span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="text-sm font-black text-indigo-600 block">
                              {sub.scores.totalScore} <span className="text-[10px] text-slate-400 font-bold">/100</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="w-20 mx-auto space-y-1">
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    sub.completionStatus.percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${sub.completionStatus.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                {sub.completionStatus.completedGamesCount}/4 trò ({sub.completionStatus.percentage}%)
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${
                              sub.scores.totalScore >= 50
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : sub.completionStatus.completedGamesCount === 4
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              {sub.scores.totalScore >= 50 ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>ĐẠT</span>
                                </>
                              ) : sub.completionStatus.completedGamesCount === 4 ? (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>CHƯA ĐẠT</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>ĐANG LÀM</span>
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL / TEAM COMPETITION */}
      {activeTab === 'schools' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">
                Bảng Thi Đua Giữa Các Trường Học & Đơn Vị Giáo Dục
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schoolRankings.map((sc, index) => (
                <div 
                  key={sc.schoolName}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        index === 0 ? 'bg-amber-100 text-amber-800' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        #{index + 1}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                        {sc.schoolName}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white border border-slate-200 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block uppercase">Học Viên</span>
                      <span className="font-black text-slate-800">{sc.totalStudents}</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block uppercase">Tỷ Lệ Đạt</span>
                      <span className="font-black text-emerald-600">{sc.passRate}%</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block uppercase">Điểm TB</span>
                      <span className="font-black text-indigo-600">{sc.avgScore}đ</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between items-center pt-1 border-t border-slate-200">
                    <span>Điểm cao nhất: <strong>{sc.highestScore}đ</strong></span>
                    <span className="text-emerald-700 font-bold">{sc.passedStudents} học viên Đạt</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HONORS & BADGES */}
      {activeTab === 'honors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Perfect Scorers (100đ) */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-800 font-black text-base border-b border-amber-100 pb-3">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3>Bảng Vàng Thủ Khoa (Điểm 100/100 Tuyệt Đối)</h3>
            </div>
            {perfectScorers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có học viên nào đạt 100/100 điểm. Hãy là người đầu tiên!
              </div>
            ) : (
              <div className="space-y-2.5">
                {perfectScorers.map((s) => (
                  <div key={s.id} className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{s.avatar}</span>
                      <div>
                        <div className="font-black text-slate-900 text-xs">{s.fullName}</div>
                        <div className="text-[10px] text-slate-500">{s.schoolOrOrg}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black text-xs shadow-xs">
                      100 / 100 đ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Speed Masters (Trò 4 Max 25đ) */}
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-base border-b border-emerald-100 pb-3">
              <Zap className="w-5 h-5 text-emerald-500" />
              <h3>Chiến Binh Phản Xạ Thần Tốc (Trò 4: 25/25đ)</h3>
            </div>
            {speedMasters.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Đang cập nhật kết quả Trò 4...
              </div>
            ) : (
              <div className="space-y-2.5">
                {speedMasters.slice(0, 5).map((s) => (
                  <div key={s.id} className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{s.avatar}</span>
                      <div>
                        <div className="font-black text-slate-900 text-xs">{s.fullName}</div>
                        <div className="text-[10px] text-slate-500">{s.schoolOrOrg}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                      ⚡ Trò 4: 25đ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GitHub Export Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 text-white">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Xuất Dữ Liệu Bảng Thi Đua GitHub
                  </h3>
                  <span className="text-xs text-slate-500">
                    Định dạng Markdown Table & JSON Dataset chuẩn cấu trúc Git Repository
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowGithubModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Bảng Thi Đua Markdown (Dán vào README.md hoặc Wiki):
                </span>
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMd ? 'Đã sao chép!' : 'Sao chép Markdown'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={githubMarkdown}
                rows={8}
                className="w-full p-3 font-mono text-[11px] bg-slate-900 text-slate-200 rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Đã chép JSON' : 'Sao chép JSON'}</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải File .JSON</span>
                </button>
              </div>

              <button
                onClick={() => setShowGithubModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
