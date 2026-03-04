import { useState, useCallback, useEffect } from "react";
import { DEFAULT_STAFF, SERVICE_CODES, ALL_CODES, HOURS, DAYS, DAY_FULL, INITIAL_USERS, generateVisits, getCodeDuration, getCodeShort, getStaffColor, DEFAULT_AREAS } from "./data.js";
import { InsBadge, StBadge, StatusBadge, CareLevelBadge } from "./components/ui.jsx";
import { lbl, sty, navBtn } from "./styles.js";
import UserDetailPanel from "./components/UserDetailPanel.jsx";
import AddUserModal from "./components/AddUserModal.jsx";
import AvailabilityPanel from "./components/AvailabilityPanel.jsx";
import RegularSchedulePanel from "./components/RegularSchedulePanel.jsx";
import CsvModal from "./components/CsvModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import StaffManagerPanel from "./components/StaffManagerPanel.jsx";

const insColor = (ins) => ins === "医療"
  ? { bg: "#fffbeb", border: "#f59e0b", text: "#92400e", left: "#d97706" }
  : ins === "自費"
  ? { bg: "#faf5ff", border: "#c084fc", text: "#6b21a8", left: "#a855f7" }
  : { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af", left: "#3b82f6" };

const fmtTime = (hour, dur) => {
  const em = hour + dur;
  const mm = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
  return `${mm(hour)}〜${mm(em)}`;
};

const VCard = ({ visit, staff, isDrag, onDS, onEdit, flexMode, hMode, conflict }) => {
  const h = visit.duration * 56 - 4;
  const ic = insColor(visit.insuranceType);
  return (
    <div draggable onDragStart={(e) => onDS(e, visit)} onClick={() => onEdit(visit)}
      title={`${visit.userName} ${fmtTime(visit.startHour, visit.duration)} ${getCodeShort(visit.serviceCode)}`}
      style={{
        ...(hMode
          ? { width: "100%", height: "100%" }
          : flexMode
            ? { flex: "1 1 0", minWidth: 0, height: h }
            : { position: "absolute", top: 2, left: 2, right: 2, height: h }),
        background: conflict ? "#fef2f2" : ic.bg,
        border: conflict ? "2px solid #ef4444" : `1px solid ${ic.border}`,
        borderLeft: conflict ? "3px solid #dc2626" : `3px solid ${ic.left}`,
        borderRadius: 6, padding: "3px 6px", cursor: "grab", opacity: isDrag ? 0.35 : 1,
        transition: "box-shadow 0.15s, transform 0.15s", overflow: "hidden", zIndex: isDrag ? 100 : 1, fontSize: 11,
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 2px 8px ${conflict ? "#ef444450" : ic.border + "50"}`; e.currentTarget.style.transform = "scale(1.02)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      <div style={{ fontWeight: 700, color: conflict ? "#dc2626" : ic.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: flexMode ? 9 : 11, lineHeight: 1.3 }}>
        {flexMode ? visit.userName.slice(-3) : visit.userName}
      </div>
      {!flexMode && !hMode && visit.duration >= 1 && (
        <div style={{ display: "flex", gap: 3, alignItems: "center", marginTop: 1 }}>
          <span style={{ color: "#94a3b8", fontSize: 9 }}>{getCodeShort(visit.serviceCode)}</span>
          <StBadge status={visit.status} />
        </div>
      )}
      <div style={{ fontSize: 8, color: conflict ? "#dc2626" : "#94a3b8", fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {hMode ? `${Math.floor(visit.startHour)}:${String(Math.round((visit.startHour % 1) * 60)).padStart(2, "0")} ${getCodeShort(visit.serviceCode)}` : `${Math.floor(visit.startHour)}:${String(Math.round((visit.startHour % 1) * 60)).padStart(2, "0")}〜`}
      </div>
    </div>
  );
};

const loadState = (key, fallback) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
};

export default function App() {
  const [staff, setStaff] = useState(() => loadState("coco_staff", DEFAULT_STAFF));
  const [users, setUsers] = useState(() => {
    const raw = loadState("coco_users", INITIAL_USERS);
    return raw.map((u) => ({ ...u, nameKana: u.nameKana || "", status: u.status || "利用中", careLevel: u.careLevel || "" }));
  });
  const [visits, setVisits] = useState(() => loadState("coco_visits", null) || generateVisits(loadState("coco_users", INITIAL_USERS)));
  const [areas, setAreas] = useState(() => loadState("coco_areas", DEFAULT_AREAS));
  const [office, setOffice] = useState(() => loadState("coco_office", { name: "スリーピース株式会社", address: "", phone: "" }));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [staffMgrOpen, setStaffMgrOpen] = useState(false);

  useEffect(() => { localStorage.setItem("coco_staff", JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem("coco_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("coco_visits", JSON.stringify(visits)); }, [visits]);
  useEffect(() => { localStorage.setItem("coco_areas", JSON.stringify(areas)); }, [areas]);
  useEffect(() => { localStorage.setItem("coco_office", JSON.stringify(office)); }, [office]);
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
  const [regSchedOpen, setRegSchedOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [userDataImported, setUserDataImported] = useState(() => !!localStorage.getItem("coco_user_imported"));
  const [calendarMode, setCalendarMode] = useState("day");
  const [dayOff, setDayOff] = useState(0);
  const [dayAdj, setDayAdj] = useState(() => loadState("coco_dayAdj", {})); // { "YYYY-M-D:visitId": { startHour, staffId } }

  useEffect(() => { localStorage.setItem("coco_dayAdj", JSON.stringify(dayAdj)); }, [dayAdj]);

  const today = new Date();
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7) + wOff * 7);
  const wDates = DAYS.map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  const wLabel = `${mon.getFullYear()}年${mon.getMonth() + 1}月${mon.getDate()}日〜`;
  const todayDow = (today.getDay() + 6) % 7;

  // 日次ビュー用
  const selDate = new Date(today);
  selDate.setDate(today.getDate() + dayOff);
  const selDow = (selDate.getDay() + 6) % 7; // 0=月
  const selDateLabel = `${selDate.getFullYear()}年${selDate.getMonth() + 1}月${selDate.getDate()}日（${DAY_FULL[selDow]}）`;
  const dateKey = `${selDate.getFullYear()}-${selDate.getMonth() + 1}-${selDate.getDate()}`;

  // 日次ビュー：一時調整を反映した訪問リスト
  const dayAllVisits = visits.filter((v) => (insF === "all" || v.insuranceType === insF) && v.day === selDow);
  const dayAdjVisits = dayAllVisits.map((v) => {
    const adj = dayAdj[`${dateKey}:${v.id}`];
    return adj ? { ...v, startHour: adj.startHour, staffId: adj.staffId, _isAdj: true } : v;
  });
  const dayFilteredVisits = dayAdjVisits.filter((v) => {
    if (viewMode === "staff" && selStaff) return v.staffId === selStaff;
    if (viewMode === "user" && selUser) return v.userId === selUser;
    return true;
  });
  const dateAdjCount = Object.keys(dayAdj).filter((k) => k.startsWith(`${dateKey}:`)).length;

  const fv = visits.filter((v) => {
    if (insF !== "all" && v.insuranceType !== insF) return false;
    if (viewMode === "staff" && selStaff) return v.staffId === selStaff;
    if (viewMode === "user" && selUser) return v.userId === selUser;
    return true;
  });

  const fUsers = users.filter((u) =>
    (u.name.includes(search) || (u.nameKana || "").includes(search) || u.area.includes(search) || u.address.includes(search) || u.serviceCode.includes(search)) &&
    (insF === "all" || u.insuranceType === insF)
  );

  const [dragPreview, setDragPreview] = useState(null); // { staffId, hour }
  const onDS = useCallback((e, v) => { setDragV(v); e.dataTransfer.effectAllowed = "move"; }, []);
  const calcDropHour = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawMin = ratio * HOURS.length * 60;
    return HOURS[0] + Math.round(rawMin / 5) * 5 / 60;
  };
  const onDrop = useCallback((e, day, hour, sid) => {
    e.preventDefault(); if (!dragV) return;
    if (calendarMode === "day") {
      // 日次モード: 一時調整として保存（一時マーク付き、localStorageにも永続化）
      const d = new Date(); d.setDate(d.getDate() + dayOff);
      const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      setDayAdj((prev) => ({ ...prev, [`${dk}:${dragV.id}`]: { startHour: hour, staffId: sid || dragV.staffId } }));
    } else {
      setVisits((p) => p.map((v) => v.id === dragV.id ? { ...v, day, startHour: hour, ...(sid ? { staffId: sid } : {}) } : v));
    }
    setDragV(null); setDragPreview(null);
  }, [dragV, calendarMode, dayOff]);

  const save = () => {
    if (!editV) return;
    const { _isAdj, editPerm, ...cleanV } = editV;
    if (calendarMode === "day" && !editPerm) {
      // 一時変更: dayAdjに保存（定期スケジュールは変更しない）
      const d = new Date(); d.setDate(d.getDate() + dayOff);
      const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      setDayAdj((prev) => ({ ...prev, [`${dk}:${cleanV.id}`]: { startHour: cleanV.startHour, staffId: cleanV.staffId } }));
    } else {
      // 定期変更: visitsを更新
      setVisits((p) => p.map((v) => v.id === cleanV.id ? cleanV : v));
      if (calendarMode === "day") {
        const d = new Date(); d.setDate(d.getDate() + dayOff);
        const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        setDayAdj((prev) => { const n = { ...prev }; delete n[`${dk}:${cleanV.id}`]; return n; });
      }
    }
    setEditV(null);
  };
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

  const importUsers = (importedUsers, mergeMode) => {
    // IDを自動付与し、user-levelフィールドを最初のスケジュールから導出
    const prepareUsers = (list, startId) => list.map((u, i) => {
      const first = u.regularSchedule?.[0];
      return {
        ...u,
        id: u.id || startId + i,
        nameKana: u.nameKana || "",
        status: u.status || "利用中",
        insuranceType: u.insuranceType || first?.insuranceType || "介護",
        serviceCode: u.serviceCode || first?.serviceCode || "1313",
        serviceLabel: u.serviceLabel || first?.serviceLabel || "",
        staffId: u.staffId || first?.staffId || 1,
      };
    });
    // デモデータ使用中は強制的に全件置換
    const effectiveMode = userDataImported ? mergeMode : "replace";
    if (effectiveMode === "replace") {
      const newUsers = prepareUsers(importedUsers, 1);
      setUsers(newUsers);
      setVisits(generateVisits(newUsers));
      if (!userDataImported) setDayAdj({});
    } else {
      setUsers((prev) => {
        const nextId = prev.length > 0 ? Math.max(...prev.map((u) => u.id)) + 1 : 1;
        const prepared = prepareUsers(importedUsers, nextId);
        // name+address でマッチする既存ユーザーを上書き、なければ追加
        const merged = [...prev];
        for (const u of prepared) {
          const existIdx = merged.findIndex((m) => m.name === u.name && m.address === u.address);
          if (existIdx >= 0) {
            merged[existIdx] = { ...u, id: merged[existIdx].id };
          } else {
            merged.push(u);
          }
        }
        setVisits(generateVisits(merged));
        return merged;
      });
    }
    localStorage.setItem("coco_user_imported", "1");
    setUserDataImported(true);
    setCsvOpen(false);
  };

  const importStaff = (importedStaff) => {
    // IDなしの場合は自動採番して全件置換
    let nextId = 1;
    const newStaff = importedStaff.map((s) => ({
      ...s,
      id: s.id != null ? s.id : nextId++,
    }));
    // ID重複がないよう採番を調整
    const usedIds = new Set(newStaff.filter((s) => s.id != null).map((s) => s.id));
    let autoId = usedIds.size > 0 ? Math.max(...usedIds) + 1 : 1;
    const result = newStaff.map((s) => {
      if (s.id != null) return s;
      while (usedIds.has(autoId)) autoId++;
      usedIds.add(autoId);
      return { ...s, id: autoId++ };
    });
    setStaff(result);
    setCsvOpen(false);
  };

  const dayDow = calendarMode === "day" ? selDow : todayDow;
  const tVis = visits.filter((v) => v.day === dayDow).length;

  return (
    <div style={{ fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", color: "white", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>訪問看護スケジュール管理</div>
          <span style={{ fontSize: 10, opacity: 0.5 }}>{office.name || "スリーピース株式会社"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, opacity: 0.6 }}>
            {calendarMode === "day" && dayOff !== 0 ? "選択日" : "本日"} {tVis}件 / 週 {visits.length}件
          </span>
          <button onClick={() => setSettingsOpen(true)}
            style={{ padding: "4px 10px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, background: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "white" }}>
            設定
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 42px)" }}>
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
              {[["all", "全て"], ["介護", "介護"], ["医療", "医療"], ["自費", "自費"]].map(([k, l]) => (
                <button key={k} onClick={() => setInsF(k)}
                  style={{ flex: 1, padding: "4px 0", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 10, fontWeight: 600,
                    background: insF === k ? (k === "医療" ? "#fef3c7" : k === "介護" ? "#dbeafe" : k === "自費" ? "#f3e8ff" : "#e2e8f0") : "#f8fafc",
                    color: insF === k ? (k === "医療" ? "#92400e" : k === "介護" ? "#1e40af" : k === "自費" ? "#6b21a8" : "#1e293b") : "#94a3b8" }}>{l}</button>
              ))}
            </div>
          </div>

          {viewMode === "staff" ? (
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                <button onClick={() => setSelStaff(null)} style={{ flex: 1, padding: "7px 10px", border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left", fontSize: 12, fontWeight: 600, background: !selStaff ? "#eff6ff" : "transparent", color: !selStaff ? "#1d4ed8" : "#64748b" }}>📋 全表示</button>
                <button onClick={() => setStaffMgrOpen(true)} style={{ padding: "7px 10px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg, #059669, #10b981)", color: "white" }}>管理</button>
              </div>
              {staff.map((s) => {
                const ct = visits.filter((v) => v.staffId === s.id).length;
                return (
                  <button key={s.id} onClick={() => setSelStaff(s.id)}
                    style={{ width: "100%", padding: "6px 10px", border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left", marginBottom: 2, background: selStaff === s.id ? `${getStaffColor(s.id)}10` : "transparent", borderLeft: selStaff === s.id ? `3px solid ${getStaffColor(s.id)}` : "3px solid transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${getStaffColor(s.id)}18`, color: getStaffColor(s.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{s.name[0]}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#1e293b", flex: 1 }}>{s.name}</span>
                      <span style={{ fontSize: 9, color: "#94a3b8" }}>{ct}件</span>
                    </div>
                  </button>
                );
              })}
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
                        {u.careLevel && <CareLevelBadge level={u.careLevel} />}
                        {u.status && u.status !== "利用中" && <StatusBadge status={u.status} />}
                      </span>
                      <span style={{ fontSize: 9, color: "#94a3b8" }}>週{u.frequency} · {getCodeShort(u.serviceCode)}</span>
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
              {calendarMode === "day" ? (<>
                <button onClick={() => setDayOff((d) => d - 1)} style={navBtn}>◀</button>
                <button onClick={() => setDayOff(0)} style={{ ...navBtn, background: dayOff === 0 ? "#0f172a" : "white", color: dayOff === 0 ? "white" : "#1e293b", fontWeight: 600 }}>今日</button>
                <button onClick={() => setDayOff((d) => d + 1)} style={navBtn}>▶</button>
                <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 8 }}>{selDateLabel}</span>
                {dateAdjCount > 0 && (
                  <button onClick={() => setDayAdj((prev) => { const n = { ...prev }; Object.keys(n).forEach((k) => { if (k.startsWith(`${dateKey}:`)) delete n[k]; }); return n; })}
                    style={{ padding: "3px 8px", border: "1px solid #fdba74", borderRadius: 6, background: "#fff7ed", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#ea580c", marginLeft: 4 }}>
                    一時変更{dateAdjCount}件をリセット
                  </button>
                )}
              </>) : (<>
                <button onClick={() => setWOff((w) => w - 1)} style={navBtn}>◀</button>
                <button onClick={() => setWOff(0)} style={{ ...navBtn, background: wOff === 0 ? "#0f172a" : "white", color: wOff === 0 ? "white" : "#1e293b", fontWeight: 600 }}>今週</button>
                <button onClick={() => setWOff((w) => w + 1)} style={navBtn}>▶</button>
                <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 8 }}>{wLabel}</span>
              </>)}
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, marginLeft: 12 }}>
                {[["day", "日"], ["week", "週"]].map(([k, l]) => (
                  <button key={k} onClick={() => setCalendarMode(k)}
                    style={{ padding: "4px 12px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, background: calendarMode === k ? "white" : "transparent", color: calendarMode === k ? "#0f172a" : "#94a3b8", boxShadow: calendarMode === k ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                {fv.length}件{selStaff ? ` · ${staff.find((s) => s.id === selStaff)?.name}` : ""}{selUser ? ` · ${users.find((u) => u.id === selUser)?.name}` : ""}
              </span>
              <button onClick={() => setRegSchedOpen(true)}
                style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                定期一覧
              </button>
              <button onClick={() => setAvailOpen(true)}
                style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                空き状況
              </button>
              <button onClick={() => setCsvOpen(true)}
                style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                CSV入出力
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {calendarMode === "day" ? (
              /* 日次ビュー: スタッフ行 × 時間列（duration に応じた幅） */
              <div style={{ display: "grid", gridTemplateColumns: `100px 1fr`, minWidth: 800 }}>
                {/* ヘッダー: 空セル + 時間ラベル */}
                <div style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }} />
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${HOURS.length}, 1fr)`, borderBottom: "2px solid #e2e8f0" }}>
                  {HOURS.map((h) => (
                    <div key={`dh-${h}`} style={{ textAlign: "left", padding: "8px 4px", borderLeft: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#64748b" }}>{h}:00</div>
                  ))}
                </div>
                {/* スタッフ行（グループ別） */}
                {[
                  { label: "看護師", members: staff.filter((s) => s.role === "看護師"), color: "#3b82f6" },
                  { label: "リハビリ職", members: staff.filter((s) => s.role !== "看護師"), color: "#059669" },
                ].map((group) => (<>
                  {/* グループヘッダー */}
                  <div key={`gh-${group.label}`} style={{ padding: "4px 8px", background: `${group.color}08`, borderBottom: "2px solid ${group.color}30", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: group.color }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: group.color }}>{group.label}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{group.members.length}名</span>
                  </div>
                  <div style={{ background: `${group.color}05`, borderBottom: `2px solid ${group.color}20` }} />
                  {group.members.map((s) => {
                    const dayCt = dayFilteredVisits.filter((v) => v.staffId === s.id).length;
                    const staffVisits = dayFilteredVisits.filter((v) => v.staffId === s.id);
                    const isSelected = selStaff === s.id;
                    return (<>
                      <div key={`sl-${s.id}`} onClick={() => setSelStaff(selStaff === s.id ? null : s.id)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderBottom: "1px solid #e2e8f0", background: isSelected ? `${group.color}10` : "#f8fafc", cursor: "pointer" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${group.color}18`, color: group.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{s.name[0]}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? group.color : "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                          <div style={{ fontSize: 9, color: "#94a3b8" }}>{dayCt}件</div>
                        </div>
                      </div>
                    <div style={{ position: "relative", height: 56, borderBottom: "1px solid #e2e8f0", overflow: "visible" }}>
                      {/* 時間グリッド線（表示用） */}
                      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${HOURS.length * 2}, 1fr)`, pointerEvents: "none" }}>
                        {HOURS.flatMap((h) => [
                          <div key={`gl-${s.id}-${h}`} style={{ borderLeft: "1px solid #cbd5e1" }} />,
                          <div key={`gl-${s.id}-${h}-half`} style={{ borderLeft: "1px dashed #e2e8f0" }} />,
                        ])}
                      </div>
                      {/* ドロップターゲット（5分刻み）+ プレビュー */}
                      <div style={{ position: "absolute", inset: 0 }}
                        onDragOver={(e) => { e.preventDefault(); const h = calcDropHour(e); setDragPreview({ staffId: s.id, hour: h }); }}
                        onDragLeave={() => setDragPreview((p) => p?.staffId === s.id ? null : p)}
                        onDrop={(e) => { const h = calcDropHour(e); onDrop(e, selDow, h, s.id); }}
                      >
                        {dragV && dragPreview?.staffId === s.id && (() => {
                          const ph = dragPreview.hour;
                          const dur = dragV.duration;
                          const pLeft = ((ph - HOURS[0]) / HOURS.length) * 100;
                          const pWidth = (dur / HOURS.length) * 100;
                          const mm = `${Math.floor(ph)}:${String(Math.round((ph % 1) * 60)).padStart(2, "0")}`;
                          return (
                            <div style={{ position: "absolute", left: `${pLeft}%`, width: `${pWidth}%`, top: 0, bottom: 0, background: "#3b82f620", border: "2px dashed #3b82f6", borderRadius: 6, zIndex: 10, pointerEvents: "none" }}>
                              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 2, fontSize: 11, fontWeight: 800, color: "white", background: "#3b82f6", padding: "2px 8px", borderRadius: 4, boxShadow: "0 2px 8px rgba(59,130,246,0.4)", whiteSpace: "nowrap", zIndex: 20 }}>{mm}</div>
                            </div>
                          );
                        })()}
                      </div>
                      {/* 訪問カード（duration に応じた幅） */}
                      {staffVisits.map((v) => {
                        const left = ((v.startHour - HOURS[0]) / HOURS.length) * 100;
                        const width = (v.duration / HOURS.length) * 100;
                        const isHighlighted = selUser && v.userId === selUser;
                        const conflict = staffVisits.some((o) => o.id !== v.id && o.startHour < v.startHour + v.duration && o.startHour + o.duration > v.startHour);
                        return (
                          <div key={v.id} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 2, bottom: 2, padding: "0 1px", boxSizing: "border-box", zIndex: 2 }}>
                            <VCard visit={v} staff={s} isDrag={dragV?.id === v.id} onDS={onDS} onEdit={(vv) => setEditV({ ...vv, editPerm: false })} hMode conflict={conflict} />
                            {isHighlighted && <div style={{ position: "absolute", inset: "0 1px", border: "2px solid #f59e0b", borderRadius: 6, pointerEvents: "none" }} />}
                            {v._isAdj && <div style={{ position: "absolute", top: 1, right: 3, fontSize: 7, fontWeight: 700, color: "#ea580c", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 3, padding: "0 3px", lineHeight: "13px", pointerEvents: "none", zIndex: 3 }}>一時</div>}
                          </div>
                        );
                      })}
                    </div>
                    </>);
                  })}
                </>))}
              </div>
            ) : (
              /* 週次ビュー（既存） */
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
                    return (
                      <div key={`${di}-${h}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, di, h, selStaff)}
                        style={{ borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9", height: 56, position: "relative",
                          background: isT ? "#fafbff" : dragV ? "#f0fdf4" : "white",
                          ...(!selStaff && cv.length > 0 ? { display: "flex", gap: 1, padding: "2px 1px", overflowY: "visible" } : {}),
                        }}>
                        {cv.map((v) => { const st = staff.find((s) => s.id === v.staffId); return <VCard key={v.id} visit={v} staff={st} isDrag={dragV?.id === v.id} onDS={onDS} onEdit={(v) => setEditV({ ...v })} flexMode={!selStaff} />; })}
                      </div>
                    );
                  })}
                </>))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Side Panel */}
      {editV && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1000 }} onClick={() => setEditV(null)}>
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 400,
            background: "white", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column", overflow: "auto",
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>訪問予定の編集</div>
              <button onClick={() => setEditV(null)} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            <div style={{ padding: "16px 20px", flex: 1 }}>
              {/* 利用者リンク */}
              <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{editV.userName}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{editV.insuranceType === "医療" ? "医療保険" : editV.insuranceType === "自費" ? "自費" : "介護保険"} · {getCodeShort(editV.serviceCode)}</div>
                </div>
                <button onClick={() => {
                  const u = users.find((u) => u.id === editV.userId);
                  if (u) { setViewUser(u); setEditV(null); }
                }} style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#3b82f6" }}>
                  利用者情報を編集 →
                </button>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div><label style={lbl}>担当スタッフ</label>
                  <select value={editV.staffId} onChange={(e) => setEditV({ ...editV, staffId: Number(e.target.value) })} style={sty}>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><label style={lbl}>曜日</label><select value={editV.day} onChange={(e) => setEditV({ ...editV, day: Number(e.target.value) })} style={sty}>{DAYS.map((d, i) => <option key={i} value={i}>{d}曜日</option>)}</select></div>
                  <div><label style={lbl}>開始時間</label><select value={editV.startHour} onChange={(e) => setEditV({ ...editV, startHour: Number(e.target.value) })} style={sty}>{HOURS.flatMap((h) => Array.from({ length: 12 }, (_, i) => { const t = h + i * 5 / 60; return <option key={t} value={t}>{h}:{String(i * 5).padStart(2, "0")}</option>; }))}</select></div>
                </div>
                <div><label style={lbl}>サービスコード</label>
                  <select value={editV.serviceCode} onChange={(e) => { const sc = ALL_CODES.find((c) => c.code === e.target.value); setEditV({ ...editV, serviceCode: e.target.value, insuranceType: sc?.insurance || editV.insuranceType }); }} style={sty}>
                    <optgroup label="介護保険">{SERVICE_CODES.kaigo.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
                    <optgroup label="医療保険">{SERVICE_CODES.iryo.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
                    <optgroup label="自費">{SERVICE_CODES.jihi.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
                  </select></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><label style={lbl}>訪問種別</label><select value={editV.type} onChange={(e) => setEditV({ ...editV, type: e.target.value })} style={sty}>{["訪問看護", "医療訪問看護", "リハビリ", "特別訪問", "緊急訪問"].map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div><label style={lbl}>ステータス</label><select value={editV.status} onChange={(e) => setEditV({ ...editV, status: e.target.value })} style={sty}>{["予定", "確定", "完了", "キャンセル"].map((s) => <option key={s}>{s}</option>)}</select></div>
                </div>
              </div>

              {calendarMode === "day" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 10px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6 }}>
                  <input type="checkbox" id="editPerm" checked={editV.editPerm || false} onChange={(e) => setEditV({ ...editV, editPerm: e.target.checked })}
                    style={{ accentColor: "#d97706" }} />
                  <label htmlFor="editPerm" style={{ fontSize: 11, color: "#92400e", fontWeight: 600, cursor: "pointer" }}>定期スケジュールにも反映する</label>
                  <span style={{ fontSize: 9, color: "#b45309" }}>（この日のみ / 定期）</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
              <button onClick={del} style={{ padding: "8px 14px", border: "1px solid #fca5a5", background: "#fef2f2", color: "#dc2626", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>削除</button>
              <div style={{ flex: 1 }} />
              <button onClick={() => setEditV(null)} style={{ padding: "8px 14px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#64748b" }}>キャンセル</button>
              <button onClick={save} style={{ padding: "8px 14px", border: "none", background: "#0f172a", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{calendarMode === "day" && !editV.editPerm ? "この日のみ保存" : "保存"}</button>
            </div>
          </div>
        </div>
      )}

      {viewUser && <UserDetailPanel user={viewUser} visits={visits} areas={areas} staff={staff} onClose={() => setViewUser(null)} onSave={updateUser} onDelete={deleteUser} />}
      {addUserOpen && <AddUserModal areas={areas} staff={staff} onClose={() => setAddUserOpen(false)} onSave={addUser} />}
      {availOpen && <AvailabilityPanel visits={visits} staff={staff} onClose={() => setAvailOpen(false)} />}
      {regSchedOpen && <RegularSchedulePanel users={users} visits={visits} staff={staff} onClose={() => setRegSchedOpen(false)} />}
      {csvOpen && <CsvModal users={users} staff={staff} areas={areas} onClose={() => setCsvOpen(false)} onImport={importUsers} onImportStaff={importStaff} isDemo={!userDataImported} />}
      {settingsOpen && <SettingsModal office={office} areas={areas} onClose={() => setSettingsOpen(false)} onSaveOffice={setOffice} onSaveAreas={setAreas} />}
      {staffMgrOpen && <StaffManagerPanel staff={staff} visits={visits} onClose={() => setStaffMgrOpen(false)} onSave={setStaff} />}
    </div>
  );
}
