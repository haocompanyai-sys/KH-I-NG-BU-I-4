import { QuestionItem, HallucinationChallenge, RubricMatchItem, SpeedSortCard, PromptChallenge } from '../types';

export const CAMPAIGN_QUESTIONS: QuestionItem[] = [
  {
    id: 'q1',
    level: 1,
    stageName: 'Ải 1: Bản Chất Kiểm Tra Đánh Giá Thời AI',
    topic: 'Thang Bloom & Kháng Chép AI (AI-Resistant)',
    type: 'scenario',
    bloomLevel: 'Đánh giá',
    difficulty: 'Nâng cao',
    title: 'Thử thách thiết kế câu hỏi kháng "Copy-Paste" AI',
    scenario: 'Cô Lan chuẩn bị kiểm tra 15 phút môn Lịch sử lớp 11. Nếu cô đặt câu hỏi: "Trình bày nguyên nhân, diễn biến chính và kết quả của Cách mạng tháng Mười Nga 1917", học sinh chỉ cần sao chép câu hỏi vào ChatGPT/Claude là có ngay bài làm đạt 10/10 trong 3 giây.',
    visualType: 'bloom',
    visualData: {
      currentLevel: 'Nhớ/Hiểu (Recall)',
      targetLevel: 'Đánh giá / Phản biện (Evaluate & Critique)'
    },
    question: 'Phương án cải tiến nào sau đây giúp câu hỏi kiểm tra chuyển dịch hiệu quả nhất từ bậc Nhớ/Hiểu sang Đánh giá, vừa kiểm tra được năng lực tư duy thực chất vừa tận dụng bối cảnh học tập?',
    options: [
      {
        id: 'A',
        text: 'Cấm tuyệt đối học sinh mang điện thoại vào lớp và chuyển sang hình thức thi viết giấy truyền thống.',
        isCorrect: false,
        rationale: 'Đây là giải pháp phòng thủ hành chính mang tính đối phó, không giúp nâng cao chất lượng tư duy hay chuẩn hóa năng lực đánh giá số cho người học.'
      },
      {
        id: 'B',
        text: 'Cung cấp sẵn 2 đoạn phân tích trái chiều do 2 mô hình AI tạo ra về Cách mạng tháng Mười, yêu cầu học sinh chỉ ra luận điểm có bằng chứng lịch sử xác thực và phản biện luận điểm còn phiến diện.',
        isCorrect: true,
        rationale: 'Chuyển từ việc yêu cầu AI viết thay sang việc "Học sinh đóng vai trò Chuyên gia thẩm định" (Critic/Evaluator). Đòi hỏi học sinh phải nắm vững kiến thức gốc để so sánh, phân tích độ tin cậy và lập luận phản biện.'
      },
      {
        id: 'C',
        text: 'Yêu cầu học sinh viết bài dài tối thiểu 1500 từ và nộp qua phần mềm quét AI Detector.',
        isCorrect: false,
        rationale: 'Độ dài văn bản không đo lường được chiều sâu tư duy. Thêm vào đó, các công cụ AI Detector hiện nay có tỷ lệ phát hiện sai (False Positive) rất cao và không đáng tin cậy.'
      },
      {
        id: 'D',
        text: 'Chuyển toàn bộ sang 20 câu hỏi trắc nghiệm khách quan 4 lựa chọn về ngày tháng năm diễn ra sự kiện.',
        isCorrect: false,
        rationale: 'Trắc nghiệm nhớ ngày tháng chỉ dừng lại ở tầng thấp nhất (Nhận biết sự kiện rời rạc), không đo lường được phẩm chất và năng lực giải quyết vấn đề theo chuẩn GDPT 2018.'
      }
    ],
    pedagogicalInsight: 'Nguyên tắc vàng AI-Resistant: Khi AI giải quyết xuất sắc các câu hỏi "Cái gì? Khi nào?", bài kiểm tra của thầy cô cần chuyển trọng tâm sang "Tại sao? Đánh giá như thế nào? Bằng chứng nào phản biện?".',
    proTip: 'Hãy cho AI đóng vai "người tranh biện" hoặc "tạo lập dữ liệu nhiễu", học sinh là người phán xử và bảo vệ quan điểm.'
  },
  {
    id: 'q2',
    level: 2,
    stageName: 'Ải 2: Bẫy Ảo Giác & Thẩm Định Đề Thi',
    topic: 'Kiểm duyệt đề thi do AI sinh (AI Hallucination Verification)',
    type: 'scenario',
    bloomLevel: 'Phân tích',
    difficulty: 'Nâng cao',
    title: 'Phát hiện lỗi nguy hiểm khi dùng AI tạo đề trắc nghiệm Hóa học',
    scenario: 'Thầy Hùng dùng một Prompt yêu cầu AI: "Tạo 5 câu hỏi trắc nghiệm phân hóa cao về Este - Lipit". AI sinh ra câu hỏi sau: "Đun nóng 0,1 mol phenyl axetat với dung dịch chứa 0,25 mol NaOH dư. Sau khi phản ứng hoàn toàn, cô cạn dung dịch thu được m gam chất rắn khan. Biết AI tính toán m = 20,5g". Thầy Hùng vội vàng đưa vào đề thi mà không kiểm chứng phương trình phản ứng đặc biệt của este của phenol.',
    visualType: 'hallucination_meter',
    visualData: {
      riskScore: 88,
      hallucinationRisk: 'Rất cao với bài toán đa phản ứng nối tiếp'
    },
    question: 'Hành vi chuyên môn nào của giáo viên là BẮT BUỘC theo quy trình chuẩn khi dùng AI hỗ trợ sinh đề thi?',
    options: [
      {
        id: 'A',
        text: 'Tin tưởng AI 100% vì các mô hình ngôn ngữ lớn (LLM) hiện đại đã giải được đề thi Olympic quốc tế.',
        isCorrect: false,
        rationale: 'LLM suy luận dựa trên xác suất từ ngữ, rất dễ sinh ảo giác (hallucination) với các phương trình hóa học hữu cơ đặc thù hoặc tính toán số học đa bước.'
      },
      {
        id: 'B',
        text: 'Quy trình "Human-in-the-loop": Thầy cô phải trực tiếp giải độc lập, thẩm định từng phương án nhiễu (distractors), đối chiếu ma trận đề và thử nghiệm với học sinh trước khi ban hành.',
        isCorrect: true,
        rationale: 'AI chỉ là trợ lý đề xuất ý tưởng ban đầu (Co-pilot). Giáo viên luôn giữ vai trò chịu trách nhiệm chuyên môn tối cao (Accountability) trong thẩm định tính sư phạm và tính chính xác khoa học.'
      },
      {
        id: 'C',
        text: 'Chỉ cần copy câu hỏi và hỏi lại chính AI đó một lần nữa để xác nhận.',
        isCorrect: false,
        rationale: 'AI có xu hướng tự huyễn hoặc và củng cố lỗi sai của chính nó (Confirmation bias & self-hallucination) nếu không có sự can thiệp của tri thức con người.'
      },
      {
        id: 'D',
        text: 'Giảm bớt độ khó của bài thi xuống mức chỉ hỏi lý thuyết định nghĩa đơn giản.',
        isCorrect: false,
        rationale: 'Hạ chuẩn đánh giá là đi lùi so với mục tiêu giáo dục phát triển phẩm chất, năng lực.'
      }
    ],
    pedagogicalInsight: 'Nguyên tắc Human-in-the-loop: Đề thi có liên quan trực tiếp đến quyền lợi và sự công bằng của học sinh. AI tạo đề -> Con người thẩm định & hiệu chỉnh ma trận.',
    proTip: 'Hãy yêu cầu AI giải thích từng phương án sai (Tại sao A sai? Học sinh hay mắc lỗi gì để chọn A?) để phát hiện phương án nhiễu kém chất lượng.'
  },
  {
    id: 'q3',
    level: 3,
    stageName: 'Ải 3: Đánh Giá Quá Trình & Phản Hồi Tức Thì',
    topic: 'Formative Assessment & AI Instant Feedback',
    type: 'scenario',
    bloomLevel: 'Sáng tạo',
    difficulty: 'Nâng cao',
    title: 'Thiết kế Trợ lý AI Phản hồi (Feedback Bot) theo phương pháp gợi mở Socrate',
    scenario: 'Trường THPT X muốn triển khai AI để nhận xét bài viết đoạn văn nghị luận xã hội cho 500 học sinh. Nếu cài đặt AI chỉ đơn giản là "Sửa hết lỗi chính tả và viết lại đoạn văn hoàn hảo", học sinh sẽ có xu hướng chép lại bản sửa của AI mà không hiểu tại sao mình sai.',
    visualType: 'process_flow',
    visualData: {
      steps: ['Bài nộp HS', 'AI đặt câu hỏi gợi mở', 'HS tự phát hiện lỗi', 'Hoàn thiện tư duy']
    },
    question: 'Chiến lược Prompting nào sau đây biến AI thành một "Chuyên gia đánh giá quá trình" (Formative Coach) mang lại hiệu quả sư phạm cao nhất?',
    options: [
      {
        id: 'A',
        text: 'Cấu hình AI chấm điểm số từ 1-10 kèm lời khen chung chung: "Bài làm rất tốt, hãy cố gắng phát huy!".',
        isCorrect: false,
        rationale: 'Lời nhận xét chung chung không cung cấp thông tin phản hồi có thể hành động (Actionable Feedback).'
      },
      {
        id: 'B',
        text: 'Cấu hình AI tự động viết lại một bài văn mẫu điểm 10 để học sinh học thuộc lòng.',
        isCorrect: false,
        rationale: 'Triệt tiêu tính sáng tạo và khả năng biểu đạt cá nhân của học sinh, tạo thói quen phụ thuộc thụ động.'
      },
      {
        id: 'C',
        text: 'Thiết lập AI theo phương pháp gợi mở Socrate: Chỉ ra 1 điểm mạnh lập luận, đặt 2 câu hỏi phản biện để học sinh tự soi lại lỗ hổng logic, và yêu cầu học sinh tự viết lại bản cải tiến (Iterative draft).',
        isCorrect: true,
        rationale: 'Đánh giá vì sự tiến bộ (Assessment for Learning). Phương pháp Socrate buộc học sinh phải siêu nhận thức (Metacognition) - tự suy ngẫm và chịu trách nhiệm về quá trình chỉnh sửa bài của mình.'
      },
      {
        id: 'D',
        text: 'Chỉ định AI gạch chân tất cả các lỗi sai ngữ pháp bằng mực đỏ và trừ điểm từng lỗi một.',
        isCorrect: false,
        rationale: 'Tập trung quá mức vào lỗi hình thức cơ học mà bỏ qua cấu trúc ý tưởng, tư duy phản biện và cảm xúc diễn đạt.'
      }
    ],
    pedagogicalInsight: 'Phản hồi hiệu quả (Feedforward) không phải là đưa ra đáp án cuối cùng, mà là trao cho học sinh chiếc la bàn và câu hỏi định hướng để tự leo lên nấc thang tư duy tiếp theo.',
    proTip: 'Prompt khuôn mẫu: "Không đưa ra câu trả lời trực tiếp. Hãy đặt 2 câu hỏi định hướng buộc người học phân tích sâu hơn về mối liên hệ nhân - quả trong đoạn văn vừa viết."'
  },
  {
    id: 'q4',
    level: 4,
    stageName: 'Ải 4: Rubric 4 Chiều Đánh Giá Năng Lực AI',
    topic: 'Khung Đánh Giá Tích Hợp AI (AI-Assisted Rubric Design)',
    type: 'rubric',
    bloomLevel: 'Đánh giá',
    difficulty: 'Chuyên gia',
    title: 'Xây dựng tiêu chí đánh giá dự án STEM khi học sinh được tự do dùng AI',
    scenario: 'Thầy Minh giao bài tập lớn: "Thiết kế kế hoạch kinh doanh sản phẩm tái chế bảo vệ môi trường". Học sinh được phép dùng AI để tra cứu, tạo ảnh mockup và viết dàn ý. Một số giáo viên băn khoăn: "Nếu học sinh dùng AI thì chấm điểm kiểu gì để đảm bảo công bằng?".',
    visualType: 'rubric',
    visualData: {
      dimensions: ['Nhật ký Prompt & Thẩm định', 'Nghiên cứu thực tế địa phương', 'Khả năng phản biện trực tiếp', 'Mức độ sáng tạo vượt trên AI']
    },
    question: 'Để đánh giá đúng năng lực thực chất của học sinh trong bài tập này, tiêu chí (Rubric criteria) nào dưới đây có trọng số quan trọng nhất?',
    options: [
      {
        id: 'A',
        text: 'Độ dài văn bản và số lượng trang báo cáo in màu đẹp mắt.',
        isCorrect: false,
        rationale: 'Hình thức trình bày chỉ là tiêu chí phụ, AI có thể định dạng đẹp chỉ trong 1 thao tác.'
      },
      {
        id: 'B',
        text: 'Tiêu chí "Thẩm định phản biện & Bản địa hóa dữ liệu": Học sinh nộp nhật ký tương tác AI (Prompt Log), chứng minh được việc phát hiện và hiệu chỉnh dữ liệu sai của AI theo bối cảnh thực tế địa phương, kết hợp bảo vệ trực tiếp (Oral Defense).',
        isCorrect: true,
        rationale: 'Đo lường năng lực "Đồng sáng tạo với AI" (AI-Co-creation). Đánh giá quá trình tư duy, khả năng lọc sạn của AI và áp dụng thực tiễn vào bối cảnh thật mà AI không biết.'
      },
      {
        id: 'C',
        text: 'Tỷ lệ % trùng lặp theo công cụ Turnitin phải bằng đúng 0%.',
        isCorrect: false,
        rationale: 'Turnitin đo lường trùng lặp cơ học, không phản ánh năng lực giải quyết vấn đề và tính độc đáo của ý tưởng dự án.'
      },
      {
        id: 'D',
        text: 'Số lượng câu lệnh Prompt mà học sinh đã gửi cho AI (càng nhiều câu lệnh điểm càng cao).',
        isCorrect: false,
        rationale: 'Số lượng câu lệnh không đồng nghĩa với chất lượng tư duy. Một câu lệnh thông minh có chiều sâu giá trị hơn 100 câu lệnh vu vơ.'
      }
    ],
    pedagogicalInsight: 'Đánh giá thực chất trong kỷ nguyên AI chuyển trọng tâm từ "Đánh giá kết quả tĩnh" sang "Đánh giá quá trình tương tác, chọn lọc, cải tiến và phản biện trực tiếp".',
    proTip: 'Kết hợp "Hồ sơ học tập tương tác AI" (AI Portfolio) + "Vấn đáp nhanh 3 phút không thiết bị" là vũ khí chống gian lận và phát triển năng lực tuyệt vời nhất.'
  },
  {
    id: 'q5',
    level: 5,
    stageName: 'Ải 5: Tình Huống Đạo Đức & Phán Xét Khảo Thí',
    topic: 'Liêm chính học thuật & Tránh bẫy AI Detector',
    type: 'dilemma',
    bloomLevel: 'Đánh giá',
    difficulty: 'Chuyên gia',
    title: 'Xử lý tình huống "Báo động giả" từ công cụ quét AI Detector',
    scenario: 'Học sinh An nộp bài luận môn Giáo dục công dân rất mạch lạc và sâu sắc. Giáo viên đưa bài qua một công cụ kiểm tra AI miễn phí trên mạng, kết quả báo: "87% khả năng được viết bởi AI". Giáo viên lập tức cho An điểm 0 và ghi học bạ tội gian lận. An khóc và khẳng định mình tự viết 100% trong 3 đêm tại thư viện.',
    visualType: 'ethics_scale',
    visualData: {
      detectorReliability: 'Không ổn định (False Positives > 30%)',
      ethicalPrinciple: 'Suy đoán vô tội & Đánh giá đa nguồn chứng cứ'
    },
    question: 'Theo chuẩn đạo đức đánh giá và khuyến cáo của các tổ chức giáo dục quốc tế (UNESCO, OECD), giáo viên đã vi phạm nguyên tắc khảo thí nghiêm trọng nào?',
    options: [
      {
        id: 'A',
        text: 'Giáo viên đã làm hoàn toàn đúng, 87% là con số định lượng khoa học tuyệt đối không thể chối cãi.',
        isCorrect: false,
        rationale: 'Các nghiên cứu của Đại học Stanford và MIT chỉ ra rằng các công cụ AI Detector thường xuyên báo động giả, đặc biệt thiên vị bất lợi với học sinh dùng ngoại ngữ thứ hai hoặc người có phong cách viết chuẩn ngữ pháp.'
      },
      {
        id: 'B',
        text: 'Vi phạm nguyên tắc "Đánh giá đa nguồn chứng cứ & Quyền được bảo vệ": Không được dùng một công cụ thuật toán không rõ nguồn gốc làm bằng chứng duy nhất để trừng phạt học sinh. Giáo viên cần phỏng vấn đối thoại, xem lịch sử chỉnh sửa tài liệu (Version History) và yêu cầu học sinh giải trình mạch tư duy.',
        isCorrect: true,
        rationale: 'Trong kiểm tra đánh giá, tính nhân văn và công bằng đòi hỏi sự xác thực đa kênh. Lịch sử chỉnh sửa trên Google Docs/Word là bằng chứng xác thực nhất về tiến trình viết.'
      },
      {
        id: 'C',
        text: 'Đáng lẽ giáo viên phải mua phiên bản AI Detector trả phí đắt tiền hơn thì mới được quyền phạt.',
        isCorrect: false,
        rationale: 'Dù là phiên bản trả phí đắt nhất, nguyên lý toán học của phát hiện văn bản AI vẫn không thể đạt độ tin cậy 100% về mặt pháp lý giáo dục.'
      },
      {
        id: 'D',
        text: 'Giáo viên nên bỏ qua hoàn toàn và cho học sinh điểm 10 để tránh rắc rối kiện tụng.',
        isCorrect: false,
        rationale: 'Bỏ qua kiểm soát làm suy giảm chuẩn mực liêm chính học thuật và bất công với những học sinh khác.'
      }
    ],
    pedagogicalInsight: 'Thuật toán không thể thay thế trái tim và khối óc của nhà sư phạm. Hãy dùng công nghệ để hỗ trợ đối thoại, không dùng công nghệ làm công cụ kết án đơn phương.',
    proTip: 'Hướng dẫn học sinh tạo thói quen làm bài trên các nền tảng có lưu "Version History" (lịch sử bản nháp) để minh bạch hóa quá trình tự sáng tác.'
  }
];

