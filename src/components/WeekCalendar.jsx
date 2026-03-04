import { HOURS, DAYS } from "../data.js";
import { VCard } from "./VisitCard.jsx";

export default function WeekCalendar({ staff, wDates, wOff, todayDow, fv, selStaff, dragV, onDrop, onDS, setEditV }) {
  const getCell = (d, h, sid) => fv.filter((v) => v.day === d && v.startHour === h && (sid == null || v.staffId === sid));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", minWidth: 800 }}>
      <div style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }} />
      {DAYS.map((d, i) => {
        const dt = wDates[i];
        const isT = wOff === 0 && i === todayDow;
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
  );
}
