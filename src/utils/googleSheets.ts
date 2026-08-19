import { StudentSubmission } from '../types';
import { findOrCreateFolder } from './googleDrive';

export interface SheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Creates a formatted Google Spreadsheet for the class leaderboard / submissions
 * and places it in the designated 'Khao_Thi_Su_Pham_So_Buoi_4' folder in Google Drive.
 */
export const createOrExportToGoogleSheet = async (
  accessToken: string,
  submissions: StudentSubmission[],
  customTitle?: string
): Promise<SheetCreationResult> => {
  const timestamp = new Date().toLocaleDateString('vi-VN');
  const title = customTitle || `Bảng Điểm Khảo Thí Sư Phạm Số Buổi 4 - ${timestamp}`;
  const sheetTabTitle = 'Bảng Điểm & Thi Đua';

  // 1. Create Spreadsheet via Google Sheets API v4
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: sheetTabTitle,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Không thể tạo Google Sheet mới.');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Rows: Headers + Data
  const headers = [
    'Hạng',
    'Họ và Tên',
    'Đơn Vị / Trường Học',
    'Mã Học Viên (SBD)',
    'Trò 1: Trắc Nghiệm (25đ)',
    'Trò 2: Đúng/Sai (25đ)',
    'Trò 3: Ma Trận (25đ)',
    'Trò 4: Tốc Độ (25đ)',
    'TỔNG ĐIỂM (100đ)',
    'XẾP LOẠI',
    'Trạng Thái Hoàn Thành',
    'Thời Gian Nộp Bài',
  ];

  // Sort submissions by score descending
  const sortedSubmissions = [...submissions].sort((a, b) => b.scores.totalScore - a.scores.totalScore);

  const rows = sortedSubmissions.map((s, index) => {
    const timeStr = s.updatedAt ? new Date(s.updatedAt).toLocaleString('vi-VN') : 'Vừa nộp';
    return [
      index + 1,
      s.fullName,
      s.schoolOrOrg || 'Tự do',
      s.studentId,
      s.scores.game1,
      s.scores.game2,
      s.scores.game3,
      s.scores.game4,
      s.scores.totalScore,
      s.tier || (s.scores.totalScore >= 50 ? 'Đạt' : 'Chưa đạt'),
      `${s.completionStatus?.completedGamesCount || 0}/4 trò chơi`,
      timeStr,
    ];
  });

  const allValues = [headers, ...rows];

  // 3. Write data to the sheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTabTitle)}!A1:L${allValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${sheetTabTitle}!A1:L${allValues.length}`,
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    console.warn('Cập nhật dữ liệu hàng Google Sheet gặp lỗi:', err);
  }

  // 4. Format the Header (Indigo background, white bold text) & Columns via batchUpdate
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.27,
                    green: 0.22,
                    blue: 0.79, // Indigo color
                  },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 11,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 12,
              },
            },
          },
        ],
      }),
    });
  } catch (fmtErr) {
    console.warn('Formatting spreadsheet styling skipped:', fmtErr);
  }

  // 5. Move spreadsheet file to App's Google Drive Folder 'Khao_Thi_Su_Pham_So_Buoi_4'
  try {
    const folderId = await findOrCreateFolder(accessToken, 'Khao_Thi_Su_Pham_So_Buoi_4');
    if (folderId) {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }
  } catch (driveErr) {
    console.warn('Di chuyển Google Sheet vào thư mục Drive thất bại (vẫn lưu tại My Drive):', driveErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
};

/**
 * Append or sync a single student submission into an existing Google Sheet
 */
export const appendStudentToGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string,
  submission: StudentSubmission,
  rankNumber?: number
) => {
  const sheetTabTitle = 'Bảng Điểm & Thi Đua';
  const row = [
    rankNumber || '-',
    submission.fullName,
    submission.schoolOrOrg || 'Tự do',
    submission.studentId,
    submission.scores.game1,
    submission.scores.game2,
    submission.scores.game3,
    submission.scores.game4,
    submission.scores.totalScore,
    submission.tier || (submission.scores.totalScore >= 50 ? 'Đạt' : 'Chưa đạt'),
    `${submission.completionStatus?.completedGamesCount || 0}/4 trò chơi`,
    new Date(submission.updatedAt || submission.startedAt || Date.now()).toLocaleString('vi-VN'),
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTabTitle)}!A:L:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Không thể ghi thêm dòng vào Google Sheet.');
  }

  return await res.json();
};

/**
 * List spreadsheets created by the app in Drive
 */
export const listAppSpreadsheets = async (accessToken: string) => {
  const query = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc&pageSize=15`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Không thể tải danh sách Google Sheets từ Google Drive.');
  }

  const data = await res.json();
  return data.files || [];
};
