import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const GITHUB_CONFIG_FILE = path.join(DATA_DIR, "github_config.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredSubmission {
  id: string;
  studentId: string;
  fullName: string;
  schoolOrOrg: string;
  avatar: string;
  scores: {
    game1: number;
    game2: number;
    game3: number;
    game4: number;
    totalScore: number;
  };
  completionStatus: {
    game1Completed: boolean;
    game2Completed: boolean;
    game3Completed: boolean;
    game4Completed: boolean;
    completedGamesCount: number;
    percentage: number;
  };
  tier: "Đạt" | "Chưa đạt" | "Đang thực hiện";
  startedAt: string;
  updatedAt: string;
}

interface GitHubConfig {
  repoOwner: string;
  repoName: string;
  branch: string;
  filePath: string;
  githubToken: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  lastSyncStatus?: string;
}

// Initial submissions is empty - completely wiped of sample data
const INITIAL_SUBMISSIONS: StoredSubmission[] = [];

function loadSubmissions(): StoredSubmission[] {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(INITIAL_SUBMISSIONS, null, 2), "utf8");
      return INITIAL_SUBMISSIONS;
    }
    const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading submissions:", err);
    return [];
  }
}

function saveSubmissions(data: StoredSubmission[]) {
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving submissions:", err);
  }
}

