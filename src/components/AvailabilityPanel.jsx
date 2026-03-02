import React, { useState } from "react";
import { STAFF, HOURS, DAYS } from "../data.js";

/**
 * 空き状況パネル
 * 全スタッフの時間帯ごとの空き/埋まり状況をヒートマップで表示
 */
export default function AvailabilityPanel({ visits, onClose }) {
  const [hovCell, setHovCell] = useState(null);
  const [selCell, setSelCell] = useState(null);

  // スタッフ×曜日×時間の予定件数を集計
  const getCount = (staffId, day, hour) =>
    visits.filter((v) => v.staffId === staffId && v.day === day && v.startHour === hour && v.status !== "キャンセル").length;

  // 全スタッフの空き人数
  const getFreeCount = (day, hour) =>
    STAFF.filter((s) => getCount(s.id, day, hour) === 0).length;

  // 色計算
  const getCellColor = (count) => {
    if (count === 0) return { bg: "#ecfdf5", text: "#059669", label: "空" };
    if (count === 1) return { bg: "#fef3c7", text: "#d97706", label: "1件" };
    if (count === 2) return { bg: "#fed7aa", text: "#c2410c", label: "2件" };
    return { bg: "#fecaca", text: "#dc2626", label: `${count}件` };
  };

  const getFreeCellColor = (free) => {
    const total = STAFF.length;
    const ratio = free / total;
    if (ratio >= 0.75) return { bg: "#dcfce7", border: "#86efac" };
    if (ratio >= 0.5) return { bg: "#ecfdf5", border: "#a7f3d0" };
    if (ratio >= 0.25) return { bg: "#fef3c7", border: "#fde68a" };
    if (ratio > 0) return { bg: "#fed7aa", border: "#fdba74" };
    return { bg: "#fecaca", border: "#fca5a5" };
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "white", borderRadius: 14, width: "90vw", maxWidth: 1000, maxHeight: "90vh",
        overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>📊 スタッフ空き状況</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              各スタッフの時間帯ごとの予定状況を一覧表示
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 6, fontSize: 10 }}>
              {[
                { bg: "#ecfdf5", label: "空き", border: "#86efac" },
                { bg: "#fef3c7", label: "1件", border: "#fde68a" },
                { bg: "#fed7aa", label: "2件", border: "#fdba74" },
                { bg: "#fecaca", label: "3件+", border: "#fca5a5" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                  <span style={{ color: "#64748b", fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "16px 24px" }}>
          {/* サマリー: 全体空き人数ヒートマップ */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
              🟢 時間帯別 空きスタッフ人数（全{STAFF.length}名中）
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`, gap: 2 }}>
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
                    const free = getFreeCount(di, h);
                    const fc = getFreeCellColor(free);
                    const isHov = hovCell?.type === "summary" && hovCell.day === di && hovCell.hour === h;
                    return (
                      <div key={di}
                        onClick={() => setSelCell(selCell?.day === di && selCell?.hour === h ? null : { day: di, hour: h })}
                        onMouseEnter={() => setHovCell({ type: "summary", day: di, hour: h })}
                        onMouseLeave={() => setHovCell(null)}
                        style={{
                          textAlign: "center", padding: "6px 4px", borderRadius: 6,
                          background: fc.bg, border: `1.5px solid ${(selCell?.day === di && selCell?.hour === h) ? "#059669" : isHov ? "#059669" : fc.border}`,
                          fontSize: 13, fontWeight: 800,
                          color: free === 0 ? "#dc2626" : free <= 2 ? "#d97706" : "#059669",
                          cursor: "pointer", transition: "border-color 0.1s",
                          position: "relative",
                          outline: (selCell?.day === di && selCell?.hour === h) ? "2px solid #05966950" : "none",
                          outlineOffset: 1,
                        }}>
                        {free}
                        <span style={{ fontSize: 8, fontWeight: 500, color: "#94a3b8" }}>/{STAFF.length}</span>
                        {/* ホバー時ツールチップ */}
                        {isHov && (
                          <div style={{
                            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                            marginTop: 4, background: "#0f172a", color: "white", borderRadius: 8,
                            padding: "8px 12px", fontSize: 10, whiteSpace: "nowrap", zIndex: 10,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{DAYS[di]}曜 {h}:00</div>
                            {STAFF.map((s) => {
                              const cnt = getCount(s.id, di, h);
                              return (
                                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: cnt === 0 ? "#10b981" : "#f59e0b" }} />
                                  <span>{s.name}</span>
                                  <span style={{ marginLeft: "auto", fontWeight: 700, color: cnt === 0 ? "#10b981" : "#fbbf24" }}>
                                    {cnt === 0 ? "空き" : `${cnt}件`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 選択したセルの空きスタッフ詳細 */}
          {selCell && (
            <div style={{ marginBottom: 16, padding: 16, background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>📌 {DAYS[selCell.day]}曜 {selCell.hour}:00 の空き状況</span>
                <button onClick={() => setSelCell(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8" }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {STAFF.map((s) => {
                  const cnt = getCount(s.id, selCell.day, selCell.hour);
                  const isFree = cnt === 0;
                  const cellVisits = visits.filter((v) => v.staffId === s.id && v.day === selCell.day && v.startHour === selCell.hour && v.status !== "キャンセル");
                  return (
                    <div key={s.id} style={{
                      padding: "8px 12px", borderRadius: 8,
                      background: isFree ? "white" : "#fef2f2",
                      border: `1.5px solid ${isFree ? "#86efac" : "#fecaca"}`,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: isFree ? "#10b981" : "#ef4444", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.role}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isFree ? "#059669" : "#dc2626" }}>
                        {isFree ? "✓ 空き" : cellVisits.map((v) => v.userName).join(", ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* スタッフ別詳細 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
              👤 スタッフ別スケジュール一覧
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`, gap: 2 }}>
              <div />
              {DAYS.map((d, i) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, padding: "4px 0", color: i >= 5 ? "#ef4444" : "#64748b" }}>{d}</div>
              ))}
              {STAFF.map((staff) => (
                <React.Fragment key={staff.id}>
                  <div style={{
                    gridColumn: "1 / -1", padding: "8px 0 4px", fontSize: 12, fontWeight: 700,
                    color: staff.color, display: "flex", alignItems: "center", gap: 6,
                    borderTop: "1px solid #f1f5f9", marginTop: 4,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", background: `${staff.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: staff.color,
                    }}>{staff.name[0]}</div>
                    {staff.name}
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                      {staff.role} · 週{visits.filter((v) => v.staffId === staff.id && v.status !== "キャンセル").length}件
                    </span>
                  </div>
                  <div />
                  {DAYS.map((_, di) => (
                    <div key={di} style={{ display: "flex", flexDirection: "column", gap: 1 }} />
                  ))}
                  {HOURS.map((h) => (
                    <React.Fragment key={h}>
                      <div style={{ fontSize: 9, color: "#cbd5e1", textAlign: "right", padding: "3px 6px 3px 0" }}>{h}:00</div>
                      {DAYS.map((_, di) => {
                        const cnt = getCount(staff.id, di, h);
                        const cc = getCellColor(cnt);
                        const cellVisits = visits.filter((v) => v.staffId === staff.id && v.day === di && v.startHour === h && v.status !== "キャンセル");
                        return (
                          <div key={di} style={{
                            textAlign: "center", padding: "3px 2px", borderRadius: 4,
                            background: cc.bg, fontSize: 9, fontWeight: 700, color: cc.text,
                            border: `1px solid ${cc.bg}`,
                            cursor: cellVisits.length > 0 ? "help" : "default",
                          }} title={cellVisits.length > 0 ? cellVisits.map((v) => `${v.userName} (${v.serviceCode})`).join(", ") : "空き"}>
                            {cnt === 0 ? "◯" : cellVisits.map((v) => v.userName.slice(-3)).join(",")}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
