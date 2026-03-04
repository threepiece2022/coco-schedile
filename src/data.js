export const DEFAULT_STAFF = [
  { id: 1, name: "田中 看護師", role: "看護師" },
  { id: 2, name: "佐藤 看護師", role: "看護師" },
  { id: 3, name: "鈴木 PT", role: "理学療法士" },
  { id: 4, name: "高橋 OT", role: "作業療法士" },
  { id: 5, name: "伊藤 看護師", role: "看護師" },
  { id: 6, name: "渡辺 看護師", role: "看護師" },
  { id: 7, name: "山本 ST", role: "言語聴覚士" },
  { id: 8, name: "中村 看護師", role: "看護師" },
];

const STAFF_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#be185d", "#4f46e5"];
export const getStaffColor = (staffId) => STAFF_COLORS[(staffId - 1) % STAFF_COLORS.length] || "#94a3b8";

export const DEFAULT_AREAS = ["柏エリア", "高塚エリア", "松戸エリア"];
export const USER_STATUSES = ["利用中", "中止中", "終了"];

export const SERVICE_CODES = {
  kaigo: [
    { code: "1311", short: "訪看Ⅰ1", label: "訪看Ⅰ1（20分未満）", insurance: "介護", duration: 0.5 },
    { code: "1312", short: "訪看Ⅰ2", label: "訪看Ⅰ2（30分未満）", insurance: "介護", duration: 0.5 },
    { code: "1313", short: "訪看Ⅰ3", label: "訪看Ⅰ3（30分〜1時間未満）", insurance: "介護", duration: 1 },
    { code: "1314", short: "訪看Ⅰ4", label: "訪看Ⅰ4（1時間〜1時間半未満）", insurance: "介護", duration: 1.5 },
    { code: "1315", short: "訪看Ⅰ5", label: "訪看Ⅰ5（理学療法士等・20分）", insurance: "介護", duration: 0.5 },
    { code: "1316", short: "訪看Ⅰ5-2", label: "訪看Ⅰ5-2（理学療法士等・40分）", insurance: "介護", duration: 2/3 },
    { code: "1317", short: "訪看Ⅰ5-2超", label: "訪看Ⅰ5-2超（理学療法士等・60分）", insurance: "介護", duration: 1.5 },
    { code: "1411", short: "予防Ⅰ1", label: "予防訪看Ⅰ1（20分未満）", insurance: "介護", duration: 0.5 },
    { code: "1412", short: "予防Ⅰ2", label: "予防訪看Ⅰ2（30分未満）", insurance: "介護", duration: 0.5 },
    { code: "1413", short: "予防Ⅰ3", label: "予防訪看Ⅰ3（30分〜1時間未満）", insurance: "介護", duration: 1 },
    { code: "1414", short: "予防訪看Ⅰ5", label: "予防訪看Ⅰ5（理学療法士等・20分）", insurance: "介護", duration: 0.5 },
    { code: "1415", short: "予防訪看Ⅰ5-2", label: "予防訪看Ⅰ5-2（理学療法士等・40分）", insurance: "介護", duration: 2/3 },
    { code: "1416", short: "予防訪看Ⅰ5-2超", label: "予防訪看Ⅰ5-2超（理学療法士等・60分）", insurance: "介護", duration: 1.5 },
  ],
  iryo: [
    { code: "C005", short: "基本療養費Ⅰ", label: "訪問看護基本療養費(Ⅰ)", insurance: "医療", duration: 1.5 },
    { code: "C005-2", short: "基本療養費Ⅱ", label: "訪問看護基本療養費(Ⅱ)", insurance: "医療", duration: 1.5 },
    { code: "C006", short: "精神科基本", label: "精神科訪問看護基本療養費", insurance: "医療", duration: 1.5 },
    { code: "C007", short: "管理療養費", label: "訪問看護管理療養費", insurance: "医療", duration: 1 },
    { code: "C008", short: "情報提供", label: "訪問看護情報提供療養費", insurance: "医療", duration: 1 },
    { code: "C009", short: "ターミナル", label: "訪問看護ターミナルケア療養費", insurance: "医療", duration: 1.5 },
    { code: "C010", short: "24h加算", label: "24時間対応体制加算", insurance: "医療", duration: 1 },
    { code: "C011", short: "特別管理", label: "特別管理加算", insurance: "医療", duration: 1 },
  ],
};

export const ALL_CODES = [...SERVICE_CODES.kaigo, ...SERVICE_CODES.iryo];

