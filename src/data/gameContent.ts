import { MCQQuestion, TrueFalseQuestion, DragDropItem, DragDropZone, SpeedQuestion } from '../types';

// GAME 1: Trắc nghiệm khách quan nhiều lựa chọn (5 câu x 5 điểm = 25 điểm) - Mỗi câu 4 đáp án A, B, C, D
export const GAME1_MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: 'mcq_1',
    title: 'Câu 1: Thiết kế đề kiểm tra hạn chế việc lạm dụng AI',
    scenario: 'Để đánh giá năng lực tư duy của học sinh trong bối cảnh các công cụ AI tạo sinh phổ biến, cách tiếp cận nào dưới đây là phù hợp nhất?',
    bloomLevel: 'Phân tích & Đánh giá',
    points: 5,
    options: [
      {
        id: 'A',
        text: 'Yêu cầu học sinh so sánh và phản biện dữ liệu từ 2 nguồn do AI cung cấp kết hợp dẫn chứng thực tế.',
        isCorrect: true,
        explanation: 'Buộc người học chuyển từ tái hiện thông tin sang thẩm định và lập luận dựa trên bằng chứng.'
      },
      {
        id: 'B',
        text: 'Tăng cường các câu hỏi yêu cầu định nghĩa và ghi nhớ chính xác mốc thời gian, công thức trong giáo trình.',
        isCorrect: false,
        explanation: 'Đây là dạng câu hỏi AI giải quyết nhanh và chính xác nhất, không đo lường được năng lực tư duy.'
      },
      {
        id: 'C',
        text: 'Cấm hoàn toàn việc dùng thiết bị số và chỉ kiểm tra bài làm viết tay với dung lượng từ quy định tối thiểu.',
        isCorrect: false,
        explanation: 'Không kiểm soát được quá trình chuẩn bị trước đó và không phát triển năng lực ứng dụng công nghệ.'
      },
      {
        id: 'D',
        text: 'Cho phép sử dụng tự do mọi công cụ AI nhưng chấm điểm hoàn toàn dựa trên sự chuẩn mực về ngữ pháp.',
        isCorrect: false,
        explanation: 'Văn bản do AI sinh ra vốn đã có ngữ pháp hoàn chỉnh, không phản ánh năng lực thực chất của học sinh.'
      }
    ],
    pedagogicalInsight: 'Chuyển trọng tâm đánh giá từ "Tái hiện tri thức tĩnh" sang "Năng lực thẩm định, phản biện và bản địa hóa dữ liệu".'
  },
  {
    id: 'mcq_2',
    title: 'Câu 2: Vai trò của giáo viên khi sử dụng AI để tạo đề kiểm tra',
    scenario: 'Khi sử dụng các mô hình AI để hỗ trợ xây dựng ngân hàng câu hỏi trắc nghiệm, nguyên tắc chuyên môn nào là bắt buộc?',
    bloomLevel: 'Đánh giá chuyên môn',
    points: 5,
    options: [
      {
        id: 'A',
        text: 'Ủy quyền cho AI tự động sinh ma trận và tải trực tiếp câu hỏi lên hệ thống khảo thí trực tuyến.',
        isCorrect: false,
        explanation: 'Vi phạm chuẩn mực khảo thí vì AI có thể đưa vào câu hỏi lỗi logic hoặc sai lệch kiến thức chuẩn.'
      },
      {
        id: 'B',
        text: 'Thực hiện quy trình Human-in-the-loop: giáo viên tự giải độc lập, thẩm định tính khoa học và phương án nhiễu.',
        isCorrect: true,
        explanation: 'Giáo viên luôn là người chịu trách nhiệm chuyên môn cao nhất đối với tính chính xác của đề thi.'
      },
      {
        id: 'C',
        text: 'Chỉ sử dụng câu hỏi AI tạo ra cho các bài thi cuối kỳ nhằm đảm bảo tính bảo mật và khách quan.',
        isCorrect: false,
        explanation: 'Đề thi tổng kết quan trọng càng đòi hỏi quy trình thẩm định nghiêm ngặt từ hội đồng chuyên môn.'
      },
      {
        id: 'D',
        text: 'Yêu cầu chính công cụ AI đó kiểm tra lại độ chính xác của đề bài để tiết kiệm thời gian phản biện.',
        isCorrect: false,
        explanation: 'AI có xu hướng lặp lại và củng cố ảo giác của chính nó (Confirmation bias) nếu không có sự can thiệp của con người.'
      }
    ],
    pedagogicalInsight: 'Cơ chế Human-in-the-loop: Trí tuệ nhân tạo chỉ đóng vai trò trợ lý gợi ý, Nhà giáo giữ quyền quyết định chuyên môn cuối cùng.'
  },
  {
    id: 'mcq_3',
    title: 'Câu 3: Đánh giá quá trình (Formative Assessment) với phản hồi AI',
    scenario: 'Mục tiêu tối ưu khi ứng dụng chatbot AI để hỗ trợ phản hồi bài viết cho học sinh trong quá trình học tập là gì?',
    bloomLevel: 'Vận dụng sư phạm',
    points: 5,
    options: [
      {
        id: 'A',
        text: 'Tự động sửa toàn bộ lỗi diễn đạt và xuất bản bài viết hoàn chỉnh mẫu để học sinh sao chép lại.',
        isCorrect: false,
        explanation: 'Triệt tiêu quá trình tự học và tư duy sửa lỗi độc lập của học sinh.'
      },
      {
        id: 'B',
        text: 'Đưa ra điểm số ngay lập tức kèm theo lời nhận xét chung để hoàn thành việc xếp hạng người học.',
        isCorrect: false,
        explanation: 'Đánh giá quá trình cần phản hồi chi tiết có thể hành động, không dừng lại ở việc chấm điểm số đơn thuần.'
      },
      {
        id: 'C',
        text: 'Đưa ra các câu hỏi gợi mở, chỉ rõ điểm chưa logic để học sinh tự phản tư và chỉnh sửa bản thảo.',
        isCorrect: true,
        explanation: 'Kích hoạt tư duy siêu nhận thức (Metacognition) và năng lực tự hoàn thiện bài làm của học sinh.'
      },
      {
        id: 'D',
        text: 'Lập danh sách các học sinh có nhiều lỗi sai nhất để gửi thông báo tự động cho phụ huynh.',
        isCorrect: false,
        explanation: 'Không mang lại giá trị phát triển học thuật trực tiếp cho bản thân người học trong quá trình rèn luyện.'
      }
    ],
    pedagogicalInsight: 'Phản hồi sư phạm hiệu quả là cung cấp "bậc thang nhận thức" để học sinh tự nâng cao chất lượng bài làm.'
  },
  {
    id: 'mcq_4',
    title: 'Câu 4: Xây dựng tiêu chí đánh giá sản phẩm có ứng dụng AI',
    scenario: 'Khi học sinh được phép sử dụng AI trong bài tập dự án nhóm, tiêu chí nào thể hiện rõ nhất mức độ năng lực cao?',
    bloomLevel: 'Đánh giá năng lực',
    points: 5,
    options: [
      {
        id: 'A',
        text: 'Số lượng câu lệnh Prompt mà nhóm đã sử dụng và độ dài của các câu trả lời do AI cung cấp.',
        isCorrect: false,
        explanation: 'Số lượng câu lệnh không phản ánh chất lượng giải quyết vấn đề và năng lực chuyên môn.'
      },
      {
        id: 'B',
        text: 'Khả năng tinh chỉnh, kiểm chứng thông tin của AI và bảo vệ trực tiếp tính khả thi của giải pháp.',
        isCorrect: true,
        explanation: 'Chứng minh học sinh làm chủ công nghệ, hiểu rõ dữ liệu và có tư duy phản biện thực chứng.'
      },
      {
        id: 'C',
        text: 'Độ đẹp mắt của slide thuyết trình và hình ảnh minh họa được sinh ra hoàn toàn từ công cụ AI.',
        isCorrect: false,
        explanation: 'Hình thức thẩm mỹ không thay thế được chiều sâu lập luận và tính đúng đắn của giải pháp.'
      },
      {
        id: 'D',
        text: 'Tỷ lệ % văn bản không bị các phần mềm kiểm tra văn phong AI cảnh báo trên hệ thống.',
        isCorrect: false,
        explanation: 'Không phải là tiêu chí đo lường mục tiêu học tập và năng lực đầu ra của chương trình giáo dục.'
      }
    ],
    pedagogicalInsight: 'Đánh giá năng lực sử dụng AI tập trung vào: "Năng lực chọn lọc, điều hướng công nghệ và trách nhiệm giải trình giải pháp".'
  },
  {
    id: 'mcq_5',
    title: 'Câu 5: Ứng xử với kết quả từ phần mềm phát hiện AI (AI Detector)',
    scenario: 'Khi một bài tập của học sinh bị phần mềm AI Detector đánh dấu có tỷ lệ nghi vấn cao, quy trình xử lý đúng đắn là gì?',
    bloomLevel: 'Đạo đức & Đánh giá',
    points: 5,
    options: [
      {
        id: 'A',
        text: 'Tự động cho điểm 0 và ghi nhận vi phạm liêm chính học thuật dựa trên kết quả của phần mềm.',
        isCorrect: false,
        explanation: 'AI Detector có tỷ lệ báo động giả (False Positive) rất cao, không được dùng làm chứng cứ kết tội đơn phương.'
      },
      {
        id: 'B',
        text: 'Đối thoại trực tiếp với học sinh, kết hợp kiểm tra lịch sử chỉnh sửa bản thảo và phỏng vấn kiến thức.',
        isCorrect: true,
        explanation: 'Đảm bảo tính công bằng, tôn trọng quyền giải trình của người học và thu thập đa nguồn chứng cứ sư phạm.'
      },
      {
        id: 'C',
        text: 'Quét bài làm qua nhiều phần mềm AI Detector khác nhau và lấy kết quả trung bình cộng để xử lý.',
        isCorrect: false,
        explanation: 'Nguyên lý dự đoán xác suất của các phần mềm đều tương tự nhau và vẫn chứa sai số thống kê.'
      },
      {
        id: 'D',
        text: 'Bỏ qua hoàn toàn và chấm điểm bài làm bình thường mà không cần có bất kỳ sự trao đổi nào.',
        isCorrect: false,
        explanation: 'Bỏ qua việc trao đổi làm mất cơ hội giáo dục về liêm chính học thuật và hiểu rõ quá trình làm bài của học sinh.'
      }
    ],
    pedagogicalInsight: 'Nguyên tắc UNESCO: Công nghệ chỉ mang tính tham khảo, quyết định sư phạm phải dựa trên con người và đa nguồn minh chứng.'
  }
];

