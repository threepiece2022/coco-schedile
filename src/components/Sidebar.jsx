import { getCodeShort, getStaffColor } from "../data.js";
import { InsBadge, StatusBadge, CareLevelBadge } from "./ui.jsx";

export default function Sidebar({
  viewMode, setViewMode, selStaff, setSelStaff, selUser, setSelUser,
  insF, setInsF, staff, visits, fUsers, search, setSearch,
  onStaffMgrOpen, onAddUserOpen, setViewUser,
}) {
  return (
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
            <button onClick={onStaffMgrOpen} style={{ padding: "7px 10px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg, #059669, #10b981)", color: "white" }}>管理</button>
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
            <button onClick={onAddUserOpen} style={{ padding: "6px 12px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #059669, #10b981)", color: "white", boxShadow: "0 1px 4px rgba(5,150,105,0.3)" }}>＋ 追加</button>
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
  );
}
