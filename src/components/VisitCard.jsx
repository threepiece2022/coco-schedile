import { getCodeShort } from "../data.js";
import { StBadge } from "./ui.jsx";

export const insColor = (ins) => ins === "医療"
  ? { bg: "#fffbeb", border: "#f59e0b", text: "#92400e", left: "#d97706" }
  : ins === "自費"
  ? { bg: "#faf5ff", border: "#c084fc", text: "#6b21a8", left: "#a855f7" }
  : { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af", left: "#3b82f6" };

export const fmtTime = (hour, dur) => {
  const em = hour + dur;
  const mm = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
  return `${mm(hour)}〜${mm(em)}`;
};

export const VCard = ({ visit, staff, isDrag, onDS, onEdit, flexMode, hMode, conflict }) => {
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