// GAME 2: Trắc nghiệm Đúng / Sai (5 câu x 5 điểm = 25 điểm)
export const GAME2_TRUEFALSE_QUESTIONS: TrueFalseQuestion[] = [
  {
    id: 'tf_1',
    statement: 'Phần mềm phát hiện AI (AI Detector) có độ chính xác tuyệt đối và đủ căn cứ pháp lý duy nhất để kết luận học sinh gian lận.',
    context: 'Liêm chính học thuật',
    isTrue: false,
    points: 5,
    explanation: 'SAI. Các nghiên cứu quốc tế chỉ ra rằng AI Detector có tỷ lệ báo động giả (False Positive) cao, đặc biệt với các bài viết tiếng Anh học thuật chuẩn tắc.',
    keyRule: 'Nguyên tắc: Không bao giờ dùng AI Detector làm căn cứ kỷ luật đơn phương.'
  },
  {
    id: 'tf_2',
    statement: 'Theo dõi lịch sử chỉnh sửa bản thảo (Version History) và nhật ký câu lệnh AI là minh chứng đánh giá quá trình đáng tin cậy.',
    context: 'Phương pháp khảo thí',
    isTrue: true,
    points: 5,
    explanation: 'ĐÚNG. Đánh giá quá trình ghi nhận toàn bộ chuỗi tư duy, thử - sai và chọn lọc của người học theo thời gian thực.',
    keyRule: 'Nguyên tắc: Đánh giá tiến trình học tập có giá trị sư phạm vượt trội so với chỉ chấm bài nộp cuối cùng.'
  },
  {
    id: 'tf_3',
    statement: 'Khi dùng AI tạo câu hỏi trắc nghiệm tính toán hoặc dữ kiện lịch sử, giáo viên có thể sử dụng ngay mà không cần kiểm chứng lại.',
    context: 'Quản trị ảo giác AI',
    isTrue: false,
    points: 5,
    explanation: 'SAI. Mô hình ngôn ngữ lớn (LLM) hoạt động dựa trên xác suất từ ngữ, dễ sinh ra ảo giác tính toán sai hoặc bịa đặt số liệu.',
    keyRule: 'Nguyên tắc Human-in-the-loop: Luôn kiểm tra, giải độc lập và thẩm định trước khi ban hành đề thi.'
  },
  {
    id: 'tf_4',
    statement: 'Theo khung SAMR, mức "Tái định nghĩa" (Redefinition) là khi AI giúp tạo ra các nhiệm vụ đánh giá gắn với thực tiễn mà trước đây chưa thể thực hiện.',
    context: 'Khung SAMR khảo thí',
    isTrue: true,
    points: 5,
    explanation: 'ĐÚNG. Tái định nghĩa là mức cao nhất của SAMR, cho phép học sinh đồng hành cùng AI giải quyết các vấn đề phức hợp trong đời sống.',
    keyRule: 'Nguyên tắc SAMR: Tận dụng AI để kiến tạo dạng thức đánh giá mới, không đơn thuần là số hóa bài thi cũ.'
  },
  {
    id: 'tf_5',
    statement: 'Cách hiệu quả nhất để ngăn học sinh dùng AI làm hộ bài tập là chỉ ra các câu hỏi trắc nghiệm ghi nhớ định nghĩa trong sách giáo khoa.',
    context: 'Thiết kế đề kiểm tra',
    isTrue: false,
    points: 5,
    explanation: 'SAI. Câu hỏi ghi nhớ định nghĩa là dạng bài mà AI giải quyết hoàn hảo và nhanh nhất. Muốn đo lường năng lực thực, cần nâng câu hỏi lên bậc Phân tích, Đánh giá và Sáng tạo.',
    keyRule: 'Nguyên tắc: Đề thi chất lượng là đề thi đòi hỏi tư duy phản biện, liên hệ thực tiễn và thẩm định.'
  }
];

