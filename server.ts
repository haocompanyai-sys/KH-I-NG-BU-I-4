import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Initialize Gemini SDK with User-Agent header as required
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini features will return fallback/mock data if requested.");
    }
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

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Endpoint 1: Generate dynamic custom quiz questions
  app.post("/api/gemini/generate-custom-quiz", async (req, res) => {
    try {
      const { subject = "Toán & KHTN", difficulty = "Nâng cao (Phân tích / Đánh giá)" } = req.body;
      const ai = getAIClient();

      const prompt = `Bạn là chuyên gia hàng đầu về Đo lường & Đánh giá Giáo dục (Educational Assessment & Evaluation) kết hợp Công nghệ AI.
Hãy tạo 1 câu hỏi/thử thách trắc nghiệm TÌNH HUỐNG NÂNG CAO bằng Tiếng Việt về việc "Ứng dụng AI trong Kiểm tra & Đánh giá" cho môn: ${subject}, cấp độ: ${difficulty}.
Chủ đề liên quan đến: Phân hóa người học, Chống gian lận/sử dụng AI vô tội vạ, Thiết kế đề thi tích hợp AI, Đánh giá quá trình (Formative Assessment), Ma trận Rubric đa chiều, hoặc Phát hiện Ảo giác (Hallucination) / Thiên kiến (Bias) của AI.

Hãy trả về DUY NHẤT một JSON object có cấu trúc chính xác sau (không kèm markdown \`\`\`json):
{
  "id": "ai_gen_${Date.now()}",
  "topic": "${subject}",
  "type": "scenario",
  "difficulty": "${difficulty}",
  "title": "Tên tình huống ngắn gọn",
  "scenario": "Mô tả bối cảnh sư phạm chi tiết và thực tế (ví dụ: Thầy Nam muốn dùng ChatGPT để tạo 20 câu hỏi trắc nghiệm kèm ma trận nhận thức...)",
  "question": "Câu hỏi khảo nghiệm sâu sắc đặt ra cho giáo viên / chuyên gia khảo thí?",
  "options": [
    { "id": "A", "text": "Lựa chọn A...", "isCorrect": false, "rationale": "Giải thích tại sao chưa tối ưu..." },
    { "id": "B", "text": "Lựa chọn B...", "isCorrect": true, "rationale": "Giải thích chi tiết sư phạm tại sao đây là giải pháp chuẩn mực..." },
    { "id": "C", "text": "Lựa chọn C...", "isCorrect": false, "rationale": "Giải thích tại sao..." },
    { "id": "D", "text": "Lựa chọn D...", "isCorrect": false, "rationale": "Giải thích tại sao..." }
  ],
  "pedagogicalInsight": "Bài học cốt lõi & nguyên lý sư phạm cần ghi nhớ (2-3 câu đúc kết sâu sắc)",
  "bloomLevel": "Đánh giá (Evaluate) / Sáng tạo (Create)",
  "proTip": "Mẹo ứng dụng thực chiến trong giảng dạy và khảo thí"
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
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to generate AI quiz",
      });
    }
  });

  // Endpoint 2: Evaluate a Teacher's AI Prompt for Assessment
  app.post("/api/gemini/evaluate-prompt", async (req, res) => {
    try {
      const { userPrompt, targetObjective = "Tạo đề thi tự luận đánh giá tư duy phản biện" } = req.body;
      const ai = getAIClient();

      const evalPrompt = `Bạn là chuyên gia Khảo thí và Kỹ thuật Đặt câu lệnh AI (Prompt Engineering for Assessment).
Hãy đánh giá câu lệnh (Prompt) sau đây của một giáo viên khi dùng AI để thiết kế kiểm tra đánh giá:
Mục tiêu khảo thí: ${targetObjective}
Prompt của giáo viên: "${userPrompt}"

Hãy phân tích và trả về DUY NHẤT một JSON object (không kèm markdown):
{
  "score": 85,
  "verdict": "Khá tốt / Xuất sắc / Cần cải thiện",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Điểm yếu hoặc rủi ro (vd: thiếu bối cảnh, dễ bị ảo giác, thiếu tiêu chí phân hóa)"],
  "improvedPrompt": "Phiên bản Prompt nâng cấp chuẩn mực sư phạm (có role, context, rubric, constraints, zero-shot/few-shot)",
  "pedagogicalAdvice": "Lời khuyên sư phạm khi ứng dụng Prompt này trong thực tế lớp học"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: evalPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText.trim());
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Gemini prompt evaluation error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to evaluate prompt",
      });
    }
  });

  // Endpoint 3: AI Pedagogical Deep Explanation
  app.post("/api/gemini/explain-question", async (req, res) => {
    try {
      const { questionTitle, questionDetails, userAnswer, correctAnswer } = req.body;
      const ai = getAIClient();

      const explainPrompt = `Là chuyên gia Đo lường giáo dục & AI EdTech, hãy giải thích chi tiết và phân tích sâu sắc câu hỏi sau đây:
Câu hỏi: ${questionTitle}
Nội dung: ${questionDetails}
Người dùng chọn: ${userAnswer}
Đáp án chuẩn: ${correctAnswer}

Hãy trả về DUY NHẤT một JSON object:
{
  "summary": "Tóm tắt ngắn gọn bản chất vấn đề",
  "whyCorrect": "Lý giải tường tận góc nhìn đo lường đánh giá hiện đại",
  "commonMisconception": "Hiểu lầm phổ biến của giáo viên / người học khi làm dạng câu này",
  "futureTrend": "Xu hướng kiểm tra đánh giá tương lai cùng AI trong giáo dục 4.0",
  "actionableTakeaway": "1 hành động thực tế có thể áp dụng ngay ngày mai trong lớp học"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: explainPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse((response.text || "{}").trim());
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Gemini explain error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to explain",
      });
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
