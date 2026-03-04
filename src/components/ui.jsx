import React from "react";

export const InsBadge = ({ type }) => {
  const colors = type === "医療"
    ? { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" }
    : type === "自費"
    ? { bg: "#f3e8ff", color: "#6b21a8", border: "#c084fc" }
    : { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" };
  return (
    <span style={{
      fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700,
      background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`,
    }}>{type}</span>
  );
};

export const StBadge = ({ status }) => {
  const c = {
    "予定": ["#f1f5f9", "#475569", "#cbd5e1"],
    "確定": ["#dcfce7", "#166534", "#86efac"],
    "完了": ["#f3f4f6", "#374151", "#d1d5db"],
    "キャンセル": ["#fee2e2", "#991b1b", "#fca5a5"],
  }[status] || ["#f1f5f9", "#475569", "#cbd5e1"];
  return (
    <span style={{
      fontSize: 9, padding: "1px 5px", borderRadius: 3,
      background: c[0], color: c[1], border: `1px solid ${c[2]}`, fontWeight: 600,
    }}>{status}</span>
  );
};

export const StatusBadge = ({ status }) => {
  const c = {
    "利用中": ["#dcfce7", "#166534", "#86efac"],
    "中止中": ["#fef3c7", "#92400e", "#fcd34d"],
    "終了": ["#f3f4f6", "#374151", "#d1d5db"],
  }[status] || ["#f3f4f6", "#374151", "#d1d5db"];
  return (
    <span style={{
      fontSize: 9, padding: "1px 5px", borderRadius: 3,
      background: c[0], color: c[1], border: `1px solid ${c[2]}`, fontWeight: 600,
    }}>{status}</span>
  );
};

export const CareLevelBadge = ({ level }) => {
  if (!level) return null;
  const isShien = level.startsWith("要支援");
  return (
    <span style={{
      fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700,
      background: isShien ? "#dcfce7" : "#fff7ed",
      color: isShien ? "#166534" : "#9a3412",
      border: `1px solid ${isShien ? "#86efac" : "#fdba74"}`,
    }}>{level}</span>
  );
};

export const Section = ({ icon, title, badge, bg, border, children }) => (
  <div style={{ marginBottom: 16, ...(bg ? { padding: 14, background: bg, borderRadius: 8, border: `1px solid ${border}` } : {}) }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 14 }}>{icon}</span> {title}
      {badge && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>{badge}</span>}
    </div>
    {children}
  </div>
);

export const InfoRow = ({ label, value, full, extra }) => (
  <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>{value}{extra}</div>
  </div>
);
