import { STAFF, ALL_CODES, DAYS } from "../data.js";

/** カンマ・引用符・改行を含む値をCSVエスケープ */
export function csvEscape(val) {
  const s = val == null ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** CSV文字列をパース（BOM除去、引用符対応） */
export function parseCsv(text) {
  // BOM除去
  const cleaned = text.replace(/^\uFEFF/, "");
  const rows = [];
  let current = [];
  let field = "";
  let inQuote = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inQuote) {
      if (ch === '"') {
        if (i + 1 < cleaned.length && cleaned[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        current.push(field);
        field = "";
      } else if (ch === "\r") {
        // skip \r
      } else if (ch === "\n") {
        current.push(field);
        field = "";
        if (current.length > 1 || current[0] !== "") rows.push(current);
        current = [];
      } else {
        field += ch;
      }
    }
  }
  // 最終行
  current.push(field);
  if (current.length > 1 || current[0] !== "") rows.push(current);

  if (rows.length === 0) return { headers: [], rows: [] };
  return { headers: rows[0], rows: rows.slice(1) };
}

/** 職員マスタCSV生成 */
export function generateStaffCsv() {
  const header = ["ID", "名前", "役職", "カラー"];
  const lines = [header.map(csvEscape).join(",")];
  for (const s of STAFF) {
    lines.push([s.id, s.name, s.role, s.color].map(csvEscape).join(","));
  }
  return lines.join("\n");
}

/** 利用者・スケジュールCSV生成（1行=1スケジュール） */
export function generateUsersCsv(usersData) {
  const header = [
    "利用者ID", "利用者名", "住所", "エリア", "保険種別", "サービスコード",
    "担当者ID", "備考", "訪問曜日", "開始時間", "訪問担当者ID",
    "訪問サービスコード", "訪問保険種別", "時間(時間単位)",
  ];
  const lines = [header.map(csvEscape).join(",")];
  for (const u of usersData) {
    if (!u.regularSchedule || u.regularSchedule.length === 0) {
      // スケジュールなしの利用者も1行出力
      lines.push([
        u.id, u.name, u.address, u.area, u.insuranceType, u.serviceCode,
        u.staffId, u.notes || "", "", "", "", "", "", "",
      ].map(csvEscape).join(","));
    } else {
      for (const s of u.regularSchedule) {
        lines.push([
          u.id, u.name, u.address, u.area, u.insuranceType, u.serviceCode,
          u.staffId, u.notes || "",
          DAYS[s.day], s.hour, s.staffId, s.serviceCode, s.insuranceType, s.duration,
        ].map(csvEscape).join(","));
      }
    }
  }
  return lines.join("\n");
}

/** 利用者CSVをパースしバリデーション */
export function parseUsersCsv(text) {
  const { headers, rows } = parseCsv(text);
  if (rows.length === 0) return { data: [], errors: [{ row: 0, message: "データ行がありません" }] };

  const validAreas = ["柏エリア", "高塚エリア", "松戸エリア"];
  const validIns = ["介護", "医療"];
  const validCodes = new Set(ALL_CODES.map((c) => c.code));
  const validStaffIds = new Set(STAFF.map((s) => s.id));
  const validDays = new Set(DAYS);

  const errors = [];
  const userMap = new Map(); // id -> user object

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed, +1 for header
    const rowErrors = [];

    const get = (i) => (row[i] || "").trim();
    const userId = get(0) ? parseInt(get(0), 10) : null;
    const name = get(1);
    const address = get(2);
    const area = get(3);
    const ins = get(4);
    const serviceCode = get(5);
    const staffId = get(6) ? parseInt(get(6), 10) : null;
    const notes = get(7);
    const visitDay = get(8);
    const startHour = get(9) ? parseFloat(get(9)) : null;
    const visitStaffId = get(10) ? parseInt(get(10), 10) : null;
    const visitServiceCode = get(11);
    const visitIns = get(12);
    const duration = get(13) ? parseFloat(get(13)) : null;

    // 利用者フィールドのバリデーション
    if (!name) rowErrors.push("利用者名が空です");
    if (!address) rowErrors.push("住所が空です");
    if (area && !validAreas.includes(area)) rowErrors.push(`エリア「${area}」は無効です`);
    if (ins && !validIns.includes(ins)) rowErrors.push(`保険種別「${ins}」は無効です`);
    if (serviceCode && !validCodes.has(serviceCode)) rowErrors.push(`サービスコード「${serviceCode}」は無効です`);
    if (staffId != null && !validStaffIds.has(staffId)) rowErrors.push(`担当者ID「${staffId}」は無効です`);

    // 訪問スケジュールのバリデーション（訪問曜日があればスケジュール行）
    let schedule = null;
    if (visitDay) {
      if (!validDays.has(visitDay)) {
        rowErrors.push(`訪問曜日「${visitDay}」は無効です`);
      } else if (startHour == null || startHour < 8 || startHour > 17) {
        rowErrors.push(`開始時間「${get(9)}」は8〜17の数値が必要です`);
      } else if (visitStaffId != null && !validStaffIds.has(visitStaffId)) {
        rowErrors.push(`訪問担当者ID「${visitStaffId}」は無効です`);
      } else if (visitServiceCode && !validCodes.has(visitServiceCode)) {
        rowErrors.push(`訪問サービスコード「${visitServiceCode}」は無効です`);
      } else if (duration != null && duration <= 0) {
        rowErrors.push(`時間「${duration}」は正の数値が必要です`);
      } else {
        const codeInfo = ALL_CODES.find((c) => c.code === (visitServiceCode || serviceCode));
        schedule = {
          day: DAYS.indexOf(visitDay),
          hour: startHour,
          staffId: visitStaffId || staffId || 1,
          serviceCode: visitServiceCode || serviceCode,
          serviceLabel: codeInfo?.label || "",
          insuranceType: visitIns || ins || "介護",
          duration: duration || codeInfo?.duration || 1,
        };
      }
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join("; ") });
      return;
    }

    // ユーザーのグループ化（IDが同じなら同一利用者）
    const key = userId || `new_${name}_${address}`;
    if (!userMap.has(key)) {
      const codeInfo = ALL_CODES.find((c) => c.code === serviceCode);
      userMap.set(key, {
        id: userId,
        name,
        address,
        area: area || "柏エリア",
        insuranceType: ins || "介護",
        serviceCode: serviceCode || "1313",
        serviceLabel: codeInfo?.label || "",
        staffId: staffId || 1,
        notes: notes || "",
        regularSchedule: [],
        frequency: 0,
      });
    }

    const user = userMap.get(key);
    if (schedule) {
      user.regularSchedule.push(schedule);
      user.frequency = user.regularSchedule.length;
    }
  });

  return { data: Array.from(userMap.values()), errors };
}

/** BOM付きUTF-8 CSVをブラウザダウンロード */
export function downloadCsv(filename, content) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