export const HALLUCINATION_CHALLENGES: HallucinationChallenge[] = [
  {
    id: 'halluc_1',
    title: 'Vạch trần Ảo giác: Đề thi Lịch sử thế giới',
    context: 'Thầy Hưng dùng AI để tạo 1 câu hỏi trắc nghiệm Lịch sử. Dưới đây là 4 phương án do AI tạo ra:',
    aiOutputSnippet: [
      'A. Hiệp ước Versailles được ký kết năm 1919 tại Pháp.',
      'B. Hội Quốc Liên (League of Nations) được thành lập sau Chiến tranh thế giới thứ nhất.',
      'C. Tổng thống Franklin D. Roosevelt là người trực tiếp tham gia ký kết Hiệp ước Versailles năm 1919 thay mặt nước Mỹ.',
      'D. Nước Đức phải chịu các điều khoản bồi thường chiến phí nặng nề sau hiệp ước.'
    ],
    flawedIndex: 2,
    flawType: 'Ảo giác dữ liệu khoa học',
    explanation: 'AI đã "bịa" sự kiện lịch sử: Người đại diện nước Mỹ ký Hiệp ước Versailles năm 1919 là Tổng thống Woodrow Wilson, không phải Franklin D. Roosevelt (Roosevelt làm tổng thống từ năm 1933). Nếu giáo viên không có kiến thức chuyên môn vững vàng mà tin theo AI sẽ đưa câu hỏi sai lệch nghiêm trọng vào đề thi!',
    correctAlternative: 'C. Tổng thống Woodrow Wilson là người đại diện phái đoàn Hoa Kỳ tham dự Hòa hội Paris 1919.'
  },
  {
    id: 'halluc_2',
    title: 'Vạch trần Thiên kiến (Bias) trong Bài tập Văn học',
    context: 'Một giáo viên nhờ AI tạo đề bài kiểm tra môn Ngữ Văn về định hướng nghề nghiệp và phẩm chất con người:',
    aiOutputSnippet: [
      'Phần 1: Bác sĩ phẫu thuật và Kỹ sư trưởng cần có tính quyết đoán, tư duy logic của nam giới.',
      'Phần 2: Nêu vai trò của tinh thần trách nhiệm trong công việc.',
      'Phần 3: Phân tích sự kiên trì giúp con người vượt qua nghịch cảnh.',
      'Phần 4: Liên hệ thực tế bản thân trong việc chọn ngành nghề tương lai.'
    ],
    flawedIndex: 0,
    flawType: 'Thiên kiến ngầm (Bias)',
    explanation: 'AI đã vô tình đưa định kiến giới tính (Gender Bias) độc hại vào ngữ liệu đề thi ("quyết đoán, logic của nam giới"). Trong khảo thí hiện đại, đề thi chuẩn mực phải loại bỏ hoàn toàn các thiên kiến về giới tính, tôn giáo, vùng miền hay hoàn cảnh xuất thân.',
    correctAlternative: 'Phần 1: Bác sĩ phẫu thuật và Kỹ sư trưởng đòi hỏi tính quyết đoán, tư duy logic và chuyên môn xuất sắc.'
  },
  {
    id: 'halluc_3',
    title: 'Vạch trần Phương án nhiễu vô nghĩa trong Toán học',
    context: 'AI sinh câu hỏi trắc nghiệm về Khảo sát hàm số bậc ba:',
    aiOutputSnippet: [
      'A. Hàm số đồng biến trên khoảng (-vô cùng; 1).',
      'B. Hàm số có hai điểm cực trị nằm về hai phía trục tung.',
      'C. Đồ thị hàm số nhận điểm I(1; 2) làm tâm đối xứng dạng lượng giác ảo xoay chiều.',
      'D. Điểm cực đại của đồ thị hàm số có tọa độ (0; 3).'
    ],
    flawedIndex: 2,
    flawType: 'Câu hỏi thiếu tính phân hóa',
    explanation: 'AI ghép nối thuật ngữ vô nghĩa: "tâm đối xứng dạng lượng giác ảo xoay chiều". Đây là lỗi đặc trưng của LLM khi cố gắng tạo phương án nhiễu nghe có vẻ nguy hiểm nhưng thực chất không có trong toán học giải tích phổ thông.',
    correctAlternative: 'C. Đồ thị hàm số nhận điểm uốn I(1; 2) làm tâm đối xứng.'
  }
];

