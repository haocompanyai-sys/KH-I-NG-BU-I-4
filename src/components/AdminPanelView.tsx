import React, { useState, useEffect } from 'react';
import { StudentSubmission, LeaderboardStats, ActiveView } from '../types';
import { 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Plus, 
  Github, 
  RefreshCw, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet, 
  Download, 
  Lock, 
  Key, 
  Layers, 
  Users, 
  ExternalLink,
  Search,
  Check,
  HardDrive,
  FileText,
  FolderPlus,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { 
  initGoogleAuth, 
  googleSignIn, 
  googleLogout, 
  getGoogleAccessToken 
} from '../utils/googleAuth';
import { 
  findOrCreateFolder, 
  uploadFileToGoogleDrive, 
  listAppDriveFiles, 
  deleteDriveFile,
  DriveFileItem 
} from '../utils/googleDrive';
import { 
  createOrExportToGoogleSheet, 
  appendStudentToGoogleSheet 
} from '../utils/googleSheets';
import { User } from 'firebase/auth';

interface AdminPanelViewProps {
  onNavigate: (view: ActiveView) => void;
  isAdmin: boolean;
  onSetIsAdmin: (isAdmin: boolean) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  onNavigate,
  isAdmin,
  onSetIsAdmin,
}) => {
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Google Drive State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [driveLoading, setDriveLoading] = useState<boolean>(false);
  const [sheetLoading, setSheetLoading] = useState<boolean>(false);
  const [driveStatus, setDriveStatus] = useState<{ success?: boolean; message?: string; url?: string } | null>(null);

  // GitHub Config State
  const [ghOwner, setGhOwner] = useState<string>('');
  const [ghRepo, setGhRepo] = useState<string>('');
  const [ghBranch, setGhBranch] = useState<string>('main');
  const [ghFilePath, setGhFilePath] = useState<string>('data/results_buoi4_ai_assessment.json');
  const [ghToken, setGhToken] = useState<string>('');
  const [ghAutoSync, setGhAutoSync] = useState<boolean>(false);
  const [ghSyncStatus, setGhSyncStatus] = useState<{ success?: boolean; message?: string; url?: string } | null>(null);
  const [savingGhConfig, setSavingGhConfig] = useState<boolean>(false);
  const [syncingGh, setSyncingGh] = useState<boolean>(false);

  // Edit / Add Student Modal State
  const [editingStudent, setEditingStudent] = useState<StudentSubmission | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [formFullName, setFormFullName] = useState<string>('');
  const [formSchool, setFormSchool] = useState<string>('');
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formAvatar, setFormAvatar] = useState<string>('👨‍🏫');
  const [formGame1, setFormGame1] = useState<number>(0);
  const [formGame2, setFormGame2] = useState<number>(0);
  const [formGame3, setFormGame3] = useState<number>(0);
  const [formGame4, setFormGame4] = useState<number>(0);
  const [formTier, setFormTier] = useState<"Đạt" | "Chưa đạt" | "Đang thực hiện">('Đạt');

  // Confirmation Modals
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Init Google Auth listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setDriveToken(token);
        fetchDriveFiles(token);
      },
      () => {
        setGoogleUser(null);
        setDriveToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchDriveFiles = async (token: string) => {
    try {
      const folderId = await findOrCreateFolder(token, 'Khao_Thi_Su_Pham_So_Buoi_4');
      setDriveFolderId(folderId);
      const files = await listAppDriveFiles(token, folderId);
      setDriveFiles(files);
    } catch (err) {
      console.error('Fetch Drive files error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    soundManager.playClick();
    setDriveLoading(true);
    setDriveStatus(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setDriveToken(res.accessToken);
        await fetchDriveFiles(res.accessToken);
        soundManager.playCorrect();
        setDriveStatus({ success: true, message: `Đã kết nối tài khoản Google: ${res.user.email}` });
      }
    } catch (err: any) {
      soundManager.playWrong();
      setDriveStatus({ success: false, message: `Lỗi đăng nhập Google: ${err.message}` });
    } finally {
      setDriveLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    soundManager.playClick();
    await googleLogout();
    setGoogleUser(null);
    setDriveToken(null);
    setDriveFiles([]);
  };

  const handleSaveToGoogleDrive = async (type: 'json' | 'markdown') => {
    soundManager.playClick();
    if (!driveToken) {
      alert('Vui lòng kết nối tài khoản Google trước.');
      return;
    }

    setDriveLoading(true);
    setDriveStatus(null);

    try {
      const folderId = driveFolderId || (await findOrCreateFolder(driveToken, 'Khao_Thi_Su_Pham_So_Buoi_4'));
      setDriveFolderId(folderId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

      if (type === 'json') {
        const fileName = `Ket_Qua_Hoc_Vien_Buoi4_${timestamp}.json`;
        const content = JSON.stringify(submissions, null, 2);
        const uploaded = await uploadFileToGoogleDrive(driveToken, fileName, content, 'application/json', folderId);
        soundManager.playCorrect();
        setDriveStatus({
          success: true,
          message: `Đã lưu tệp JSON (${submissions.length} học viên) vào Google Drive thành công!`,
          url: uploaded.webViewLink,
        });
      } else {
        // Generate Markdown report
        const exportRes = await fetch('/api/submissions/export/github');
        const exportData = await exportRes.json();
        const fileName = `Bao_Cao_Khao_Thi_Buoi4_${timestamp}.md`;
        const uploaded = await uploadFileToGoogleDrive(driveToken, fileName, exportData.markdown || '', 'text/markdown', folderId);
        soundManager.playCorrect();
        setDriveStatus({
          success: true,
          message: `Đã lưu Báo cáo Khảo Thí Markdown vào Google Drive thành công!`,
          url: uploaded.webViewLink,
        });
      }

      const files = await listAppDriveFiles(driveToken, folderId);
      setDriveFiles(files);
    } catch (err: any) {
      soundManager.playWrong();
      setDriveStatus({ success: false, message: `Lỗi lưu Google Drive: ${err.message}` });
    } finally {
      setDriveLoading(false);
    }
  };

  const handleCreateGoogleSheet = async () => {
    soundManager.playClick();
    if (!driveToken) {
      alert('Vui lòng kết nối tài khoản Google trước để xuất Google Sheet.');
      return;
    }

    setSheetLoading(true);
    setDriveStatus(null);

    try {
      const result = await createOrExportToGoogleSheet(driveToken, submissions);
      soundManager.playCorrect();
      setDriveStatus({
        success: true,
        message: `Đã tạo Google Sheet "${result.title}" với ${submissions.length} học viên thành công!`,
        url: result.spreadsheetUrl,
      });

      const folderId = driveFolderId || (await findOrCreateFolder(driveToken, 'Khao_Thi_Su_Pham_So_Buoi_4'));
      setDriveFolderId(folderId);
      const files = await listAppDriveFiles(driveToken, folderId);
      setDriveFiles(files);
    } catch (err: any) {
      soundManager.playWrong();
      setDriveStatus({ success: false, message: `Lỗi tạo Google Sheet: ${err.message}` });
    } finally {
      setSheetLoading(false);
    }
  };

  const handleDeleteDriveFile = async (file: DriveFileItem) => {
    if (!driveToken) return;
    try {
      await deleteDriveFile(driveToken, file.id, file.name);
      if (driveFolderId) {
        const files = await listAppDriveFiles(driveToken, driveFolderId);
        setDriveFiles(files);
      }
      soundManager.playCorrect();
    } catch (err: any) {
      alert(`Lỗi xóa tệp: ${err.message}`);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSub, resStats, resGh] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/submissions/stats'),
        fetch('/api/github/config'),
      ]);

      if (resSub.ok) {
        const d = await resSub.json();
        if (d.success && Array.isArray(d.data)) setSubmissions(d.data);
      }
      if (resStats.ok) {
        const s = await resStats.json();
        setStats(s);
      }
      if (resGh.ok) {
        const g = await resGh.json();
        if (g.success && g.config) {
          setGhOwner(g.config.repoOwner || '');
          setGhRepo(g.config.repoName || '');
          setGhBranch(g.config.branch || 'main');
          setGhFilePath(g.config.filePath || 'data/results_buoi4_ai_assessment.json');
          setGhAutoSync(Boolean(g.config.autoSync));
          if (g.config.lastSyncedAt) {
            setGhSyncStatus({
              success: g.config.lastSyncStatus === 'success',
              message: `Đã đồng bộ gần nhất: ${new Date(g.config.lastSyncedAt).toLocaleString('vi-VN')}`,
            });
          }
        }
      }
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.success) {
        soundManager.playCorrect();
        onSetIsAdmin(true);
      } else {
        soundManager.playWrong();
        setLoginError(data.error || 'Mật khẩu quản trị viên không chính xác.');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối server.');
    }
  };

  const handleClearAllData = async () => {
    soundManager.playClick();
    try {
      const res = await fetch('/api/submissions', { method: 'DELETE' });
      if (res.ok) {
        setSubmissions([]);
        setShowClearAllConfirm(false);
        fetchData();
        soundManager.playCorrect();
      }
    } catch (err) {
      console.error('Clear all data error:', err);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    soundManager.playClick();
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTargetId(null);
        fetchData();
        soundManager.playCorrect();
      }
    } catch (err) {
      console.error('Delete single error:', err);
    }
  };

  const handleOpenEdit = (sub: StudentSubmission) => {
    soundManager.playClick();
    setEditingStudent(sub);
    setIsAddingNew(false);
    setFormFullName(sub.fullName);
    setFormSchool(sub.schoolOrOrg);
    setFormStudentId(sub.studentId);
    setFormAvatar(sub.avatar || '👨‍🏫');
    setFormGame1(sub.scores.game1);
    setFormGame2(sub.scores.game2);
    setFormGame3(sub.scores.game3);
    setFormGame4(sub.scores.game4);
    setFormTier(sub.tier);
  };

  const handleOpenAddNew = () => {
    soundManager.playClick();
    setEditingStudent(null);
    setIsAddingNew(true);
    setFormFullName('');
    setFormSchool('THPT Chuyên / ĐH Sư Phạm');
    setFormStudentId(`HV-${Date.now().toString().slice(-4)}`);
    setFormAvatar('👨‍🏫');
    setFormGame1(25);
    setFormGame2(25);
    setFormGame3(25);
    setFormGame4(25);
    setFormTier('Đạt');
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!formFullName.trim()) return;

    const payload = {
      studentId: formStudentId,
      fullName: formFullName,
      schoolOrOrg: formSchool,
      avatar: formAvatar,
      scores: {
        game1: Number(formGame1),
        game2: Number(formGame2),
        game3: Number(formGame3),
        game4: Number(formGame4),
      },
      completionStatus: {
        game1Completed: true,
        game2Completed: true,
        game3Completed: true,
        game4Completed: true,
        completedGamesCount: 4,
        percentage: 100,
      },
      tier: formTier,
    };

    try {
      if (isAddingNew) {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (editingStudent) {
        await fetch(`/api/submissions/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setEditingStudent(null);
      setIsAddingNew(false);
      fetchData();
      soundManager.playCorrect();
    } catch (err) {
      console.error('Save student error:', err);
    }
  };

  const handleSaveGitHubConfig = async () => {
    soundManager.playClick();
    setSavingGhConfig(true);
    try {
      const res = await fetch('/api/github/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner: ghOwner,
          repoName: ghRepo,
          branch: ghBranch,
          filePath: ghFilePath,
          githubToken: ghToken,
          autoSync: ghAutoSync,
        }),
      });
      if (res.ok) {
        soundManager.playCorrect();
        setGhSyncStatus({ success: true, message: 'Đã lưu cấu hình GitHub thành công!' });
      }
    } catch (err: any) {
      setGhSyncStatus({ success: false, message: `Lỗi: ${err.message}` });
    } finally {
      setSavingGhConfig(false);
    }
  };

  const handleSyncToGitHubNow = async () => {
    soundManager.playClick();
    setSyncingGh(true);
    setGhSyncStatus(null);
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner: ghOwner,
          repoName: ghRepo,
          branch: ghBranch,
          filePath: ghFilePath,
          githubToken: ghToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        soundManager.playCorrect();
        setGhSyncStatus({ success: true, message: data.message, url: data.url });
      } else {
        soundManager.playWrong();
        setGhSyncStatus({ success: false, message: data.message || 'Đồng bộ GitHub thất bại.' });
      }
    } catch (err: any) {
      setGhSyncStatus({ success: false, message: `Lỗi kết nối GitHub: ${err.message}` });
    } finally {
      setSyncingGh(false);
    }
  };

  const filtered = submissions.filter((s) => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.schoolOrOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If not logged in as Admin, show login card
  if (!isAdmin) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto py-12 px-4 animate-fadeIn">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-200">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">
              Đăng Nhập Quản Trị Viên (Admin)
            </h2>
            <p className="text-xs text-slate-500">
              Dành cho Giảng viên / Ban tổ chức điều chỉnh điểm, xóa data, và đồng bộ Google Drive / GitHub Online.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mật Khẩu Quản Trị:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              Mở Bảng Điều Khiển Admin
            </button>
          </form>

          <button
            onClick={() => onNavigate('class_leaderboard')}
            className="text-xs text-slate-500 hover:text-indigo-600 font-bold block mx-auto cursor-pointer"
          >
            &larr; Quay lại Bảng Thi Đua
          </button>
        </div>
      </div>
    );
  }

  // Logged-in Admin Control Suite
  return (
    <div id="admin-management-panel" className="max-w-6xl mx-auto px-2 sm:px-4 py-6 space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>KHÔNG GIAN QUẢN TRỊ VIÊN & GIẢNG VIÊN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Quản Trị Bảng Điểm, Google Drive & GitHub Online
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Tùy chỉnh điểm số, xóa data, thêm học viên và lưu trữ trực tuyến lên Google Drive & GitHub Repository.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onSetIsAdmin(false)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Đăng Xuất Admin
          </button>

          <button
            onClick={() => setShowClearAllConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-900/40 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Toàn Bộ Data ({submissions.length})</span>
          </button>
        </div>
      </div>

      {/* GOOGLE DRIVE INTEGRATION CARD */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Đồng Bộ Google Workspace (Sheets & Drive)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">Google Sheets & Drive</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tạo bảng tính Google Sheets trực tiếp, tự động tải file JSON & Báo cáo Khảo thí Markdown vào Google Drive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!googleUser ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={driveLoading || sheetLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{driveLoading || sheetLoading ? 'Đang kết nối...' : 'Đăng Nhập Google'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{googleUser.displayName || 'Tài khoản Google'}</div>
                  <div className="text-[10px] text-slate-500">{googleUser.email}</div>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  title="Đăng xuất Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Google Workspace Actions */}
        {googleUser && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCreateGoogleSheet}
                disabled={sheetLoading || driveLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-200 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className={`w-4 h-4 ${sheetLoading ? 'animate-spin' : ''}`} />
                <span>{sheetLoading ? 'Đang tạo Google Sheet...' : 'Tạo Bảng Điểm Google Sheets (Mới)'}</span>
              </button>

              <button
                onClick={() => handleSaveToGoogleDrive('json')}
                disabled={driveLoading || sheetLoading}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-amber-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Lưu Dữ Liệu JSON Lên Drive</span>
              </button>

              <button
                onClick={() => handleSaveToGoogleDrive('markdown')}
                disabled={driveLoading || sheetLoading}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>Lưu Báo Cáo Markdown Lên Drive</span>
              </button>

              <button
                onClick={() => driveToken && fetchDriveFiles(driveToken)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${driveLoading ? 'animate-spin' : ''}`} />
                <span>Làm mới tệp Drive</span>
              </button>
            </div>

            {/* Google Drive Status Notification */}
            {driveStatus && (
              <div className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 border ${
                driveStatus.success 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                <div className="flex items-center gap-2">
                  {driveStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                  <span>{driveStatus.message}</span>
                </div>
                {driveStatus.url && (
                  <a
                    href={driveStatus.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1 shrink-0 font-black"
                  >
                    <span>Mở trên Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* List of files in Google Drive */}
            {driveFiles.length > 0 && (
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>Các tệp đã lưu trong thư mục Google Drive (Khao_Thi_Su_Pham_So_Buoi_4):</span>
                  <span className="text-[10px] text-slate-500 font-normal">{driveFiles.length} tệp</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-bold text-slate-800 truncate">{file.name}</span>
                        {file.createdTime && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(file.createdTime).toLocaleTimeString('vi-VN')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="Xem trên Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteDriveFile(file)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Xóa tệp này khỏi Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GitHub Cloud Storage Settings Card */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Trỏ Dữ Liệu Về GitHub Lưu Trữ Trực Tuyến (GitHub Online Storage)
              </h3>
              <p className="text-xs text-slate-500">
                Tự động commit và cập nhật file JSON & Markdown bảng điểm lên GitHub Repository của bạn.
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncToGitHubNow}
            disabled={syncingGh}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingGh ? 'animate-spin' : ''}`} />
            <span>{syncingGh ? 'Đang đồng bộ...' : 'Đẩy Lên GitHub Ngay'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">GitHub Owner / Username:</label>
            <input
              type="text"
              value={ghOwner}
              onChange={(e) => setGhOwner(e.target.value)}
              placeholder="ví dụ: my-github-username"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">GitHub Repository Name:</label>
            <input
              type="text"
              value={ghRepo}
              onChange={(e) => setGhRepo(e.target.value)}
              placeholder="ví dụ: ai-assessment-course"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Branch & Đường dẫn File:</label>
            <input
              type="text"
              value={ghFilePath}
              onChange={(e) => setGhFilePath(e.target.value)}
              placeholder="data/results_buoi4_ai_assessment.json"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">GitHub Token (PAT - repo scope):</label>
            <input
              type="password"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={ghAutoSync}
              onChange={(e) => setGhAutoSync(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span>Tự động sync lên GitHub mỗi khi có học viên nộp bài / hoàn tất</span>
          </label>

          <button
            onClick={handleSaveGitHubConfig}
            disabled={savingGhConfig}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-indigo-600" />
            <span>{savingGhConfig ? 'Đang lưu...' : 'Lưu Cấu Hình GitHub'}</span>
          </button>
        </div>

        {ghSyncStatus && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 border ${
            ghSyncStatus.success 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {ghSyncStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
              <span>{ghSyncStatus.message}</span>
            </div>
            {ghSyncStatus.url && (
              <a
                href={ghSyncStatus.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Xem trên GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Student List Management */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">
              Danh Sách Học Viên Đang Có ({submissions.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddNew}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Học Viên Mới</span>
            </button>

            <button
              onClick={fetchData}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học viên, đơn vị, SBD..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4">Học Viên</th>
                  <th className="py-3 px-4">Đơn Vị</th>
                  <th className="py-3 px-2 text-center">T1</th>
                  <th className="py-3 px-2 text-center">T2</th>
                  <th className="py-3 px-2 text-center">T3</th>
                  <th className="py-3 px-2 text-center">T4</th>
                  <th className="py-3 px-3 text-center">Tổng Điểm</th>
                  <th className="py-3 px-3 text-center">Xếp Loại</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      Không có học viên nào trong hệ thống (Đã xóa sạch hoặc chưa có ai nộp bài).
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{s.avatar}</span>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{s.fullName}</span>
                            <span className="text-[10px] text-slate-400">SBD: {s.studentId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                        {s.schoolOrOrg}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-indigo-700">{s.scores.game1}</td>
                      <td className="py-3 px-2 text-center font-bold text-blue-700">{s.scores.game2}</td>
                      <td className="py-3 px-2 text-center font-bold text-amber-700">{s.scores.game3}</td>
                      <td className="py-3 px-2 text-center font-bold text-emerald-700">{s.scores.game4}</td>
                      <td className="py-3 px-3 text-center font-black text-indigo-600 text-sm">
                        {s.scores.totalScore}đ
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          s.scores.totalScore >= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all cursor-pointer"
                            title="Sửa điểm / thông tin"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteTargetId(s.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                            title="Xóa học viên này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: EDIT OR ADD STUDENT */}
      {(editingStudent || isAddingNew) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {isAddingNew ? 'Thêm Học Viên Thủ Công' : `Sửa Thông Tin & Điểm Số: ${editingStudent?.fullName}`}
              </h3>
              <button
                onClick={() => { setEditingStudent(null); setIsAddingNew(false); }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Họ và Tên:</label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đơn vị / Trường học:</label>
                  <input
                    type="text"
                    value={formSchool}
                    onChange={(e) => setFormSchool(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã SBD:</label>
                  <input
                    type="text"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Xếp loại:</label>
                  <select
                    value={formTier}
                    onChange={(e: any) => setFormTier(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Đạt">Đạt</option>
                    <option value="Chưa đạt">Chưa đạt</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-black text-slate-800 block">Điều Chỉnh Điểm 4 Trò Chơi (Tối đa 25đ/trò):</span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <label className="text-[10px] font-bold text-indigo-700 block">Trò 1 (MCQ)</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={formGame1}
                      onChange={(e) => setFormGame1(Number(e.target.value))}
                      className="w-full p-1.5 text-center bg-white border border-slate-300 rounded-lg font-black text-indigo-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-blue-700 block">Trò 2 (Đúng/Sai)</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={formGame2}
                      onChange={(e) => setFormGame2(Number(e.target.value))}
                      className="w-full p-1.5 text-center bg-white border border-slate-300 rounded-lg font-black text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-700 block">Trò 3 (Ma trận)</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={formGame3}
                      onChange={(e) => setFormGame3(Number(e.target.value))}
                      className="w-full p-1.5 text-center bg-white border border-slate-300 rounded-lg font-black text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 block">Trò 4 (Nhanh)</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={formGame4}
                      onChange={(e) => setFormGame4(Number(e.target.value))}
                      className="w-full p-1.5 text-center bg-white border border-slate-300 rounded-lg font-black text-emerald-700"
                    />
                  </div>
                </div>
                <div className="text-right pt-1 font-black text-indigo-900 text-xs">
                  Tổng điểm mới: {Number(formGame1) + Number(formGame2) + Number(formGame3) + Number(formGame4)} / 100đ
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setEditingStudent(null); setIsAddingNew(false); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-200"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: CLEAR ALL DATA */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Xác Nhận Xóa Toàn Bộ Dữ Liệu?
              </h3>
              <p className="text-xs text-slate-500">
                Hành động này sẽ xóa vĩnh viễn toàn bộ {submissions.length} bản ghi học viên khỏi hệ thống để bắt đầu lớp học mới.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleClearAllData}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-200"
              >
                Đồng Ý Xóa Sạch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE SINGLE STUDENT */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Xóa Học Viên Này?
              </h3>
              <p className="text-xs text-slate-500">
                Bản ghi của học viên sẽ bị gỡ bỏ khỏi bảng thi đua và dataset.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteSingle(deleteTargetId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black"
              >
                Xóa Ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