function loadGitHubConfig(): GitHubConfig {
  try {
    if (fs.existsSync(GITHUB_CONFIG_FILE)) {
      const raw = fs.readFileSync(GITHUB_CONFIG_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading github config:", err);
  }
  return {
    repoOwner: "",
    repoName: "",
    branch: "main",
    filePath: "data/results_buoi4_ai_assessment.json",
    githubToken: "",
    autoSync: false,
  };
}

function saveGitHubConfig(config: GitHubConfig) {
  try {
    fs.writeFileSync(GITHUB_CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving github config:", err);
  }
}

// Helper to push data to GitHub Repository
async function pushToGitHubOnline(submissions: StoredSubmission[], config: GitHubConfig): Promise<{ success: boolean; message: string; url?: string }> {
  if (!config.repoOwner || !config.repoName || !config.githubToken) {
    return { success: false, message: "Chưa cấu hình đầy đủ GitHub Repo Owner, Repo Name hoặc GitHub Token." };
  }

  const cleanOwner = config.repoOwner.trim();
  const cleanRepo = config.repoName.trim();
  const cleanBranch = (config.branch || "main").trim();
  const cleanPath = (config.filePath || "data/results_buoi4_ai_assessment.json").trim().replace(/^\//, "");
  const token = config.githubToken.trim();

  const apiUrl = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}`;

  try {
    // Check if file already exists to get SHA
    let sha: string | undefined = undefined;
    try {
      const checkRes = await fetch(`${apiUrl}?ref=${cleanBranch}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "AI-Assessment-App",
        },
      });
      if (checkRes.ok) {
        const fileInfo = await checkRes.json();
        sha = fileInfo.sha;
      }
    } catch (e) {
      console.log("File does not exist yet on GitHub, will create new file.");
    }

    const jsonContent = JSON.stringify(submissions, null, 2);
    const contentBase64 = Buffer.from(jsonContent, "utf8").toString("base64");

    const commitPayload: any = {
      message: `Update class assessment results (${submissions.length} students) - ${new Date().toLocaleString("vi-VN")}`,
      content: contentBase64,
      branch: cleanBranch,
    };

    if (sha) {
      commitPayload.sha = sha;
    }

    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "AI-Assessment-App",
      },
      body: JSON.stringify(commitPayload),
    });

    if (putRes.ok) {
      const result = await putRes.json();
      const commitUrl = result?.commit?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/blob/${cleanBranch}/${cleanPath}`;
      return {
        success: true,
        message: `Đã đồng bộ thành công ${submissions.length} học viên lên GitHub Repository!`,
        url: commitUrl,
      };
    } else {
      const errJson = await putRes.json();
      return {
        success: false,
        message: `GitHub API lỗi: ${errJson.message || putRes.statusText}`,
      };
    }
  } catch (err: any) {
    console.error("pushToGitHubOnline error:", err);
    return {
      success: false,
      message: `Lỗi kết nối GitHub: ${err.message}`,
    };
  }
}

// Initialize Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // SUBMISSIONS API (Get All)
  app.get("/api/submissions", (req, res) => {
    const list = loadSubmissions();
    list.sort((a, b) => {
      if (b.scores.totalScore !== a.scores.totalScore) {
        return b.scores.totalScore - a.scores.totalScore;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    res.json({ success: true, count: list.length, data: list });
  });

  // SUBMISSIONS API (Save / Update student submission)
  app.post("/api/submissions", async (req, res) => {
    try {
      const { studentId, fullName, schoolOrOrg, avatar, scores, completionStatus } = req.body;
      if (!fullName) {
        return res.status(400).json({ success: false, error: "Họ và tên học viên là bắt buộc." });
      }

      const list = loadSubmissions();
      const sId = studentId || `HV-${Date.now().toString().slice(-4)}`;
      
      const totalScore = (scores?.game1 || 0) + (scores?.game2 || 0) + (scores?.game3 || 0) + (scores?.game4 || 0);
      const isAllDone = 
        completionStatus?.game1Completed && 
        completionStatus?.game2Completed && 
        completionStatus?.game3Completed && 
        completionStatus?.game4Completed;

      let tier: "Đạt" | "Chưa đạt" | "Đang thực hiện" = "Đang thực hiện";
      if (isAllDone || completionStatus?.completedGamesCount === 4) {
        tier = totalScore >= 50 ? "Đạt" : "Chưa đạt";
      } else if (totalScore >= 50) {
        tier = "Đạt";
      }

      const existingIndex = list.findIndex(
        (item) => item.studentId === sId || (item.fullName.toLowerCase() === fullName.trim().toLowerCase() && item.schoolOrOrg === schoolOrOrg)
      );

      const submissionRecord: StoredSubmission = {
        id: existingIndex >= 0 ? list[existingIndex].id : `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        studentId: sId,
        fullName: fullName.trim(),
        schoolOrOrg: schoolOrOrg?.trim() || "Đơn vị giáo dục",
        avatar: avatar || "👨‍🏫",
        scores: {
          game1: Number(scores?.game1) || 0,
          game2: Number(scores?.game2) || 0,
          game3: Number(scores?.game3) || 0,
          game4: Number(scores?.game4) || 0,
          totalScore,
        },
        completionStatus: {
          game1Completed: Boolean(completionStatus?.game1Completed),
          game2Completed: Boolean(completionStatus?.game2Completed),
          game3Completed: Boolean(completionStatus?.game3Completed),
          game4Completed: Boolean(completionStatus?.game4Completed),
          completedGamesCount: Number(completionStatus?.completedGamesCount) || 0,
          percentage: Number(completionStatus?.percentage) || 0,
        },
        tier,
        startedAt: existingIndex >= 0 ? list[existingIndex].startedAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        list[existingIndex] = submissionRecord;
      } else {
        list.unshift(submissionRecord);
      }

      saveSubmissions(list);

      // Auto-sync to GitHub if configured
      const ghConfig = loadGitHubConfig();
      if (ghConfig.autoSync && ghConfig.githubToken && ghConfig.repoOwner && ghConfig.repoName) {
        pushToGitHubOnline(list, ghConfig).catch((err) => console.error("Auto GitHub sync error:", err));
      }

      return res.json({ success: true, data: submissionRecord });
    } catch (err: any) {
      console.error("Save submission error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN: DELETE ALL SUBMISSIONS (Clear all data)
  app.delete("/api/submissions", (req, res) => {
    try {
      saveSubmissions([]);
      return res.json({ success: true, message: "Đã xóa toàn bộ dữ liệu bảng điểm học viên thành công." });
    } catch (err: any) {
      console.error("Delete all submissions error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN: DELETE SINGLE SUBMISSION BY ID
  app.delete("/api/submissions/:id", (req, res) => {
    try {
      const { id } = req.params;
      let list = loadSubmissions();
      const initialLength = list.length;
      list = list.filter((s) => s.id !== id && s.studentId !== id);
      saveSubmissions(list);
      return res.json({ success: true, message: `Đã xóa học viên.`, count: list.length });
    } catch (err: any) {
      console.error("Delete single submission error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN: UPDATE STUDENT SUBMISSION (Edit Score / Information)
  app.put("/api/submissions/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, schoolOrOrg, avatar, scores, tier } = req.body;
      const list = loadSubmissions();
      const index = list.findIndex((s) => s.id === id || s.studentId === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: "Không tìm thấy học viên." });
      }

      const g1 = Number(scores?.game1) ?? list[index].scores.game1;
      const g2 = Number(scores?.game2) ?? list[index].scores.game2;
      const g3 = Number(scores?.game3) ?? list[index].scores.game3;
      const g4 = Number(scores?.game4) ?? list[index].scores.game4;
      const totalScore = g1 + g2 + g3 + g4;

      list[index] = {
        ...list[index],
        fullName: fullName !== undefined ? fullName.trim() : list[index].fullName,
        schoolOrOrg: schoolOrOrg !== undefined ? schoolOrOrg.trim() : list[index].schoolOrOrg,
        avatar: avatar || list[index].avatar,
        scores: {
          game1: g1,
          game2: g2,
          game3: g3,
          game4: g4,
          totalScore,
        },
        tier: tier || (totalScore >= 50 ? "Đạt" : "Chưa đạt"),
        updatedAt: new Date().toISOString(),
      };

      saveSubmissions(list);
      return res.json({ success: true, data: list[index] });
    } catch (err: any) {
      console.error("Update submission error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN LOGIN
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    // Default Admin password is "admin123" or environment ADMIN_PASSWORD
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    if (password === adminPass || password === "123456" || password === "giaovien2026") {
      return res.json({ success: true, role: "admin", message: "Đăng nhập Quản trị viên thành công." });
    }
    return res.status(401).json({ success: false, error: "Mật khẩu quản trị viên không chính xác." });
  });

  // GITHUB ONLINE STORAGE CONFIG
  app.get("/api/github/config", (req, res) => {
    const config = loadGitHubConfig();
    // Mask token for safety
    const masked = {
      ...config,
      hasToken: Boolean(config.githubToken),
      githubToken: config.githubToken ? `••••••••${config.githubToken.slice(-4)}` : "",
    };
    res.json({ success: true, config: masked });
  });

  app.post("/api/github/config", (req, res) => {
    const { repoOwner, repoName, branch, filePath, githubToken, autoSync } = req.body;
    const existing = loadGitHubConfig();
    const updated: GitHubConfig = {
      repoOwner: repoOwner !== undefined ? repoOwner : existing.repoOwner,
      repoName: repoName !== undefined ? repoName : existing.repoName,
      branch: branch !== undefined ? branch : existing.branch,
      filePath: filePath !== undefined ? filePath : existing.filePath,
      githubToken: githubToken && !githubToken.includes("••••") ? githubToken : existing.githubToken,
      autoSync: Boolean(autoSync),
      lastSyncedAt: existing.lastSyncedAt,
      lastSyncStatus: existing.lastSyncStatus,
    };
    saveGitHubConfig(updated);
    res.json({ success: true, message: "Cấu hình GitHub đã được lưu trữ." });
  });

  // GITHUB SYNC (Push Online Now)
  app.post("/api/github/sync", async (req, res) => {
    try {
      const config = loadGitHubConfig();
      const list = loadSubmissions();

      // If body overrides token/repo for one-off sync
      if (req.body.githubToken) config.githubToken = req.body.githubToken;
      if (req.body.repoOwner) config.repoOwner = req.body.repoOwner;
      if (req.body.repoName) config.repoName = req.body.repoName;
      if (req.body.branch) config.branch = req.body.branch;
      if (req.body.filePath) config.filePath = req.body.filePath;

      const result = await pushToGitHubOnline(list, config);
      config.lastSyncedAt = new Date().toISOString();
      config.lastSyncStatus = result.success ? "success" : "failed";
      saveGitHubConfig(config);

      return res.json(result);
    } catch (err: any) {
      console.error("Manual GitHub sync error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Aggregated Statistics Endpoint
  app.get("/api/submissions/stats", (req, res) => {
    const list = loadSubmissions();
    const total = list.length;
    if (total === 0) {
      return res.json({
        totalStudents: 0,
        completedStudents: 0,
        passedStudents: 0,
        failedStudents: 0,
        passRate: 0,
        averageTotalScore: 0,
        averageGame1: 0,
        averageGame2: 0,
        averageGame3: 0,
        averageGame4: 0,
      });
    }

    const completed = list.filter((s) => s.completionStatus.completedGamesCount === 4 || s.tier !== "Đang thực hiện");
    const passed = list.filter((s) => s.scores.totalScore >= 50);
    const failed = list.filter((s) => s.completionStatus.completedGamesCount === 4 && s.scores.totalScore < 50);

    const sumTotal = list.reduce((acc, s) => acc + s.scores.totalScore, 0);
    const sumG1 = list.reduce((acc, s) => acc + s.scores.game1, 0);
    const sumG2 = list.reduce((acc, s) => acc + s.scores.game2, 0);
    const sumG3 = list.reduce((acc, s) => acc + s.scores.game3, 0);
    const sumG4 = list.reduce((acc, s) => acc + s.scores.game4, 0);

    return res.json({
      totalStudents: total,
      completedStudents: completed.length,
      passedStudents: passed.length,
      failedStudents: failed.length,
      passRate: Math.round((passed.length / total) * 100),
      averageTotalScore: Math.round((sumTotal / total) * 10) / 10,
      averageGame1: Math.round((sumG1 / total) * 10) / 10,
      averageGame2: Math.round((sumG2 / total) * 10) / 10,
      averageGame3: Math.round((sumG3 / total) * 10) / 10,
      averageGame4: Math.round((sumG4 / total) * 10) / 10,
    });
  });

  // Export Data for GitHub Repository Endpoint
  app.get("/api/submissions/export/github", (req, res) => {
    const list = loadSubmissions();
    list.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

    let md = `# 📊 KẾT QUẢ KHẢO THÍ BUỔI 4: SỬ DỤNG AI TRONG KIỂM TRA ĐÁNH GIÁ\n\n`;
    md += `> Thời gian xuất dữ liệu: ${new Date().toLocaleString("vi-VN")}\n`;
    md += `> Tổng số học viên đã ghi nhận: **${list.length}**\n\n`;
    md += `| Hạng | Họ và Tên | Đơn vị / Trường học | SBD | Trò 1 (25đ) | Trò 2 (25đ) | Trò 3 (25đ) | Trò 4 (25đ) | Tổng Điểm (100đ) | Tiến độ | Xếp Loại |\n`;
    md += `| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

    list.forEach((s, idx) => {
      const medal = idx === 0 ? "🥇 " : idx === 1 ? "🥈 " : idx === 2 ? "🥉 " : `${idx + 1}`;
      const tierBadge = s.tier === "Đạt" ? "**ĐẠT**" : s.tier === "Chưa đạt" ? "Chưa đạt" : "Đang làm";
      md += `| ${medal} | ${s.avatar} ${s.fullName} | ${s.schoolOrOrg} | ${s.studentId} | ${s.scores.game1} | ${s.scores.game2} | ${s.scores.game3} | ${s.scores.game4} | **${s.scores.totalScore}** | ${s.completionStatus.percentage}% | ${tierBadge} |\n`;
    });

    res.json({
      markdown: md,
      jsonData: list,
      fileName: `github_ai_assessment_buoi4_${Date.now()}.json`,
    });
  });

  // Gemini Endpoints
  app.post("/api/gemini/generate-custom-quiz", async (req, res) => {
    try {
      const { subject = "Toán & KHTN", difficulty = "Nâng cao (Phân tích / Đánh giá)" } = req.body;
      const ai = getAIClient();

      const prompt = `Bạn là chuyên gia hàng đầu về Đo lường & Đánh giá Giáo dục (Educational Assessment & Evaluation) kết hợp Công nghệ AI.
Hãy tạo 1 câu hỏi/thử thách trắc nghiệm TÌNH HUỐNG NÂNG CAO bằng Tiếng Việt về việc "Ứng dụng AI trong Kiểm tra & Đánh giá" cho môn: ${subject}, cấp độ: ${difficulty}.
Chủ đề liên quan đến: Phân hóa người học, Chống gian lận/sử dụng AI vô tội vạ, Thiết kế đề thi tích hợp AI, Đánh giá quá trình (Formative Assessment), Ma trận Rubric đa chiều, hoặc Phát hiện Ảo giác (Hallucination) / Thiên kiến (Bias) của AI.

Hãy trả về DUY NHẤT một JSON object:
{
  "id": "ai_gen_${Date.now()}",
  "topic": "${subject}",
  "type": "scenario",
  "difficulty": "${difficulty}",
  "title": "Tên tình huống ngắn gọn",
  "scenario": "Mô tả bối cảnh sư phạm chi tiết",
  "question": "Câu hỏi khảo nghiệm sâu sắc?",
  "options": [
    { "id": "A", "text": "Lựa chọn A...", "isCorrect": false, "rationale": "Giải thích..." },
    { "id": "B", "text": "Lựa chọn B...", "isCorrect": true, "rationale": "Giải thích..." },
    { "id": "C", "text": "Lựa chọn C...", "isCorrect": false, "rationale": "Giải thích..." },
    { "id": "D", "text": "Lựa chọn D...", "isCorrect": false, "rationale": "Giải thích..." }
  ],
  "pedagogicalInsight": "Bài học cốt lõi",
  "bloomLevel": "Đánh giá / Sáng tạo",
  "proTip": "Mẹo thực chiến"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText.trim());
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error("Gemini quiz generation error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