// GAME 3: Kéo thả tương tác (5 mục x 5 điểm = 25 điểm)
export const GAME3_ZONES: DragDropZone[] = [
  {
    id: 'zone_low',
    title: 'Vùng 1: Nhận Biết & Tái Hiện',
    subtitle: 'Nhiệm vụ tái hiện kiến thức tĩnh (Dễ bị AI làm thay)',
    color: 'text-rose-600',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-300'
  },
  {
    id: 'zone_medium',
    title: 'Vùng 2: Phân Tích & Thẩm Định',
    subtitle: 'Học sinh dùng AI làm dữ liệu đối chiếu và phản biện',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-300'
  },
  {
    id: 'zone_high',
    title: 'Vùng 3: Sáng Tạo & Đánh Giá Thực Chất',
    subtitle: 'Đồng sáng tạo giải pháp thực tế và bảo vệ trực tiếp',
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-300'
  }
];

export const GAME3_ITEMS: DragDropItem[] = [
  {
    id: 'item_1',
    label: 'Liệt kê các mốc thời gian và định nghĩa khái niệm theo sách giáo khoa',
    description: 'Tái hiện thông tin một chiều, không đòi hỏi tư duy phân tích.',
    correctZoneId: 'zone_low'
  },
  {
    id: 'item_2',
    label: 'Đối chiếu và chỉ ra 3 lỗi sai logic trong bài phân tích do AI tạo ra',
    description: 'Đo lường năng lực thẩm định tri thức gốc và phát hiện thiên kiến.',
    correctZoneId: 'zone_medium'
  },
  {
    id: 'item_3',
    label: 'Thiết kế dự án giải quyết vấn đề rác thải tại trường và thuyết trình phản biện',
    description: 'Nhiệm vụ thực tiễn gắn với bối cảnh địa phương, kết hợp vấn đáp trực tiếp.',
    correctZoneId: 'zone_high'
  },
  {
    id: 'item_4',
    label: 'Giải bài tập trắc nghiệm áp dụng trực tiếp một công thức toán học có sẵn',
    description: 'Thao tác áp dụng máy móc, AI có thể giải trong tích tắc.',
    correctZoneId: 'zone_low'
  },
  {
    id: 'item_5',
    label: 'Viết nhật ký phân tích tại sao phải thay đổi câu lệnh 3 lần để có kết quả tối ưu',
    description: 'Đo lường tư duy siêu nhận thức (Metacognition) và kỹ năng điều khiển công cụ.',
    correctZoneId: 'zone_medium'
  }
];

