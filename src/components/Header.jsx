export default function Header({ office, calendarMode, dayOff, tVis, totalVisits, onSettingsOpen }) {
  return (
    <div style={{ background: "#0f172a", color: "white", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>訪問看護スケジュール管理</div>
        <span style={{ fontSize: 10, opacity: 0.5 }}>{office.name || "スリーピース株式会社"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, opacity: 0.6 }}>
          {calendarMode === "day" && dayOff !== 0 ? "選択日" : "本日"} {tVis}件 / 週 {totalVisits}件
        </span>
        <button onClick={onSettingsOpen}
          style={{ padding: "4px 10px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, background: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "white" }}>
          設定
        </button>
      </div>
    </div>
  );
}