export const RUBRIC_MATCH_DATA: RubricMatchItem[] = [
  {
    id: 'rub_1',
    criterionTitle: 'Mức 1: Bắt chước máy móc (Copy-Paste)',
    aiUseLevel: 'Mức yếu (1-2 điểm)',
    descriptor: 'Học sinh sao chép nguyên văn câu trả lời của AI mà không thẩm định, để sót các lỗi ảo giác ngớ ngẩn hoặc từ ngữ dịch thuật thô ráp.',
    points: 2
  },
  {
    id: 'rub_2',
    criterionTitle: 'Mức 2: Sử dụng có chỉnh sửa cơ bản',
    aiUseLevel: 'Mức đạt (3-4 điểm)',
    descriptor: 'Học sinh dùng AI để tìm ý tưởng thô và sửa lại câu từ cho mượt mà, nhưng chưa đưa ra được lập luận cá nhân hay dữ liệu thực chứng.',
    points: 4
  },
  {
    id: 'rub_3',
    criterionTitle: 'Mức 3: Thẩm định & Phản biện có cấu trúc',
    aiUseLevel: 'Mức khá (5-7 điểm)',
    descriptor: 'Học sinh sử dụng AI như đối tác tranh biện, phát hiện được ít nhất 2 điểm thiếu sót của AI và bổ sung số liệu thực tế tại Việt Nam.',
    points: 7
  },
  {
    id: 'rub_4',
    criterionTitle: 'Mức 4: Đồng sáng tạo & Kiến tạo tri thức mới',
    aiUseLevel: 'Mức xuất sắc (8-10 điểm)',
    descriptor: 'Học sinh làm chủ quy trình: thiết kế chuỗi Prompt chuyên sâu, tổng hợp đa nguồn, kiểm chứng chéo, tạo ra giải pháp độc đáo vượt trội hơn bản thảo gốc của AI.',
    points: 10
  }
];

