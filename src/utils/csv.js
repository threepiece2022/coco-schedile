import { ALL_CODES, DAYS, getCodeShort, getCodeByShort } from "../data.js";

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
export function generateStaffCsv(staff) {
  const header = ["ID", "名前", "役職"];
  const lines = [header.map(csvEscape).join(",")];
  for (const s of staff) {
    lines.push([s.id, s.name, s.role].map(csvEscape).join(","));
  }
  return lines.join("\n");
}

/** 職員CSVをパースしバリデーション */
export function parseStaffCsv(text) {
  const { rows } = parseCsv(text);
  if (rows.length === 0) return { data: [], errors: [{ row: 0, message: "データ行がありません" }] };

  const VALID_ROLES = ["看護師", "理学療法士", "作業療法士", "言語聴覚士"];
  const errors = [];
  const data = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const get = (i) => (row[i] || "").trim();
    const idRaw = get(0);
    const name = get(1);
    const role = get(2);

    const rowErrors = [];
    if (!name) rowErrors.push("名前が空です");
    if (!role) rowErrors.push("役職が空です");
    else if (!VALID_ROLES.includes(role)) rowErrors.push(`役職「${role}」は無効です（${VALID_ROLES.join("/")}）`);

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join("; ") });
      return;
    }

    const id = idRaw ? parseInt(idRaw, 10) : null;
    data.push({ id: isNaN(id) ? null : id, name, role });
  });

  return { data, errors };
}

/** 利用者・スケジュールCSV生成（新12列フォーマット、1行=1スケジュール） */
export function generateUsersCsv(usersData) {
  const header = [
    "利用者名", "フリガナ", "住所", "エリア", "備考", "ステータス",
    "訪問曜日", "開始時間", "担当者ID", "サービスコード", "保険種別", "時間(分)",
  ];
  const lines = [header.map(csvEscape).join(",")];
  for (const u of usersData) {
    if (!u.regularSchedule || u.regularSchedule.length === 0) {
      lines.push([
        u.name, u.nameKana || "", u.address, u.area, u.notes || "", u.status || "利用中",
        "", "", "", "", "", "",
      ].map(csvEscape).join(","));
    } else {
      for (const s of u.regularSchedule) {
        lines.push([
          u.name, u.nameKana || "", u.address, u.area, u.notes || "", u.status || "利用中",
          DAYS[s.day], s.hour, s.staffId,
          getCodeShort(s.serviceCode),
          s.insuranceType, Math.round(s.duration * 60),
        ].map(csvEscape).join(","));
      }
    }
  }
  return lines.join("\n");
}

/** 利用者CSVをパースしバリデーション（新12列フォーマット） */
export function parseUsersCsv(text, validAreas, staff) {
  const { headers, rows } = parseCsv(text);
  if (rows.length === 0) return { data: [], errors: [{ row: 0, message: "データ行がありません" }] };

  if (!validAreas) validAreas = ["柏エリア", "高塚エリア", "松戸エリア"];
  const validIns = ["介護", "医療"];
  const validStaffIds = new Set((staff || []).map((s) => s.id));
  const validDays = new Set(DAYS);

  const errors = [];
  const userMap = new Map(); // "name|address" -> user object

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const rowErrors = [];

    const get = (i) => (row[i] || "").trim();
    const name = get(0);
    const nameKana = get(1);
    const address = get(2);
    const area = get(3);
    const notes = get(4);
    const status = get(5);
    const visitDay = get(6);
    const startHour = get(7) ? parseFloat(get(7)) : null;
    const staffId = get(8) ? parseInt(get(8), 10) : null;
    const serviceCodeRaw = get(9);
    const ins = get(10);
    const durationMin = get(11) ? parseFloat(get(11)) : null;

    // 利用者フィールドのバリデーション
    if (!name) rowErrors.push("利用者名が空です");
    if (!address) rowErrors.push("住所が空です");
    if (area && !validAreas.includes(area)) rowErrors.push(`エリア「${area}」は無効です`);

    // サービスコード解決: 短縮名 → コード番号（フォールバック: コード番号直接指定）
    let resolvedCode = null;
    if (serviceCodeRaw) {
      const codeInfo = getCodeByShort(serviceCodeRaw);
      if (codeInfo) {
        resolvedCode = codeInfo;
      } else {
        rowErrors.push(`サービスコード「${serviceCodeRaw}」は無効です`);
      }
    }

    if (ins && !validIns.includes(ins)) rowErrors.push(`保険種別「${ins}」は無効です`);
    if (staffId != null && !validStaffIds.has(staffId)) rowErrors.push(`担当者ID「${staffId}」は無効です`);

    // 訪問スケジュールのバリデーション
    let schedule = null;
    if (visitDay) {
      if (!validDays.has(visitDay)) {
        rowErrors.push(`訪問曜日「${visitDay}」は無効です`);
      } else if (startHour == null || startHour < 8 || startHour > 17) {
        rowErrors.push(`開始時間「${get(7)}」は8〜17の数値が必要です`);
      } else if (durationMin != null && durationMin <= 0) {
        rowErrors.push(`時間「${durationMin}」は正の数値が必要です`);
      } else if (resolvedCode || !serviceCodeRaw) {
        const codeInfo = resolvedCode || ALL_CODES.find((c) => c.code === "1313");
        const duration = durationMin ? durationMin / 60 : codeInfo?.duration || 1;
        schedule = {
          day: DAYS.indexOf(visitDay),
          hour: startHour,
          staffId: staffId || 1,
          serviceCode: codeInfo?.code || "1313",
          serviceLabel: codeInfo?.label || "",
          insuranceType: ins || codeInfo?.insurance || "介護",
          duration,
        };
      }
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join("; ") });
      return;
    }

    // ユーザーのグループ化（name + address でグループ化）
    const key = `${name}|${address}`;
    if (!userMap.has(key)) {
      userMap.set(key, {
        name,
        nameKana: nameKana || "",
        address,
        area: area || "柏エリア",
        notes: notes || "",
        status: status || "利用中",
        insuranceType: "",
        serviceCode: "",
        serviceLabel: "",
        staffId: 1,
        regularSchedule: [],
        frequency: 0,
      });
    }

    const user = userMap.get(key);
    if (schedule) {
      user.regularSchedule.push(schedule);
      user.frequency = user.regularSchedule.length;
      // user-levelフィールドを最初のスケジュールから導出
      if (user.regularSchedule.length === 1) {
        user.insuranceType = schedule.insuranceType;
        user.serviceCode = schedule.serviceCode;
        user.serviceLabel = schedule.serviceLabel;
        user.staffId = schedule.staffId;
      }
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
