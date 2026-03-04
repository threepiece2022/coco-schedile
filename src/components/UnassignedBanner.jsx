import { InsBadge } from "./ui.jsx";

export default function UnassignedBanner({ unassignedUsers, unassignedOpen, setUnassignedOpen, setViewUser }) {
  if (unassignedUsers.length === 0) return null;
  return (
    <div style={{ padding: "6px 20px", background: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
      <div onClick={() => setUnassignedOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
        <span style={{ fontSize: 13 }}>⚠</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>未割り当て</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#92400e", background: "#fde68a", borderRadius: 10, padding: "1px 8px" }}>{unassignedUsers.length}名</span>
        <span style={{ fontSize: 10, color: "#b45309", marginLeft: "auto" }}>{unassignedOpen ? "▲" : "▼"}</span>
      </div>
      {unassignedOpen && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {unassignedUsers.map((u) => (
            <button key={u.id} onClick={() => setViewUser(u)}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", border: "1px solid #fde68a", borderRadius: 16, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#1e293b" }}>
              {u.name}
              <InsBadge type={u.insuranceType} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