/** サービスコードからデフォルトdurationを取得 */
export const getCodeDuration = (code) => ALL_CODES.find((c) => c.code === code)?.duration ?? 1;

/** サービスコードから短縮表示名を取得 */
export const getCodeShort = (code) => ALL_CODES.find((c) => c.code === code)?.short ?? code;

/** 短縮名またはコード番号からサービスコード情報を取得（ラベル前方一致にもフォールバック） */
export const getCodeByShort = (shortName) =>
  ALL_CODES.find((c) => c.short === shortName || c.code === shortName)
  ?? ALL_CODES.find((c) => c.label.startsWith(shortName))
  ?? null;

export const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8:00-17:00
export const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
export const DAY_FULL = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"];

const ADDRESSES = [
  "柏市柏1-1-1", "柏市柏2-3-5", "柏市豊四季101-2", "柏市南柏3-8-1", "柏市増尾5-2-3",
  "柏市光ヶ丘2-1-8", "柏市松葉町4-5", "柏市北柏1-7-3", "柏市高田100-5", "柏市逆井3-2-1",
  "柏市大室1-15-2", "柏市花野井500-3", "柏市若柴178-4", "柏市十余二200-1", "柏市高柳1-3-5",
  "松戸市松戸1-1-1", "松戸市新松戸3-5-2", "松戸市五香4-8-1", "松戸市常盤平2-3-7", "松戸市馬橋100-2",
];

// 看護スタッフID: 1(田中), 2(佐藤), 5(伊藤), 6(渡辺), 8(中村)
// リハスタッフID: 3(鈴木PT), 4(高橋OT), 7(山本ST)
const NS = [1, 2, 5, 6, 8];
const RH = [3, 4, 7];

const s13 = (sid, day, hour) => ({ day, hour, staffId: sid, serviceCode: "1313", serviceLabel: "訪看Ⅰ3（30分〜1時間未満）", insuranceType: "介護", duration: 1 });
const s14 = (sid, day, hour) => ({ day, hour, staffId: sid, serviceCode: "1314", serviceLabel: "訪看Ⅰ4（1時間〜1時間半未満）", insuranceType: "介護", duration: 1.5 });
const s12 = (sid, day, hour) => ({ day, hour, staffId: sid, serviceCode: "1312", serviceLabel: "訪看Ⅰ2（30分未満）", insuranceType: "介護", duration: 0.5 });
const r16 = (sid, day, hour) => ({ day, hour, staffId: sid, serviceCode: "1316", serviceLabel: "訪看Ⅰ5-2（理学療法士等・40分）", insuranceType: "介護", duration: 2/3 });
const r15 = (sid, day, hour) => ({ day, hour, staffId: sid, serviceCode: "1315", serviceLabel: "訪看Ⅰ5（理学療法士等・20分）", insuranceType: "介護", duration: 0.5 });
const mC5 = (sid, day, hour) => ({ day, hour, staffId: sid, serviceCode: "C005", serviceLabel: "訪問看護基本療養費(Ⅰ)", insuranceType: "医療", duration: 1.5 });
const p13 = (sid, day, hour) => ({ day, hour, staffId: sid, serviceCode: "1413", serviceLabel: "予防訪看Ⅰ3（30分〜1時間未満）", insuranceType: "介護", duration: 1 });
const p14 = (sid, day, hour) => ({ day, hour, staffId: sid, serviceCode: "1414", serviceLabel: "予防訪看Ⅰ5（理学療法士等・20分）", insuranceType: "介護", duration: 0.5 });

