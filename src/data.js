export const STAFF = [
  { id: 1, name: "田中 看護師", color: "#2563eb", role: "看護師" },
  { id: 2, name: "佐藤 看護師", color: "#7c3aed", role: "看護師" },
  { id: 3, name: "鈴木 PT", color: "#059669", role: "理学療法士" },
  { id: 4, name: "高橋 OT", color: "#d97706", role: "作業療法士" },
  { id: 5, name: "伊藤 看護師", color: "#dc2626", role: "看護師" },
  { id: 6, name: "渡辺 看護師", color: "#0891b2", role: "看護師" },
  { id: 7, name: "山本 ST", color: "#be185d", role: "言語聴覚士" },
  { id: 8, name: "中村 看護師", color: "#4f46e5", role: "看護師" },
];

export const SERVICE_CODES = {
  kaigo: [
    { code: "1311", label: "訪看I1（20分未満）", insurance: "介護", duration: 0.5 },
    { code: "1312", label: "訪看I2（30分未満）", insurance: "介護", duration: 0.5 },
    { code: "1313", label: "訪看I3（30分〜1時間未満）", insurance: "介護", duration: 1 },
    { code: "1314", label: "訪看I4（1時間〜1時間半未満）", insurance: "介護", duration: 1.5 },
    { code: "1315", label: "訪看I5（理学療法士等・20分）", insurance: "介護", duration: 0.5 },
    { code: "1316", label: "訪看I5-2（理学療法士等・40分）", insurance: "介護", duration: 1 },
    { code: "1411", label: "予防訪看I1（20分未満）", insurance: "介護", duration: 0.5 },
    { code: "1412", label: "予防訪看I2（30分未満）", insurance: "介護", duration: 0.5 },
    { code: "1413", label: "予防訪看I3（30分〜1時間未満）", insurance: "介護", duration: 1 },
    { code: "1414", label: "予防訪看I5（理学療法士等・20分）", insurance: "介護", duration: 0.5 },
  ],
  iryo: [
    { code: "C005", label: "訪問看護基本療養費(I)", insurance: "医療", duration: 1.5 },
    { code: "C005-2", label: "訪問看護基本療養費(II)", insurance: "医療", duration: 1.5 },
    { code: "C006", label: "精神科訪問看護基本療養費", insurance: "医療", duration: 1.5 },
    { code: "C007", label: "訪問看護管理療養費", insurance: "医療", duration: 1 },
    { code: "C008", label: "訪問看護情報提供療養費", insurance: "医療", duration: 1 },
    { code: "C009", label: "訪問看護ターミナルケア療養費", insurance: "医療", duration: 1.5 },
    { code: "C010", label: "24時間対応体制加算", insurance: "医療", duration: 1 },
    { code: "C011", label: "特別管理加算", insurance: "医療", duration: 1 },
  ],
};

export const ALL_CODES = [...SERVICE_CODES.kaigo, ...SERVICE_CODES.iryo];

/** サービスコードからデフォルトdurationを取得 */
export const getCodeDuration = (code) => ALL_CODES.find((c) => c.code === code)?.duration ?? 1;

export const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8:00-17:00
export const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
export const DAY_FULL = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"];

const ADDRESSES = [
  "柏市柏1-1-1", "柏市柏2-3-5", "柏市豊四季101-2", "柏市南柏3-8-1", "柏市増尾5-2-3",
  "柏市光ヶ丘2-1-8", "柏市松葉町4-5", "柏市北柏1-7-3", "柏市高田100-5", "柏市逆井3-2-1",
  "柏市大室1-15-2", "柏市花野井500-3", "柏市若柴178-4", "柏市十余二200-1", "柏市高柳1-3-5",
  "松戸市松戸1-1-1", "松戸市新松戸3-5-2", "松戸市五香4-8-1", "松戸市常盤平2-3-7", "松戸市馬橋100-2",
];

const REGULAR_PATTERNS = [
  [{ day: 0, hour: 9 }],
  [{ day: 1, hour: 10 }],
  [{ day: 2, hour: 14 }],
  [{ day: 0, hour: 9 }, { day: 3, hour: 14 }],
  [{ day: 1, hour: 10 }, { day: 4, hour: 10 }],
  [{ day: 0, hour: 9 }, { day: 2, hour: 13 }, { day: 4, hour: 9 }],
  [{ day: 1, hour: 11 }, { day: 3, hour: 11 }],
  [{ day: 0, hour: 14 }, { day: 2, hour: 14 }, { day: 4, hour: 14 }],
];

export const INITIAL_USERS = Array.from({ length: 80 }, (_, i) => {
  const ins = i % 5 === 0 ? "医療" : "介護";
  const codes = ins === "介護" ? SERVICE_CODES.kaigo : SERVICE_CODES.iryo;
  const sc = codes[i % codes.length];
  const pat = REGULAR_PATTERNS[i % REGULAR_PATTERNS.length];
  const defaultStaffId = STAFF[i % STAFF.length].id;
  return {
    id: i + 1,
    name: `利用者${String(i + 1).padStart(3, "0")}`,
    address: ADDRESSES[i % ADDRESSES.length],
    area: ["柏エリア", "高塚エリア", "松戸エリア"][i % 3],
    insuranceType: ins,
    serviceCode: sc.code,
    serviceLabel: sc.label,
    frequency: pat.length,
    regularSchedule: pat.map((p, idx) => {
      const sid = STAFF[(i + idx) % STAFF.length].id;
      const entryIns = idx % 3 === 0 ? ins : ins; // keep same insurance by default
      const entryCodes = entryIns === "介護" ? SERVICE_CODES.kaigo : SERVICE_CODES.iryo;
      const entrySc = entryCodes[(i + idx) % entryCodes.length];
      return { ...p, staffId: sid, serviceCode: entrySc.code, serviceLabel: entrySc.label, insuranceType: entryIns, duration: entrySc.duration };
    }),
    staffId: defaultStaffId,
    notes: i % 7 === 0 ? "独居・見守り強化" : i % 5 === 0 ? "医療処置あり" : "",
  };
});

export function generateVisits(usersData) {
  const v = [];
  let id = 1;
  usersData.forEach((u) => {
    u.regularSchedule.forEach((s) => {
      const staffId = s.staffId ?? u.staffId;
      const serviceCode = s.serviceCode ?? u.serviceCode;
      const serviceLabel = s.serviceLabel ?? u.serviceLabel;
      const insuranceType = s.insuranceType ?? u.insuranceType;
      const duration = s.duration ?? getCodeDuration(serviceCode);
      v.push({
        id: id++,
        staffId,
        userId: u.id,
        userName: u.name,
        area: u.area,
        day: s.day,
        startHour: s.hour,
        duration,
        type: serviceLabel.includes("理学") ? "リハビリ" : insuranceType === "医療" ? "医療訪問看護" : "訪問看護",
        serviceCode,
        insuranceType,
        status: "予定",
      });
    });
  });
  return v;
}
