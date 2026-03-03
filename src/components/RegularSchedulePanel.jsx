import React, { useState } from "react";
import { STAFF, HOURS, DAYS } from "../data.js";
import { InsBadge } from "./ui.jsx";

/**
 * 定期スケジュール一覧パネル
 * 全利用者の定期訪問を曜日×時間帯のマトリクスで一覧表示
 */
export default function RegularSchedulePanel({ users, visits, onClose }) {
  const [staffFilter, setStaffFilter] = useState("all");
  const [insFilter, setInsFilter] = useState("all");

  // フィルタ適用（エントリ単位でフィルタ）
  const filtered = users.filter((u) => {
    if (insFilter !== "all") {
      const hasMatchingEntry = u.regularSchedule.some((s) => (s.insuranceType ?? u.insuranceType) === insFilter);
      if (!hasMatchingEntry) return false;
    }
    if (staffFilter !== "all") {
      const hasMatchingEntry = u.regularSchedule.some((s) => (s.staffId ?? u.staffId) === Number(staffFilter));
      if (!hasMatchingEntry) return false;
    }
    return true;
  });

  // 曜日×時間帯ごとにエントリを取得（ユーザー情報付き）
  const getSlotEntries = (day, hour) => {
    const entries = [];
    filtered.forEach((u) => {
      u.regularSchedule.forEach((s) => {
        if (s.day !== day || s.hour !== hour) return;
        const entryStaffId = s.staffId ?? u.staffId;
        const entryIns = s.insuranceType ?? u.insuranceType;
        if (staffFilter !== "all" && entryStaffId !== Number(staffFilter)) return;
        if (insFilter !== "all" && entryIns !== insFilter) return;
        entries.push({ ...s, user: u, staffId: entryStaffId, insuranceType: entryIns });
      });
    });
    return entries;
  };

  // 各セルの件数を計算（色分け用）
  const getSlotColor = (count) => {
    if (count === 0) return { bg: "#f8fafc", border: "#e2e8f0", text: "#94a3b8" };
    if (count <= 2) return { bg: "#ecfdf5", border: "#86efac", text: "#059669" };
    if (count <= 4) return { bg: "#fef3c7", border: "#fde68a", text: "#d97706" };
    if (count <= 6) return { bg: "#fed7aa", border: "#fdba74", text: "#c2410c" };
    return { bg: "#fecaca", border: "#fca5a5", text: "#dc2626" };
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "white", borderRadius: 14, width: "92vw", maxWidth: 1100, maxHeight: "90vh",
        overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #eff6ff, #eef2ff)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>📅 定期スケジュール一覧</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              全利用者の定期訪問を曜日×時間帯で一覧表示 · {filtered.length}名表示中
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* フィルター */}
            <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}
              style={{ padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, outline: "none", color: "#334155" }}>
              <option value="all">全スタッフ</option>
              {STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={insFilter} onChange={(e) => setInsFilter(e.target.value)}
              style={{ padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, outline: "none", color: "#334155" }}>
              <option value="all">全保険種別</option>
              <option value="介護">介護保険</option>
              <option value="医療">医療保険</option>
            </select>
            <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "16px 24px" }}>
          {/* 凡例 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 10 }}>
            {[
              { bg: "#f8fafc", border: "#e2e8f0", label: "0件" },
              { bg: "#ecfdf5", border: "#86efac", label: "1-2件" },
              { bg: "#fef3c7", border: "#fde68a", label: "3-4件" },
              { bg: "#fed7aa", border: "#fdba74", label: "5-6件" },
              { bg: "#fecaca", border: "#fca5a5", label: "7件+" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                <span style={{ color: "#64748b", fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* マトリクス */}
          <div style={{ display: "grid", gridTemplateColumns: `70px repeat(${DAYS.length}, 1fr)`, gap: 2 }}>
            <div />
            {DAYS.map((d, i) => (
              <div key={d} style={{
                textAlign: "center", fontSize: 11, fontWeight: 700, padding: "6px 0",
                color: i >= 5 ? "#ef4444" : "#475569",
              }}>{d}</div>
            ))}
            {HOURS.map((h) => (
              <React.Fragment key={h}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textAlign: "right", padding: "6px 8px 6px 0" }}>
                  {h}:00
                </div>
                {DAYS.map((_, di) => {
                  const slotEntries = getSlotEntries(di, h);
                  const count = slotEntries.length;
                  const sc = getSlotColor(count);
                  return (
                    <div key={di} style={{
                      padding: "4px 3px", borderRadius: 6, minHeight: 32,
                      background: sc.bg, border: `1px solid ${sc.border}`,
                      fontSize: 9, overflow: "hidden",
                    }}>
                      {count > 0 && (
                        <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: sc.text, marginBottom: 2 }}>
                          {count}件
                        </div>
                      )}
                      {slotEntries.slice(0, 4).map((entry, idx) => {
                        const entryStaff = STAFF.find((s) => s.id === entry.staffId);
                        return (
                          <div key={`${entry.user.id}-${idx}`} style={{
                            display: "flex", alignItems: "center", gap: 2,
                            padding: "1px 3px", borderRadius: 3, marginBottom: 1,
                            background: "white", border: `1px solid ${entryStaff?.color || "#e2e8f0"}20`,
                          }}>
                            <span style={{ color: entryStaff?.color, fontWeight: 700, fontSize: 8, flexShrink: 0 }}>
                              {entryStaff?.name.slice(0, 2)}
                            </span>
                            <span style={{ color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {entry.user.name}
                            </span>
                            <InsBadge type={entry.insuranceType} />
                          </div>
                        );
                      })}
                      {count > 4 && (
                        <div style={{ textAlign: "center", fontSize: 8, color: "#94a3b8", fontWeight: 600 }}>
                          +{count - 4}件
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* スタッフ別サマリ */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
              👤 スタッフ別 定期件数サマリ
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {STAFF.filter((s) => staffFilter === "all" || s.id === Number(staffFilter)).map((s) => {
                // エントリ単位でカウント
                let userCount = 0;
                let totalEntries = 0;
                filtered.forEach((u) => {
                  const matchingEntries = u.regularSchedule.filter((e) => (e.staffId ?? u.staffId) === s.id);
                  if (matchingEntries.length > 0) {
                    userCount++;
                    totalEntries += matchingEntries.length;
                  }
                });
                return (
                  <div key={s.id} style={{
                    padding: "10px 14px", borderRadius: 8, background: `${s.color}06`,
                    border: `1.5px solid ${s.color}20`, display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", background: `${s.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: s.color, flexShrink: 0,
                    }}>{s.name[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.role}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{userCount}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>名 · 週{totalEntries}回</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