const MOCK_USERS = [
  // ========== 看護のみ（20名）==========
  { name: "山田 太郎", address: "柏市柏1-2-3", area: "柏エリア", ins: "介護", staffId: 1, notes: "独居・見守り強化",
    sched: [s13(1, 0, 9), s13(1, 3, 9)] },
  { name: "鈴木 花子", address: "柏市豊四季101-5", area: "柏エリア", ins: "介護", staffId: 2, notes: "",
    sched: [s13(2, 1, 10), s13(2, 4, 10)] },
  { name: "佐藤 一郎", address: "柏市南柏3-8-1", area: "柏エリア", ins: "医療", staffId: 5, notes: "医療処置あり・在宅酸素",
    sched: [mC5(5, 0, 10), mC5(5, 2, 10), mC5(5, 4, 10)] },
  { name: "高橋 美智子", address: "柏市増尾5-2-3", area: "高塚エリア", ins: "介護", staffId: 6, notes: "",
    sched: [s14(6, 1, 9), s14(6, 4, 9)] },
  { name: "田中 正男", address: "柏市光ヶ丘2-1-8", area: "高塚エリア", ins: "介護", staffId: 1, notes: "認知症あり",
    sched: [s13(1, 2, 14)] },
  { name: "渡辺 幸子", address: "柏市松葉町4-5", area: "柏エリア", ins: "介護", staffId: 8, notes: "",
    sched: [s13(8, 0, 11), s13(8, 3, 11)] },
  { name: "伊藤 義雄", address: "柏市北柏1-7-3", area: "柏エリア", ins: "医療", staffId: 2, notes: "ターミナル期",
    sched: [mC5(2, 0, 14), mC5(2, 2, 14), mC5(2, 4, 14)] },
  { name: "小林 千代", address: "柏市高田100-5", area: "高塚エリア", ins: "介護", staffId: 6, notes: "独居",
    sched: [s13(6, 0, 13), s13(6, 3, 13)] },
  { name: "中村 健二", address: "柏市逆井3-2-1", area: "高塚エリア", ins: "介護", staffId: 1, notes: "",
    sched: [s12(1, 1, 14)] },
  { name: "加藤 静子", address: "柏市大室1-15-2", area: "高塚エリア", ins: "介護", staffId: 5, notes: "糖尿病管理",
    sched: [s13(5, 2, 9), s13(5, 4, 9)] },
  { name: "吉田 勇", address: "松戸市松戸1-1-1", area: "松戸エリア", ins: "医療", staffId: 8, notes: "医療処置あり",
    sched: [mC5(8, 1, 9), mC5(8, 3, 9)] },
  { name: "山口 芳子", address: "松戸市新松戸3-5-2", area: "松戸エリア", ins: "介護", staffId: 6, notes: "",
    sched: [s13(6, 2, 11)] },
  { name: "松本 清", address: "松戸市五香4-8-1", area: "松戸エリア", ins: "介護", staffId: 2, notes: "転倒リスク高",
    sched: [s14(2, 0, 15), s14(2, 3, 15)] },
  { name: "井上 節子", address: "柏市花野井500-3", area: "柏エリア", ins: "介護", staffId: 5, notes: "",
    sched: [s13(5, 1, 13)] },
  { name: "木村 茂", address: "柏市若柴178-4", area: "柏エリア", ins: "介護", staffId: 1, notes: "",
    sched: [s12(1, 0, 16), s12(1, 2, 16)] },
  { name: "林 和子", address: "柏市十余二200-1", area: "柏エリア", ins: "介護", staffId: 8, notes: "褥瘡処置",
    sched: [s13(8, 1, 11), s13(8, 4, 11)] },
  { name: "斎藤 隆", address: "柏市高柳1-3-5", area: "高塚エリア", ins: "介護", staffId: 6, notes: "",
    sched: [s13(6, 3, 10)] },
  { name: "森田 光子", address: "松戸市常盤平2-3-7", area: "松戸エリア", ins: "介護", staffId: 2, notes: "独居・見守り強化",
    sched: [s13(2, 2, 13), s13(2, 4, 13)] },
  { name: "清水 進", address: "松戸市馬橋100-2", area: "松戸エリア", ins: "医療", staffId: 5, notes: "点滴管理",
    sched: [mC5(5, 1, 14), mC5(5, 4, 14)] },
  { name: "藤田 敏子", address: "柏市柏2-3-5", area: "柏エリア", ins: "介護", staffId: 1, notes: "",
    sched: [s13(1, 1, 9)] },

  // ========== リハビリのみ（15名）==========
  { name: "阿部 正", address: "柏市柏1-5-10", area: "柏エリア", ins: "介護", staffId: 3, notes: "脳梗塞後・歩行訓練",
    sched: [r16(3, 0, 9), r16(3, 3, 9)] },
  { name: "岡田 久美子", address: "柏市豊四季200-8", area: "柏エリア", ins: "介護", staffId: 4, notes: "骨折後リハ",
    sched: [r16(4, 1, 10), r16(4, 4, 10)] },
  { name: "石井 達也", address: "柏市南柏2-4-6", area: "柏エリア", ins: "介護", staffId: 3, notes: "",
    sched: [r16(3, 2, 14), r16(3, 4, 14)] },
  { name: "前田 美代子", address: "柏市増尾3-7-1", area: "高塚エリア", ins: "介護", staffId: 7, notes: "嚥下訓練",
    sched: [r15(7, 0, 11), r15(7, 2, 11), r15(7, 4, 11)] },
  { name: "上田 修", address: "柏市光ヶ丘1-3-2", area: "高塚エリア", ins: "介護", staffId: 4, notes: "パーキンソン病",
    sched: [r16(4, 0, 13), r16(4, 3, 13)] },
  { name: "横山 智子", address: "柏市松葉町2-8", area: "柏エリア", ins: "介護", staffId: 3, notes: "",
    sched: [r16(3, 1, 11)] },
  { name: "金子 実", address: "柏市北柏3-2-1", area: "柏エリア", ins: "介護", staffId: 4, notes: "大腿骨骨折後",
    sched: [r16(4, 2, 9), r16(4, 4, 9)] },
  { name: "小川 裕子", address: "柏市高田50-3", area: "高塚エリア", ins: "介護", staffId: 7, notes: "構音障害",
    sched: [r15(7, 1, 14), r15(7, 3, 14)] },
  { name: "長谷川 誠", address: "柏市逆井1-8-5", area: "高塚エリア", ins: "介護", staffId: 3, notes: "",
    sched: [r16(3, 0, 15)] },
  { name: "原田 恵子", address: "松戸市松戸3-2-7", area: "松戸エリア", ins: "介護", staffId: 4, notes: "関節拘縮予防",
    sched: [r16(4, 0, 10), r16(4, 2, 10)] },
  { name: "宮崎 博", address: "松戸市新松戸1-9-3", area: "松戸エリア", ins: "介護", staffId: 3, notes: "",
    sched: [r16(3, 1, 15), r16(3, 4, 15)] },
  { name: "近藤 洋子", address: "松戸市五香2-1-4", area: "松戸エリア", ins: "介護", staffId: 7, notes: "失語症リハ",
    sched: [r15(7, 0, 14), r15(7, 3, 15)] },
  { name: "安田 力", address: "柏市大室2-3-1", area: "高塚エリア", ins: "介護", staffId: 3, notes: "廃用症候群",
    sched: [r16(3, 3, 11)] },
  { name: "坂本 綾子", address: "柏市花野井300-1", area: "柏エリア", ins: "介護", staffId: 4, notes: "",
    sched: [p14(4, 1, 13), p14(4, 3, 11)] },
  { name: "池田 英明", address: "柏市若柴50-2", area: "柏エリア", ins: "介護", staffId: 3, notes: "脊柱管狭窄症",
    sched: [r16(3, 2, 11), r16(3, 4, 11)] },

  // ========== 看護＋リハビリ両方（25名）==========
  { name: "武田 和夫", address: "柏市柏3-1-8", area: "柏エリア", ins: "介護", staffId: 1, notes: "脳梗塞後・看護＋PT",
    sched: [s13(1, 0, 9), r16(3, 2, 9), s13(1, 4, 9)] },
  { name: "西村 厚子", address: "柏市豊四季50-1", area: "柏エリア", ins: "介護", staffId: 2, notes: "",
    sched: [s13(2, 1, 10), r16(4, 3, 10)] },
  { name: "三浦 孝", address: "柏市南柏1-6-3", area: "柏エリア", ins: "医療", staffId: 5, notes: "医療処置あり・リハ併用",
    sched: [mC5(5, 0, 10), r16(3, 2, 10), mC5(5, 4, 10)] },
  { name: "福田 玲子", address: "柏市増尾1-4-2", area: "高塚エリア", ins: "介護", staffId: 6, notes: "認知症・転倒予防",
    sched: [s13(6, 0, 14), r16(4, 2, 14), s13(6, 4, 14)] },
  { name: "太田 昭雄", address: "柏市光ヶ丘3-5-1", area: "高塚エリア", ins: "介護", staffId: 8, notes: "",
    sched: [s13(8, 1, 9), r16(3, 3, 9)] },
  { name: "河野 富子", address: "柏市松葉町1-3", area: "柏エリア", ins: "介護", staffId: 1, notes: "骨折後・看護＋OT",
    sched: [s14(1, 0, 13), r16(4, 2, 13)] },
  { name: "杉山 信", address: "柏市北柏2-5-8", area: "柏エリア", ins: "介護", staffId: 2, notes: "",
    sched: [s13(2, 2, 11), r15(7, 4, 11)] },
  { name: "北村 幸恵", address: "柏市高田200-1", area: "高塚エリア", ins: "介護", staffId: 5, notes: "嚥下障害・看護＋ST",
    sched: [s13(5, 1, 14), r15(7, 3, 9)] },
  { name: "平野 忠", address: "柏市逆井2-6-3", area: "高塚エリア", ins: "介護", staffId: 6, notes: "",
    sched: [s13(6, 0, 10), r16(3, 1, 13), s13(6, 3, 10)] },
  { name: "久保田 文子", address: "柏市大室3-8-2", area: "高塚エリア", ins: "介護", staffId: 8, notes: "心不全管理",
    sched: [s13(8, 2, 9), r16(4, 4, 13)] },
  { name: "野村 正義", address: "松戸市松戸2-5-1", area: "松戸エリア", ins: "介護", staffId: 1, notes: "脳出血後",
    sched: [s13(1, 1, 15), r16(3, 3, 14), s13(1, 4, 15)] },
  { name: "大塚 恵美", address: "松戸市新松戸2-7-4", area: "松戸エリア", ins: "介護", staffId: 2, notes: "",
    sched: [s13(2, 0, 11), r16(4, 3, 14)] },
  { name: "今井 弘", address: "松戸市五香1-3-9", area: "松戸エリア", ins: "医療", staffId: 5, notes: "気管切開・リハ併用",
    sched: [mC5(5, 1, 11), r15(7, 2, 14), mC5(5, 4, 11)] },
  { name: "片山 洋子", address: "松戸市常盤平1-2-5", area: "松戸エリア", ins: "介護", staffId: 6, notes: "",
    sched: [s13(6, 1, 13), r16(3, 4, 13)] },
  { name: "萩原 功", address: "松戸市馬橋50-1", area: "松戸エリア", ins: "介護", staffId: 8, notes: "パーキンソン病・看護＋PT",
    sched: [s14(8, 0, 9), r16(3, 2, 15), s14(8, 3, 9)] },
  { name: "矢野 春子", address: "柏市柏4-2-1", area: "柏エリア", ins: "介護", staffId: 1, notes: "褥瘡処置・リハ併用",
    sched: [s13(1, 2, 10), r16(4, 4, 10)] },
  { name: "堀内 勝", address: "柏市豊四季300-2", area: "柏エリア", ins: "介護", staffId: 2, notes: "",
    sched: [s13(2, 0, 16), r16(3, 3, 16)] },
  { name: "内田 千恵", address: "柏市南柏4-1-7", area: "柏エリア", ins: "介護", staffId: 5, notes: "関節リウマチ",
    sched: [s13(5, 0, 11), r16(4, 1, 11), s13(5, 3, 11)] },
  { name: "関根 浩一", address: "柏市増尾2-9-4", area: "高塚エリア", ins: "介護", staffId: 6, notes: "",
    sched: [s12(6, 1, 16), r15(7, 4, 16)] },
  { name: "本田 秀美", address: "柏市光ヶ丘1-7-3", area: "高塚エリア", ins: "医療", staffId: 8, notes: "中心静脈栄養・リハ併用",
    sched: [mC5(8, 0, 14), r16(3, 2, 13), mC5(8, 4, 14)] },
  { name: "菊地 辰夫", address: "柏市松葉町3-1", area: "柏エリア", ins: "介護", staffId: 1, notes: "ALS・看護＋ST",
    sched: [s14(1, 1, 9), r15(7, 3, 13), s14(1, 4, 9)] },
  { name: "村上 和代", address: "柏市北柏4-3-2", area: "柏エリア", ins: "介護", staffId: 2, notes: "",
    sched: [s13(2, 0, 13), r16(4, 2, 15)] },
  { name: "浜田 健一", address: "柏市高田30-8", area: "高塚エリア", ins: "介護", staffId: 6, notes: "脊髄損傷",
    sched: [s14(6, 1, 10), r16(3, 3, 10), r16(4, 4, 10)] },
  { name: "増田 富美", address: "松戸市松戸5-1-2", area: "松戸エリア", ins: "介護", staffId: 5, notes: "",
    sched: [s13(5, 0, 15), r16(4, 2, 11)] },
  { name: "谷口 昇", address: "松戸市新松戸4-2-1", area: "松戸エリア", ins: "介護", staffId: 8, notes: "COPD・呼吸リハ",
    sched: [s13(8, 1, 15), r16(3, 3, 15), s13(8, 4, 16)] },
];

export const INITIAL_USERS = MOCK_USERS.map((u, i) => {
  const firstSched = u.sched[0];
  return {
    id: i + 1,
    name: u.name,
    nameKana: "",
    address: u.address,
    area: u.area,
    insuranceType: u.ins,
    serviceCode: firstSched.serviceCode,
    serviceLabel: firstSched.serviceLabel,
    frequency: u.sched.length,
    regularSchedule: u.sched,
    staffId: u.staffId,
    notes: u.notes,
    status: "利用中",
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