export const SPEED_SORT_CARDS: SpeedSortCard[] = [
  {
    id: 'sc1',
    text: 'Sử dụng AI tạo bài kiểm tra nhanh 3 phút đầu giờ để phát hiện lỗ hổng kiến thức trước khi vào bài mới.',
    correctCategory: 'Diagnostic (Chẩn đoán)',
    explanation: 'Đánh giá chẩn đoán nhằm xác định điểm khởi đầu và nhu cầu học tập của học sinh.'
  },
  {
    id: 'sc2',
    text: 'Dùng AI Feedback Bot gửi gợi ý sửa đổi từng đoạn văn theo thời gian thực trong khi học sinh đang viết bài nháp.',
    correctCategory: 'Formative (Quá trình)',
    explanation: 'Đánh giá quá trình diễn ra liên tục để hỗ trợ và điều chỉnh việc học ngay lập tức.'
  },
  {
    id: 'sc3',
    text: 'Thiết kế đề thi tự luận cuối kỳ tích hợp ma trận trắc nghiệm chuẩn hóa để xếp loại học lực năm học.',
    correctCategory: 'Summative (Tổng kết)',
    explanation: 'Đánh giá tổng kết nhằm đo lường mức độ đạt chuẩn đầu ra sau một giai đoạn học tập.'
  },
  {
    id: 'sc4',
    text: 'Học sinh dùng AI xây dựng chiến dịch giải cứu rác thải nhựa tại trường học và thuyết trình trước hội đồng chuyên môn.',
    correctCategory: 'Authentic (Thực chất)',
    explanation: 'Đánh giá thực chất gắn liền với tình huống đời thực, yêu cầu vận dụng tích hợp nhiều kỹ năng.'
  },
  {
    id: 'sc5',
    text: 'Phân tích bảng dữ liệu điểm số tự động bằng AI để tìm ra 15% học sinh đang có nguy cơ hổng kiến thức phân số.',
    correctCategory: 'Diagnostic (Chẩn đoán)',
    explanation: 'Chẩn đoán sớm nguy cơ để có biện pháp can thiệp sư phạm kịp thời.'
  },
  {
    id: 'sc6',
    text: 'Học sinh ghi âm bài nói tiếng Anh và nhận biểu đồ chấm phát âm ngữ điệu AI để tự luyện lại 3 lần.',
    correctCategory: 'Formative (Quá trình)',
    explanation: 'Học sinh tự đánh giá và cải thiện liên tục (Self-assessment & Formative loop).'
  }
];

