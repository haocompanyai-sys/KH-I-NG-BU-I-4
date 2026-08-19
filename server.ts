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

// Initial sample submissions representing a realistic class
const INITIAL_SUBMISSIONS: StoredSubmission[] = [
  {
    id: "sub_1",
    studentId: "HV-1024",
    fullName: "TS. Nguyễn Hoàng Nam",
    schoolOrOrg: "Đại học Sư phạm Hà Nội",
    avatar: "👨‍🏫",
    scores: { game1: 25, game2: 25, game3: 25, game4: 25, totalScore: 100 },
    completionStatus: {
      game1Completed: true,
      game2Completed: true,
      game3Completed: true,
      game4Completed: true,
      completedGamesCount: 4,
      percentage: 100,
    },
    tier: "Đạt",
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
  },
  {
    id: "sub_2",
    studentId: "HV-2088",
    fullName: "ThS. Lê Thị Bích Ngọc",
    schoolOrOrg: "THPT Chuyên Lê Hồng Phong TP.HCM",
    avatar: "👩‍🏫",
    scores: { game1: 25, game2: 20, game3: 25, game4: 25, totalScore: 95 },
    completionStatus: {
      game1Completed: true,
      game2Completed: true,
      game3Completed: true,
      game4Completed: true,
      completedGamesCount: 4,
      percentage: 100,
    },
    tier: "Đạt",
    startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: "sub_3",
    studentId: "HV-3312",
    fullName: "Thầy Trần Đình Khải",
    schoolOrOrg: "THPT Chuyên Hà Nội - Amsterdam",
    avatar: "💡",
    scores: { game1: 20, game2: 25, game3: 20, game4: 20, totalScore: 85 },
    completionStatus: {
      game1Completed: true,
      game2Completed: true,
      game3Completed: true,
      game4Completed: true,
      completedGamesCount: 4,
      percentage: 100,
    },
    tier: "Đạt",
    startedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
  },
  {
    id: "sub_4",
    studentId: "HV-4490",
    fullName: "Cô Phạm Thu Hà",
    schoolOrOrg: "Đại học Giáo dục - ĐHQGHN",
    avatar: "🎓",
    scores: { game1: 25, game2: 15, game3: 20, game4: 15, totalScore: 75 },
    completionStatus: {
      game1Completed: true,
      game2Completed: true,
      game3Completed: true,
      game4Completed: true,
      completedGamesCount: 4,
      percentage: 100,
    },
    tier: "Đạt",
    startedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3.7).toISOString(),
  },
  {
    id: "sub_5",
    studentId: "HV-5120",
    fullName: "Thầy Vũ Minh Tuấn",
    schoolOrOrg: "THCS & THPT Nguyễn Tất Thành",
    avatar: "🚀",
    scores: { game1: 20, game2: 20, game3: 0, game4: 0, totalScore: 40 },
    completionStatus: {
      game1Completed: true,
      game2Completed: true,
      game3Completed: false,
      game4Completed: false,
      completedGamesCount: 2,
      percentage: 50,
    },
    tier: "Đang thực hiện",
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
];

function loadSubmissions(): StoredSubmission[] {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(INITIAL_SUBMISSIONS, null, 2), "utf8");
      return INITIAL_SUBMISSIONS;
    }
    const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading submissions:", err);
    return INITIAL_SUBMISSIONS;
  }
}

function saveSubmissions(data: StoredSubmission[]) {
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving submissions:", err);
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

  // SUBMISSIONS API (Centralized Class Tracking & GitHub Sync)
  app.get("/api/submissions", (req, res) => {
    const list = loadSubmissions();
    // Sort by total score descending, then updated timestamp
    list.sort((a, b) => {
      if (b.scores.totalScore !== a.scores.totalScore) {
        return b.scores.totalScore - a.scores.totalScore;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    res.json({ success: true, count: list.length, data: list });
  });

  app.post("/api/submissions", (req, res) => {
    try {
      const { studentId, fullName, schoolOrOrg, avatar, scores, completionStatus } = req.body;
      if (!fullName) {
        return res.status(400).json({ success: false, error: "Họ và tên học viên là bắt buộc." });
      }

      const list = loadSubmissions();
      const sId = studentId || `HV-${fullName.trim().replace(/\s+/g, "").toLowerCase()}`;
      
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
      return res.json({ success: true, data: submissionRecord });
    } catch (err: any) {
      console.error("Save submission error:", err);
      return res.status(500).json({ success: false, error: err.message });
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
