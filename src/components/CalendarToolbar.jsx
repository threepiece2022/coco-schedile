import { navBtn } from "../styles.js";

export default function CalendarToolbar({
  calendarMode, setCalendarMode,
  dayOff, setDayOff, selDateLabel, dateKey, dateAdjCount, setDayAdj,
  wOff, setWOff, wLabel,
  fvCount, selStaff, selUser, staff, users,
  onRegSchedOpen, onAvailOpen, onCsvOpen,
}) {
  return (
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
          {fvCount}件{selStaff ? ` · ${staff.find((s) => s.id === selStaff)?.name}` : ""}{selUser ? ` · ${users.find((u) => u.id === selUser)?.name}` : ""}
        </span>
        <button onClick={onRegSchedOpen}
          style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
          定期一覧
        </button>
        <button onClick={onAvailOpen}
          style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
          空き状況
        </button>
        <button onClick={onCsvOpen}
          style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
          CSV入出力
        </button>
      </div>
    </div>
  );
}
