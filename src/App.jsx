import { useState, useCallback } from "react";
import { STAFF, SERVICE_CODES, ALL_CODES, HOURS, DAYS, INITIAL_USERS, generateVisits, getCodeDuration } from "./data.js";
import { InsBadge, StBadge } from "./components/ui.jsx";
import { lbl, sty, navBtn } from "./styles.js";
import UserDetailPanel from "./components/UserDetailPanel.jsx";
import AddUserModal from "./components/AddUserModal.jsx";
import AvailabilityPanel from "./components/AvailabilityPanel.jsx";
import RegularSchedulePanel from "./components/RegularSchedulePanel.jsx";

const VCard = ({ visit, staff, isDrag, onDS, onEdit, flexMode }) => {
  const h = visit.duration * 56 - 4;
  const m = visit.insuranceType === "医療";
  return (
    <div draggable onDragStart={(e) => onDS(e, visit)} onClick={() => onEdit(visit)}
      style={{
        ...(flexMode
          ? { flex: "1 1 0", minWidth: 0, height: h }
          : { position: "absolute", top: 2, left: 2, right: 2, height: h }),
        background: m ? `linear-gradient(135deg, #fef3c710, ${staff.color}08)` : `linear-gradient(135deg, ${staff.color}14, ${staff.color}06)`,
        border: `1.5px solid ${staff.color}35`, borderLeft: `3px solid ${m ? "#d97706" : staff.color}`,
        borderRadius: 6, padding: "3px 6px", cursor: "grab", opacity: isDrag ? 0.35 : 1,
        transition: "box-shadow 0.15s, transform 0.15s", overflow: "hidden", zIndex: isDrag ? 100 : 1, fontSize: 11,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 2px 8px ${staff.color}25`; e.currentTarget.style.transform = "scale(1.02)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 3, lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700, color: staff.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: flexMode ? 9 : 11 }}>{flexMode ? visit.userName.slice(-3) : visit.userName}</span>
        <InsBadge type={visit.insuranceType} />
      </div>
      {!flexMode && visit.duration >= 1 && (
        <div style={{ display: "flex", gap: 3, alignItems: "center", marginTop: 2 }}>
          <span style={{ color: "#94a3b8", fontSize: 9 }}>{visit.serviceCode}</span>
          <StBadge status={visit.status} />
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [visits, setVisits] = useState(() => generateVisits(INITIAL_USERS));
  const [viewMode, setViewMode] = useState("staff");
  const [selStaff, setSelStaff] = useState(null);
  const [selUser, setSelUser] = useState(null);
  const [dragV, setDragV] = useState(null);
  const [editV, setEditV] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [wOff, setWOff] = useState(0);
  const [insF, setInsF] = useState("all");
  const [showAvail, setShowAvail] = useState(true);
  const [regSchedOpen, setRegSchedOpen] = useState(false);

  const today = new Date();
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7) + wOff * 7);
  const wDates = DAYS.map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  const wLabel = `${mon.getFullYear()}年${mon.getMonth() + 1}月${mon.getDate()}日〜`;
  const todayDow = (today.getDay() + 6) % 7;

  const fv = visits.filter((v) => {
    if (insF !== "all" && v.insuranceType !== insF) return false;
    if (viewMode === "staff" && selStaff) return v.staffId === selStaff;
    if (viewMode === "user" && selUser) return v.userId === selUser;
    return true;
  });

  const fUsers = users.filter((u) =>
    (u.name.includes(search) || u.area.includes(search) || u.address.includes(search) || u.serviceCode.includes(search)) &&
    (insF === "all" || u.insuranceType === insF)
  );

  const onDS = useCallback((e, v) => { setDragV(v); e.dataTransfer.effectAllowed = "move"; }, []);
  const onDrop = useCallback((e, day, hour, sid) => {
    e.preventDefault(); if (!dragV) return;
    setVisits((p) => p.map((v) => v.id === dragV.id ? { ...v, day, startHour: hour, ...(sid ? { staffId: sid } : {}) } : v));
    setDragV(null);
  }, [dragV]);

  const save = () => { if (!editV) return; setVisits((p) => p.map((v) => v.id === editV.id ? editV : v)); setEditV(null); };
  const del = () => { if (!editV) return; setVisits((p) => p.filter((v) => v.id !== editV.id)); setEditV(null); };
  const getCell = (d, h, sid) => fv.filter((v) => v.day === d && v.startHour === h && (sid == null || v.staffId === sid));

  const addUser = (form) => {
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser = { ...form, id: newId };
    setUsers((prev) => [...prev, newUser]);
    const newVisits = form.regularSchedule.map((s, i) => {
      const staffId = s.staffId ?? form.staffId;
      const serviceCode = s.serviceCode ?? form.serviceCode;
      const serviceLabel = s.serviceLabel ?? form.serviceLabel;
      const insuranceType = s.insuranceType ?? form.insuranceType;
      const duration = s.duration ?? getCodeDuration(serviceCode);
      return {
        id: Date.now() + i, staffId, userId: newId, userName: form.name, area: form.area,
        day: s.day, startHour: s.hour, duration,
        type: serviceLabel.includes("理学") ? "リハビリ" : insuranceType === "医療" ? "医療訪問看護" : "訪問看護",
        serviceCode, insuranceType, status: "予定",
      };
    });
    setVisits((prev) => [...prev, ...newVisits]);
    setAddUserOpen(false);
  };

  const updateUser = (form) => {
    setUsers((prev) => prev.map((u) => u.id === form.id ? { ...u, ...form } : u));
    setVisits((prev) => {
      const kept = prev.filter((v) => v.userId !== form.id);
      const newVisits = form.regularSchedule.map((s, i) => {
        const staffId = s.staffId ?? form.staffId;
        const serviceCode = s.serviceCode ?? form.serviceCode;
        const serviceLabel = s.serviceLabel ?? form.serviceLabel;
        const insuranceType = s.insuranceType ?? form.insuranceType;
        const duration = s.duration ?? getCodeDuration(serviceCode);
        return {
          id: Date.now() + i, staffId, userId: form.id, userName: form.name, area: form.area,
          day: s.day, startHour: s.hour, duration,
          type: serviceLabel.includes("理学") ? "リハビリ" : insuranceType === "医療" ? "医療訪問看護" : "訪問看護",
          serviceCode, insuranceType, status: "予定",
        };
      });
      return [...kept, ...newVisits];
    });
    setViewUser(null);
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setVisits((prev) => prev.filter((v) => v.userId !== userId));
    setViewUser(null);
  };

  const tVis = visits.filter((v) => v.day === todayDow).length;
  const kC = visits.filter((v) => v.insuranceType === "介護").length;
  const iC = visits.filter((v) => v.insuranceType === "医療").length;

  // 空きスタッフ数（現在時間帯）
  const nowHour = today.getHours();
  const freeNow = STAFF.filter((s) => visits.filter((v) => v.staffId === s.id && v.day === todayDow && v.startHour === nowHour && v.status !== "キャンセル").length === 0).length;

  return (
    <div style={{ fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", color: "white", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #38bdf8, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>訪問看護スケジュール管理</div>
            <div style={{ fontSize: 10, opacity: 0.6 }}>スリーピース株式会社</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 12, alignItems: "center" }}>
          {[
            { v: tVis, l: "本日" },
            { v: visits.length, l: "今週合計" },
            { v: kC, l: "介護保険", c: "#93c5fd" },
            { v: iC, l: "医療保険", c: "#fcd34d" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "4px 12px", background: "rgba(255,255,255,0.1)", borderRadius: 8, borderBottom: s.c ? `2px solid ${s.c}` : "none" }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{s.v}</div>
              <div style={{ opacity: 0.7, fontSize: 9 }}>{s.l}</div>
            </div>
          ))}
          {/* 空き状況ボタン */}
          <button onClick={() => setAvailOpen(true)}
            style={{
              padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer",
              background: freeNow >= 4 ? "linear-gradient(135deg, #059669, #10b981)" : freeNow >= 2 ? "linear-gradient(135deg, #d97706, #f59e0b)" : "linear-gradient(135deg, #dc2626, #ef4444)",
              color: "white", fontWeight: 700, fontSize: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>🟢 {freeNow}/{STAFF.length}</span>
            <span style={{ fontSize: 9, opacity: 0.9 }}>現在空き</span>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 72px)" }}>
        {/* Sidebar */}
        <div style={{ width: 240, background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "10px 10px 6px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {[["staff", "スタッフ別"], ["user", "利用者別"]].map(([k, l]) => (
                <button key={k} onClick={() => { setViewMode(k); setSelStaff(null); setSelUser(null); }}
                  style={{ flex: 1, padding: "6px 0", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, background: viewMode === k ? "white" : "transparent", color: viewMode === k ? "#0f172a" : "#94a3b8", boxShadow: viewMode === k ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{l}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {[["all", "全て"], ["介護", "介護"], ["医療", "医療"]].map(([k, l]) => (
                <button key={k} onClick={() => setInsF(k)}
                  style={{ flex: 1, padding: "4px 0", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 10, fontWeight: 600,
                    background: insF === k ? (k === "医療" ? "#fef3c7" : k === "介護" ? "#dbeafe" : "#e2e8f0") : "#f8fafc",
                    color: insF === k ? (k === "医療" ? "#92400e" : k === "介護" ? "#1e40af" : "#1e293b") : "#94a3b8" }}>{l}</button>
              ))}
            </div>
          </div>

          {viewMode === "staff" ? (
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              <button onClick={() => setSelStaff(null)} style={{ width: "100%", padding: "7px 10px", border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left", fontSize: 12, fontWeight: 600, marginBottom: 4, background: !selStaff ? "#eff6ff" : "transparent", color: !selStaff ? "#1d4ed8" : "#64748b" }}>📋 全スタッフ表示</button>
              {STAFF.map((s) => {
                const ct = visits.filter((v) => v.staffId === s.id).length;
                const kk = visits.filter((v) => v.staffId === s.id && v.insuranceType === "介護").length;
                const ii = visits.filter((v) => v.staffId === s.id && v.insuranceType === "医療").length;
                // スタッフの空き枠数
                const busySlots = new Set(visits.filter((v) => v.staffId === s.id && v.status !== "キャンセル").map((v) => `${v.day}-${v.startHour}`));
                const totalSlots = HOURS.length * 5; // 平日のみ
                const freeSlots = totalSlots - busySlots.size;
                return (
                  <button key={s.id} onClick={() => setSelStaff(s.id)}
                    style={{ width: "100%", padding: "7px 10px", border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left", marginBottom: 2, background: selStaff === s.id ? `${s.color}10` : "transparent", borderLeft: selStaff === s.id ? `3px solid ${s.color}` : "3px solid transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${s.color}18`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{s.name[0]}</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                        <div style={{ fontSize: 9, color: "#94a3b8", display: "flex", gap: 4 }}>
                          <span>{ct}件</span>
                          <span style={{ color: "#3b82f6" }}>介{kk}</span>
                          <span style={{ color: "#d97706" }}>医{ii}</span>
                          <span style={{ color: "#059669", fontWeight: 700 }}>空{freeSlots}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {/* 空き状況ボタン（サイドバー下部） */}
              <button onClick={() => setAvailOpen(true)}
                style={{ width: "100%", padding: "10px", border: "2px dashed #86efac", borderRadius: 8, cursor: "pointer", background: "#ecfdf5", color: "#059669", fontSize: 12, fontWeight: 700, marginTop: 8 }}>
                📊 空き状況を一覧表示
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              <input type="text" placeholder="🔍 名前・住所・コードで検索..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, marginBottom: 6, boxSizing: "border-box", outline: "none" }} />
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                <button onClick={() => setSelUser(null)} style={{ flex: 1, padding: "6px 10px", border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left", fontSize: 12, fontWeight: 600, background: !selUser ? "#eff6ff" : "transparent", color: !selUser ? "#1d4ed8" : "#64748b" }}>📋 全表示</button>
                <button onClick={() => setAddUserOpen(true)} style={{ padding: "6px 12px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #059669, #10b981)", color: "white", boxShadow: "0 1px 4px rgba(5,150,105,0.3)" }}>＋ 追加</button>
              </div>
              {fUsers.slice(0, 50).map((u) => {
                const ct = visits.filter((v) => v.userId === u.id).length;
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
                    <button onClick={() => setSelUser(u.id)}
                      style={{ flex: 1, padding: "5px 8px", border: "none", borderRadius: 4, cursor: "pointer", textAlign: "left", background: selUser === u.id ? "#eff6ff" : "transparent", fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontWeight: selUser === u.id ? 700 : 400, color: "#334155" }}>{u.name}</span>
                        <InsBadge type={u.insuranceType} />
                      </span>
                      <span style={{ fontSize: 9, color: "#94a3b8" }}>週{u.frequency} · {u.serviceCode}</span>
                    </button>
                    <button onClick={() => setViewUser(u)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, padding: "2px 4px", color: "#94a3b8" }} title="詳細">ℹ️</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Calendar */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px", background: "white", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setWOff((w) => w - 1)} style={navBtn}>◀</button>
              <button onClick={() => setWOff(0)} style={{ ...navBtn, background: wOff === 0 ? "#0f172a" : "white", color: wOff === 0 ? "white" : "#1e293b", fontWeight: 600 }}>今週</button>
              <button onClick={() => setWOff((w) => w + 1)} style={navBtn}>▶</button>
              <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 8 }}>{wLabel}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                表示: {fv.length}件
                {selStaff && ` · ${STAFF.find((s) => s.id === selStaff)?.name}`}
                {selUser && ` · ${users.find((u) => u.id === selUser)?.name}`}
              </span>
              {showAvail && !selStaff && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9 }}>
                  {[
                    { bg: "#f0fdf4", color: "#16a34a", label: "余裕" },
                    { bg: "#fefce8", color: "#ca8a04", label: "やや混" },
                    { bg: "#fff7ed", color: "#ea580c", label: "混雑" },
                    { bg: "#fef2f2", color: "#dc2626", label: "逼迫" },
                  ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: l.bg, border: `1px solid ${l.color}30` }} />
                      <span style={{ color: l.color, fontWeight: 600 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setShowAvail((v) => !v)}
                style={{
                  padding: "4px 10px", border: `1.5px solid ${showAvail ? "#86efac" : "#e2e8f0"}`, borderRadius: 6,
                  background: showAvail ? "#ecfdf5" : "white", cursor: "pointer", fontSize: 11, fontWeight: 600,
                  color: showAvail ? "#059669" : "#94a3b8", transition: "all 0.15s",
                }}>
                {showAvail ? "🟢 空き表示ON" : "⚪ 空き表示OFF"}
              </button>
              <button onClick={() => setRegSchedOpen(true)}
                style={{ padding: "4px 12px", border: "1px solid #93c5fd", borderRadius: 6, background: "#eff6ff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#2563eb" }}>
                📅 定期スケジュール一覧
              </button>
              <button onClick={() => setAvailOpen(true)}
                style={{ padding: "4px 12px", border: "1px solid #86efac", borderRadius: 6, background: "#ecfdf5", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#059669" }}>
                📊 空き状況一覧
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", minWidth: 800 }}>
              <div style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }} />
              {DAYS.map((d, i) => {
                const dt = wDates[i]; const isT = wOff === 0 && i === todayDow;
                return (
                  <div key={d} style={{ textAlign: "center", padding: "6px 4px", borderBottom: "2px solid #e2e8f0", borderLeft: "1px solid #f1f5f9", background: isT ? "#eff6ff" : "#f8fafc" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: i >= 5 ? "#ef4444" : isT ? "#1d4ed8" : "#64748b" }}>{d}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: isT ? "white" : "#1e293b", ...(isT ? { background: "#1d4ed8", borderRadius: "50%", width: 26, height: 26, lineHeight: "26px", margin: "2px auto" } : {}) }}>{dt.getDate()}</div>
                  </div>
                );
              })}
              {HOURS.map((h) => (<>
                <div key={`t-${h}`} style={{ padding: "4px 4px", fontSize: 10, fontWeight: 600, color: "#94a3b8", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", textAlign: "right", height: 56, boxSizing: "border-box" }}>{h}:00</div>
                {DAYS.map((_, di) => {
                  const cv = getCell(di, h, selStaff || null);
                  const isT = wOff === 0 && di === todayDow;
                  // 空きスタッフ計算
                  const busyStaff = new Set(visits.filter((v) => v.day === di && v.startHour === h && v.status !== "キャンセル").map((v) => v.staffId));
                  const freeCount = STAFF.length - busyStaff.size;
                  const freeRatio = freeCount / STAFF.length;
                  // 空きの背景色
                  const availBg = !showAvail || selStaff ? "transparent" :
                    freeRatio >= 0.75 ? "#f0fdf4" :
                    freeRatio >= 0.5 ? "#fefce8" :
                    freeRatio >= 0.25 ? "#fff7ed" :
                    freeCount > 0 ? "#fef2f2" : "#fce4ec";
                  return (
                    <div key={`${di}-${h}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, di, h, selStaff)}
                      style={{ borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9", height: 56, position: "relative",
                        background: isT ? "#fafbff" : dragV ? "#f0fdf4" : (showAvail && !selStaff ? availBg : "white"),
                        ...(!selStaff && cv.length > 0 ? { display: "flex", gap: 1, padding: "2px 1px", overflowY: "visible" } : {}),
                      }}>
                      {cv.map((v) => { const st = STAFF.find((s) => s.id === v.staffId); return <VCard key={v.id} visit={v} staff={st} isDrag={dragV?.id === v.id} onDS={onDS} onEdit={(v) => setEditV({ ...v })} flexMode={!selStaff} />; })}
                      {/* 空きスタッフ数インジケーター */}
                      {showAvail && !selStaff && cv.length === 0 && (
                        <div style={{
                          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", pointerEvents: "none",
                        }}>
                          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500, lineHeight: 1, marginBottom: 1 }}>空き</span>
                          <span style={{
                            fontSize: 14, fontWeight: 800, lineHeight: 1,
                            color: freeRatio >= 0.75 ? "#16a34a" : freeRatio >= 0.5 ? "#ca8a04" : freeRatio >= 0.25 ? "#ea580c" : "#dc2626",
                          }}>{freeCount}<span style={{ fontSize: 10, fontWeight: 600 }}>/{STAFF.length}</span></span>
                        </div>
                      )}
                      {/* 予定ありセルにも小さく空き表示 */}
                      {showAvail && !selStaff && cv.length > 0 && (
                        <div style={{
                          position: "absolute", bottom: 1, right: 3, fontSize: 8, fontWeight: 700, pointerEvents: "none",
                          color: freeRatio >= 0.5 ? "#16a34a" : freeRatio >= 0.25 ? "#ca8a04" : "#dc2626",
                          background: freeRatio >= 0.5 ? "#ecfdf520" : freeRatio >= 0.25 ? "#fef3c720" : "#fef2f220",
                          padding: "0px 3px", borderRadius: 3, lineHeight: "14px",
                        }}>空{freeCount}/{STAFF.length}</div>
                      )}
                    </div>
                  );
                })}
              </>))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editV && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setEditV(null)}>
          <div style={{ background: "white", borderRadius: 12, padding: 24, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>📝 訪問予定の編集 <InsBadge type={editV.insuranceType} /></div>
            <div style={{ display: "grid", gap: 12 }}>
              <div><label style={lbl}>利用者</label><div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{editV.userName}</div></div>
              <div><label style={lbl}>担当スタッフ</label>
                <select value={editV.staffId} onChange={(e) => setEditV({ ...editV, staffId: Number(e.target.value) })} style={sty}>{STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={lbl}>曜日</label><select value={editV.day} onChange={(e) => setEditV({ ...editV, day: Number(e.target.value) })} style={sty}>{DAYS.map((d, i) => <option key={i} value={i}>{d}曜日</option>)}</select></div>
                <div><label style={lbl}>開始時間</label><select value={editV.startHour} onChange={(e) => setEditV({ ...editV, startHour: Number(e.target.value) })} style={sty}>{HOURS.map((h) => <option key={h} value={h}>{h}:00</option>)}</select></div>
              </div>
              <div><label style={lbl}>サービスコード</label>
                <select value={editV.serviceCode} onChange={(e) => { const sc = ALL_CODES.find((c) => c.code === e.target.value); setEditV({ ...editV, serviceCode: e.target.value, insuranceType: sc?.insurance || editV.insuranceType }); }} style={sty}>
                  <optgroup label="介護保険">{SERVICE_CODES.kaigo.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.label}</option>)}</optgroup>
                  <optgroup label="医療保険">{SERVICE_CODES.iryo.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.label}</option>)}</optgroup>
                </select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={lbl}>訪問種別</label><select value={editV.type} onChange={(e) => setEditV({ ...editV, type: e.target.value })} style={sty}>{["訪問看護", "医療訪問看護", "リハビリ", "特別訪問", "緊急訪問"].map((t) => <option key={t}>{t}</option>)}</select></div>
                <div><label style={lbl}>ステータス</label><select value={editV.status} onChange={(e) => setEditV({ ...editV, status: e.target.value })} style={sty}>{["予定", "確定", "完了", "キャンセル"].map((s) => <option key={s}>{s}</option>)}</select></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={del} style={{ padding: "8px 14px", border: "1px solid #fca5a5", background: "#fef2f2", color: "#dc2626", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🗑 削除</button>
              <div style={{ flex: 1 }} />
              <button onClick={() => setEditV(null)} style={{ padding: "8px 14px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#64748b" }}>キャンセル</button>
              <button onClick={save} style={{ padding: "8px 14px", border: "none", background: "#0f172a", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓ 保存</button>
            </div>
          </div>
        </div>
      )}

      {viewUser && <UserDetailPanel user={viewUser} visits={visits} onClose={() => setViewUser(null)} onSave={updateUser} onDelete={deleteUser} />}
      {addUserOpen && <AddUserModal onClose={() => setAddUserOpen(false)} onSave={addUser} />}
      {availOpen && <AvailabilityPanel visits={visits} onClose={() => setAvailOpen(false)} />}
      {regSchedOpen && <RegularSchedulePanel users={users} visits={visits} onClose={() => setRegSchedOpen(false)} />}
    </div>
  );
}
