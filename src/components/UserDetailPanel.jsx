import React from "react";
import { STAFF, DAYS, DAY_FULL, ALL_CODES } from "../data.js";
import { InsBadge, StBadge, Section, InfoRow } from "./ui.jsx";

export default function UserDetailPanel({ user, visits, onClose }) {
  if (!user) return null;
  const uv = visits.filter((v) => v.userId === user.id);
  const staff = STAFF.find((s) => s.id === user.staffId);
  const sc = ALL_CODES.find((c) => c.code === user.serviceCode);
  const m = user.insuranceType === "医療";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 14, width: 480, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", background: m ? "linear-gradient(135deg, #fefce8, #fff7ed)" : "linear-gradient(135deg, #eff6ff, #f0f9ff)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{user.area}</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <InsBadge type={user.insuranceType} />
              <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 24px" }}>
          <Section icon="📋" title="基本情報">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <InfoRow label="住所" value={user.address} full />
              <InfoRow label="担当スタッフ" value={staff?.name || "未設定"} />
              <InfoRow label="エリア" value={user.area} />
            </div>
          </Section>
          <Section icon="🏥" title="保険・サービス情報" bg={m ? "#fffbeb" : "#eff6ff"} border={m ? "#fde68a" : "#bfdbfe"}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <InfoRow label="保険種別" value={user.insuranceType + "保険"} extra={<InsBadge type={user.insuranceType} />} />
              <InfoRow label="サービスコード" value={user.serviceCode} />
              <InfoRow label="サービス名称" value={sc?.label || user.serviceLabel} full />
            </div>
          </Section>
          <Section icon="📅" title="定期訪問スケジュール" badge={`週${user.frequency}回`}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {user.regularSchedule.map((s, i) => (
                <div key={i} style={{ padding: "8px 14px", borderRadius: 8, background: "white", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{DAY_FULL[s.day]}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{s.hour}:00〜</div>
                </div>
              ))}
            </div>
          </Section>
          <Section icon="📊" title="今週の訪問予定" badge={`${uv.length}件`}>
            {uv.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 12, padding: 10 }}>今週の訪問予定はありません</div> :
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {uv.map((v) => {
                  const vs = STAFF.find((s) => s.id === v.staffId);
                  return (
                    <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#fafbfc", borderRadius: 6, border: "1px solid #f1f5f9" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: vs?.color || "#94a3b8", flexShrink: 0 }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", minWidth: 32 }}>{DAYS[v.day]}曜</div>
                      <div style={{ fontSize: 12, color: "#475569" }}>{v.startHour}:00〜</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{vs?.name}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>{v.serviceCode}</div>
                      <div style={{ marginLeft: "auto" }}><StBadge status={v.status} /></div>
                    </div>
                  );
                })}
              </div>}
          </Section>
          {user.notes && <div style={{ marginTop: 14, padding: "10px 12px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca", fontSize: 12, color: "#991b1b" }}>⚠️ {user.notes}</div>}
        </div>
      </div>
    </div>
  );
}