// GAME 4: Trả lời nhanh - Thử thách tập trung (5 câu x 5 điểm = 25 điểm) - Chuẩn 4 đáp án A, B, C, D
export const GAME4_SPEED_QUESTIONS: SpeedQuestion[] = [
  {
    id: 'sp_1',
    prompt: 'Trong khảo thí AI, nguyên tắc "Human-in-the-loop" khẳng định điều gì?',
    scenarioTag: 'Thuật ngữ cốt lõi',
    points: 5,
    options: [
      { id: 'A', text: 'Giáo viên luôn giữ quyền thẩm định và chịu trách nhiệm chuyên môn cuối cùng đối với đề thi.', isCorrect: true },
      { id: 'B', text: 'Hệ thống AI tự động phân loại học sinh và gửi kết quả mà không cần sự can thiệp của con người.', isCorrect: false },
      { id: 'C', text: 'Học sinh phải làm bài trực tuyến liên tục trên hệ thống máy tính có giám sát camera.', isCorrect: false },
      { id: 'D', text: 'Tất cả các câu hỏi thi đều phải do học sinh tự biên soạn rồi nộp lên ngân hàng câu hỏi.', isCorrect: false }
    ],
    quickExplanation: 'Human-in-the-loop đảm bảo vai trò gác cổng chuyên môn tối cao của nhà giáo.'
  },
  {
    id: 'sp_2',
    prompt: 'Hiện tượng AI tạo ra thông tin sai lệch nhưng diễn đạt rất mạch lạc gọi là gì?',
    scenarioTag: 'Đặc tính AI',
    points: 5,
    options: [
      { id: 'A', text: 'Ảo giác AI (AI Hallucination).', isCorrect: true },
      { id: 'B', text: 'Xung đột phần mềm (Software Conflict).', isCorrect: false },
      { id: 'C', text: 'Quá tải dữ liệu hệ thống (Data Overflow).', isCorrect: false },
      { id: 'D', text: 'Độ trễ phản hồi thuật toán (Latency Error).', isCorrect: false }
    ],
    quickExplanation: 'Ảo giác AI là lý do giáo viên phải luôn thẩm định khoa học trước khi sử dụng.'
  },
  {
    id: 'sp_3',
    prompt: 'Hình thức nào giúp xác minh nhanh nhất học sinh có tự làm bài hay nhờ AI?',
    scenarioTag: 'Phương pháp xác thực',
    points: 5,
    options: [
      { id: 'A', text: 'Phỏng vấn vấn đáp trực tiếp 2-3 phút về cấu trúc và lập luận của bài làm.', isCorrect: true },
      { id: 'B', text: 'Yêu cầu học sinh chép phạt lại toàn bộ bài làm bằng tay trên giấy nhiều lần.', isCorrect: false },
      { id: 'C', text: 'Sử dụng thêm 3 phần mềm phát hiện AI khác nhau để quét lấy số liệu trung bình.', isCorrect: false },
      { id: 'D', text: 'Tịch thu thiết bị học tập của học sinh trong suốt quá trình kiểm tra định kỳ.', isCorrect: false }
    ],
    quickExplanation: 'Vấn đáp trực tiếp giúp kiểm chứng mức độ hiểu bài thực chất và độc lập của người học.'
  },
  {
    id: 'sp_4',
    prompt: 'Mục đích cốt lõi của "Đánh giá quá trình" (Formative Assessment) là gì?',
    scenarioTag: 'Mục tiêu đánh giá',
    points: 5,
    options: [
      { id: 'A', text: 'Cung cấp phản hồi kịp thời để học sinh điều chỉnh và tiến bộ trong quá trình học tập.', isCorrect: true },
      { id: 'B', text: 'Xếp loại thi đua, trao học bổng và phân chia thứ hạng học sinh cuối học kỳ.', isCorrect: false },
      { id: 'C', text: 'Lập danh sách học sinh có điểm số thấp nhất để gửi thông báo phê bình công khai.', isCorrect: false },
      { id: 'D', text: 'Thống kê tỷ lệ đỗ tốt nghiệp của từng lớp học để đánh giá thi đua giáo viên.', isCorrect: false }
    ],
    quickExplanation: 'Đánh giá quá trình là đánh giá VÌ sự tiến bộ của người học (Assessment for Learning).'
  },
  {
    id: 'sp_5',
    prompt: 'Để AI tạo câu hỏi trắc nghiệm chuẩn theo ma trận, câu lệnh Prompt cần có yếu tố nào?',
    scenarioTag: 'Kỹ thuật Prompt',
    points: 5,
    options: [
      { id: 'A', text: 'Vai trò chuyên gia + Bối cảnh chuẩn GDPT + Tỷ lệ nhận thức Bloom + Ràng buộc giải thích.', isCorrect: true },
      { id: 'B', text: 'Chỉ cần nhập tên bài học và yêu cầu AI tự do sinh ra 10 câu hỏi bất kỳ không ràng buộc.', isCorrect: false },
      { id: 'C', text: 'Sao chép nguyên văn toàn bộ đề thi cũ từ các năm trước vào khung hội thoại AI.', isCorrect: false },
      { id: 'D', text: 'Yêu cầu AI viết các câu hỏi thật dài và dùng từ ngữ phức tạp để tăng độ khó đề thi.', isCorrect: false }
    ],
    quickExplanation: 'Cấu trúc Prompt có bối cảnh, ma trận và ràng buộc quyết định chất lượng đề thi.'
  }
];
