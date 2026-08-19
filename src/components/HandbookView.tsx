import React, { useState } from 'react';
import { BookOpen, Layers, ShieldCheck, CheckCircle2, Award, Terminal } from 'lucide-react';
import { soundManager } from '../utils/sound';

export const HandbookView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'principles' | 'samr' | 'bloom' | 'ethics' | 'prompts'>('principles');

  const sections = [
    { id: 'principles', label: '10 Nguyên Tắc Vàng', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'samr', label: 'Mô Hình SAMR Khảo Thí', icon: <Layers className="w-4 h-4" /> },
    { id: 'bloom', label: 'Thang Bloom Kháng AI', icon: <Award className="w-4 h-4" /> },
    { id: 'ethics', label: 'Đạo Đức & Liêm Chính (UNESCO)', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'prompts', label: 'Công Thức Prompt Khảo Thí', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <div id="handbook-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              CẨM NANG KHẢO THÍ & ĐÁNH GIÁ THỜI ĐẠI AI
            </h2>
            <p className="text-xs text-slate-500">
              Tổng hợp cơ sở lý luận, mô hình chuẩn quốc tế và hướng dẫn thực hành sư phạm cho giáo viên, cán bộ quản lý giáo dục.
            </p>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
          {sections.map((sec) => (
            <button
              key={sec.id}
              id={`btn-handbook-${sec.id}`}
              onClick={() => {
                soundManager.playClick();
                setActiveSection(sec.id as any);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSection === sec.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
        {activeSection === 'principles' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-indigo-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              10 Nguyên Tắc Vàng Kiểm Tra Đánh Giá Thời Đại AI
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-700 text-xs">1. Chuyển dịch từ Nhớ sang Đánh giá</span>
                <p className="text-slate-600 text-xs">Giảm tải câu hỏi định nghĩa thuần túy, tăng câu hỏi thẩm định dữ liệu đa nguồn và phản biện.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-700 text-xs">2. Đánh giá Quá trình quan trọng hơn Tổng kết</span>
                <p className="text-slate-600 text-xs">Theo dõi tiến trình sửa đổi bài (version history), nhật ký ra lệnh và siêu nhận thức.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-700 text-xs">3. Human-in-the-loop (Con người là trung tâm)</span>
                <p className="text-slate-600 text-xs">Không bao giờ để AI tự động chấm điểm bài tự luận/luận án mà không có sự thẩm định của giáo viên.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-700 text-xs">4. Đánh giá Thực chất (Authentic Assessment)</span>
                <p className="text-slate-600 text-xs">Giao bài tập gắn liền với bối cảnh địa phương, dữ liệu thực tế đời sống mà AI không thể suy luận sẵn.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-700 text-xs">5. Không phụ thuộc vào AI Detector</span>
                <p className="text-slate-600 text-xs">Tỷ lệ báo động giả (False Positive) rất cao, không được dùng làm căn cứ kỷ luật đơn phương.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-700 text-xs">6. Vấn đáp bảo vệ trực tiếp (Oral Defense)</span>
                <p className="text-slate-600 text-xs">Dành 2-3 phút phỏng vấn nhanh về cấu trúc bài làm để kiểm tra người học có thực sự hiểu bài hay không.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'samr' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-indigo-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Mô Hình SAMR Ứng Dụng Trong Đổi Mới Khảo Thí
            </h3>

            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <div className="font-black text-indigo-800 text-sm mb-1">
                  1. Tái Định Nghĩa (Redefinition) - Đỉnh cao đổi mới
                </div>
                <p className="text-xs text-indigo-950">
                  Học sinh đồng hành cùng AI giải quyết các bài toán liên ngành thực tế, tạo ra sản phẩm tương tác đa phương thức và bảo vệ giải pháp trước hội đồng cộng đồng.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="font-black text-blue-800 text-sm mb-1">
                  2. Biến Đổi (Modification) - Tái cấu trúc nhiệm vụ
                </div>
                <p className="text-xs text-blue-950">
                  Học sinh sử dụng AI để mô phỏng các kịch bản phản biện đối kháng, kiểm thử tính logic của bài luận từ nhiều góc nhìn học thuật trái chiều.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="font-black text-emerald-800 text-sm mb-1">
                  3. Gia Tăng (Augmentation) - Cải tiến hiệu quả
                </div>
                <p className="text-xs text-emerald-950">
                  Dùng AI hỗ trợ tra cứu tài liệu nhanh, tóm tắt dữ liệu thô và nhận phản hồi ngữ pháp tức thì nhưng cấu trúc bài tập vẫn giữ nguyên.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 opacity-80">
                <div className="font-black text-slate-800 text-sm mb-1">
                  4. Thay Thế (Substitution) - Mức cơ bản
                </div>
                <p className="text-xs text-slate-600">
                  Chỉ dùng AI gõ đề thi hoặc chuyển bài thi giấy sang form trắc nghiệm trực tuyến mà không thay đổi bản chất câu hỏi.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'bloom' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-indigo-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Thang Bloom Kháng AI (AI-Resistant Bloom Taxonomy)
            </h3>

            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="font-bold text-emerald-800 block mb-1">Bậc Sáng tạo & Kiến tạo:</span>
                <p className="text-xs text-emerald-950">Động từ hành động: "Thiết kế giải pháp bản địa", "Đồng sáng tạo kịch bản thí nghiệm mới", "Phát triển mô hình tối ưu".</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <span className="font-bold text-blue-800 block mb-1">Bậc Đánh giá & Thẩm định:</span>
                <p className="text-xs text-blue-950">Động từ hành động: "Vạch trần thiên kiến", "Phản biện lỗ hổng lập luận của AI", "So sánh độ tin cậy giữa 2 nguồn tài liệu".</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                <span className="font-bold text-purple-800 block mb-1">Bậc Phân tích:</span>
                <p className="text-xs text-purple-950">Động từ hành động: "Giải mã cấu trúc nguyên nhân - hệ quả", "Phân loại dữ liệu thực chứng", "Nhận diện giả định ngầm".</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'ethics' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-indigo-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Khung Đạo Đức & Liêm Chính Học Thuật (UNESCO)
            </h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-indigo-900 block">Quy tắc 3 Không:</span>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                <li><strong>Không định tội dựa trên 1 công cụ phần mềm:</strong> Tuyệt đối không dùng AI Detector làm cơ sở duy nhất phạt học sinh.</li>
                <li><strong>Không chia sẻ dữ liệu riêng tư:</strong> Không đưa bài làm chứa thông tin danh tính, học bạ, đời tư học sinh lên các công cụ AI công cộng.</li>
                <li><strong>Không triệt tiêu quyền tự chủ của giáo viên:</strong> Trí tuệ nhân tạo chỉ phục vụ và hỗ trợ, nhà giáo giữ trách nhiệm chuyên môn tối cao.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'prompts' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-indigo-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              Công Thức C-R-A-F-T Tạo Prompt Khảo Thí Chuẩn Mực
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="text-indigo-700">C - Context (Bối cảnh):</strong> Chương trình lớp mấy? Mục tiêu bài học gì theo CT GDPT 2018?
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="text-indigo-700">R - Role (Vai trò):</strong> Đóng vai Chuyên gia Khảo thí và Đánh giá Năng lực học sinh.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="text-indigo-700">A - Action (Hành động & Ma trận):</strong> Thiết kế câu hỏi trắc nghiệm tình huống phân bậc Bloom.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="text-indigo-700">F - Format (Định dạng đầu ra):</strong> Kèm bảng đáp án, phân tích lý do phương án nhiễu sai bản chất.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="text-indigo-700">T - Target / Constraints (Ràng buộc chống ảo giác):</strong> Không đố mẹo, số liệu bám sát thực tế Việt Nam.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