export const PROMPT_CHALLENGES: PromptChallenge[] = [
  {
    id: 'pr_1',
    title: 'Thử thách: Đặt câu lệnh tạo Đề kiểm tra Phân hóa 3 cấp độ',
    scenarioGoal: 'Bạn muốn AI tạo đề thi môn Sinh học 10 bài "Tế bào" gồm 3 phần rõ rệt: Nhận biết, Thông hiểu - Vận dụng, và Vận dụng cao (phân tích thí nghiệm).',
    badPromptExample: 'Tạo cho tôi đề thi môn Sinh học lớp 10 về tế bào có đáp án.',
    customAllowed: true,
    presetOptions: [
      {
        id: 'opt1',
        promptText: 'Hãy tạo cho tôi 10 câu trắc nghiệm Sinh 10 thật khó về tế bào để học sinh không giải được.',
        rating: 2,
        analysis: 'Prompt mang tính cảm tính, không có ma trận nhận thức, không có khung chuẩn đầu ra, dễ sinh câu đố mẹo vô giá trị sư phạm.'
      },
      {
        id: 'opt2',
        promptText: 'Đóng vai Chuyên gia Khảo thí môn Sinh học theo CT GDPT 2018. Hãy thiết kế 1 đề kiểm tra 15 phút chủ đề "Cấu trúc Tế bào nhân thực" theo ma trận: 40% Nhận biết (cấu tạo cơ bản), 40% Thông hiểu/Vận dụng (so sánh tế bào động vật và thực vật qua sơ đồ), 20% Vận dụng cao (phân tích giả thuyết thí nghiệm ức chế ti thể). Kèm bảng đáp án có giải thích lỗi sai thường gặp của học sinh.',
        rating: 5,
        analysis: 'Xuất sắc! Có đầy đủ: Vai trò chuyên gia (Role), Chuẩn chương trình (Context), Ma trận định lượng phân bậc Bloom (Matrix), Yêu cầu giải thích phương án nhiễu (Deep Feedback).'
      },
      {
        id: 'opt3',
        promptText: 'Viết đề kiểm tra Sinh 10 ngắn gọn, có 4 câu A B C D.',
        rating: 1,
        analysis: 'Prompt quá sơ sài, AI sẽ tạo các câu hỏi ngẫu nhiên không bám sát mục tiêu bài học.'
      }
    ]
  }
];

export const BADGES_DATA = [
  {
    id: 'badge_novice',
    name: 'Tân Binh Khảo Thí',
    desc: 'Hoàn thành câu hỏi trắc nghiệm đầu tiên',
    icon: 'Sparkles',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'badge_hallucination_hunter',
    name: 'Thợ Săn Ảo Giác AI',
    desc: 'Phát hiện chính xác các bẫy ảo giác của mô hình ngôn ngữ',
    icon: 'SearchCheck',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'badge_rubric_master',
    name: 'Kiến Trúc Sư Rubric',
    desc: 'Khớp nối hoàn hảo ma trận đánh giá năng lực tích hợp AI',
    icon: 'TableProperties',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'badge_prompt_wizard',
    name: 'Bậc Thầy Prompt Sư Phạm',
    desc: 'Đạt điểm tối đa trong đấu trường tối ưu câu lệnh khảo thí',
    icon: 'Terminal',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'badge_grandmaster',
    name: 'Đại Sư Đổi Mới Đánh Giá',
    desc: 'Đạt cấp độ 5 và mở khóa toàn bộ kho tàng tri thức',
    icon: 'Crown',
    color: 'from-yellow-400 to-amber-600'
  }
];
