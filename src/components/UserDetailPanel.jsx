import React, { useState } from "react";
import { STAFF, SERVICE_CODES, ALL_CODES, HOURS, DAYS, DAY_FULL } from "../data.js";
import { InsBadge, StBadge, Section, InfoRow } from "./ui.jsx";
import { lbl, sty, inp } from "../styles.js";

export default function UserDetailPanel({ user, visits, onClose, onSave, onDelete }) {
  if (!user) return null;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => ({
    name: user.name, address: user.address, area: user.area,
    insuranceType: user.insuranceType, serviceCode: user.serviceCode,
    serviceLabel: user.serviceLabel, staffId: user.staffId, notes: user.notes || "",
  }));
  const [schedules, setSchedules] = useState(() => user.regularSchedule.map((s) => ({ ...s })));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const uv = visits.filter((v) => v.userId === user.id);
  const staff = STAFF.find((s) => s.id === user.staffId);
  const sc = ALL_CODES.find((c) => c.code === user.serviceCode);
  const m = user.insuranceType === "医療";

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setCode = (code) => {
    const sc = ALL_CODES.find((c) => c.code === code);
    if (sc) setForm((f) => ({ ...f, serviceCode: sc.code, serviceLabel: sc.label, insuranceType: sc.insurance }));
  };
  const addSched = () => { if (schedules.length < 7) setSchedules([...schedules, { day: schedules.length, hour: 9 }]); };
  const rmSched = (i) => { if (schedules.length > 1) setSchedules(schedules.filter((_, j) => j !== i)); };
  const setSched = (i, k, v) => setSchedules(schedules.map((s, j) => j === i ? { ...s, [k]: v } : s));

  const handleSave = () => {
    if (!form.name.trim()) { alert("利用者名を入力してください"); return; }
    if (!form.address.trim()) { alert("住所を入力してください"); return; }
    onSave({ ...form, id: user.id, regularSchedule: schedules, frequency: schedules.length });
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(user.id);
  };

  const startEdit = () => {
    setForm({
      name: user.name, address: user.address, area: user.area,
      insuranceType: user.insuranceType, serviceCode: user.serviceCode,
      serviceLabel: user.serviceLabel, staffId: user.staffId, notes: user.notes || "",
    });
    setSchedules(user.regularSchedule.map((s) => ({ ...s })));
    setEditing(true);
    setConfirmDelete(false);
  };

  const cancelEdit = () => { setEditing(false); setConfirmDelete(false); };

  if (editing) {
    const fm = form.insuranceType === "医療";
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
        <div style={{ background: "white", borderRadius: 14, width: 500, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", background: fm ? "linear-gradient(135deg, #fefce8, #fff7ed)" : "linear-gradient(135deg, #eff6ff, #f0f9ff)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>✏️ 利用者情報の編集</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{user.name} の情報を編集します</div>
              </div>
              <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
          </div>
          <div style={{ padding: "16px 24px" }}>
            <Section icon="👤" title="基本情報">
              <div style={{ display: "grid", gap: 10 }}>
                <div><label style={lbl}>利用者名 <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} style={inp} /></div>
                <div><label style={lbl}>住所 <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} style={inp} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><label style={lbl}>エリア</label>
                    <select value={form.area} onChange={(e) => set("area", e.target.value)} style={sty}>
                      {["柏エリア", "高塚エリア", "松戸エリア"].map((a) => <option key={a}>{a}</option>)}
                    </select></div>
                  <div><label style={lbl}>担当スタッフ</label>
                    <select value={form.staffId} onChange={(e) => set("staffId", Number(e.target.value))} style={sty}>
                      {STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select></div>
                </div>
              </div>
            </Section>

            <Section icon="🏥" title="保険・サービス情報" bg={fm ? "#fffbeb" : "#eff6ff"} border={fm ? "#fde68a" : "#bfdbfe"}>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <label style={lbl}>保険種別</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["介護", "医療"].map((t) => (
                      <button key={t} onClick={() => { set("insuranceType", t); const codes = t === "介護" ? SERVICE_CODES.kaigo : SERVICE_CODES.iryo; setCode(codes[0].code); }}
                        style={{ flex: 1, padding: "8px", border: `2px solid ${form.insuranceType === t ? (t === "医療" ? "#f59e0b" : "#3b82f6") : "#e2e8f0"}`, borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13,
                          background: form.insuranceType === t ? (t === "医療" ? "#fef3c7" : "#dbeafe") : "white",
                          color: form.insuranceType === t ? (t === "医療" ? "#92400e" : "#1e40af") : "#94a3b8",
                        }}>{t}保険</button>
                    ))}
                  </div>
                </div>
                <div><label style={lbl}>サービスコード</label>
                  <select value={form.serviceCode} onChange={(e) => setCode(e.target.value)} style={sty}>
                    <optgroup label="介護保険">{SERVICE_CODES.kaigo.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.label}</option>)}</optgroup>
                    <optgroup label="医療保険">{SERVICE_CODES.iryo.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.label}</option>)}</optgroup>
                  </select></div>
              </div>
            </Section>

            <Section icon="📅" title="定期訪問スケジュール" badge={`週${schedules.length}回`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {schedules.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", minWidth: 20 }}>{i + 1}.</span>
                    <select value={s.day} onChange={(e) => setSched(i, "day", Number(e.target.value))} style={{ ...sty, flex: 1 }}>
                      {DAYS.map((d, j) => <option key={j} value={j}>{d}曜日</option>)}
                    </select>
                    <select value={s.hour} onChange={(e) => setSched(i, "hour", Number(e.target.value))} style={{ ...sty, flex: 1 }}>
                      {HOURS.map((h) => <option key={h} value={h}>{h}:00</option>)}
                    </select>
                    {schedules.length > 1 && <button onClick={() => rmSched(i)} style={{ border: "none", background: "#fee2e2", color: "#dc2626", borderRadius: 4, cursor: "pointer", padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>✕</button>}
                  </div>
                ))}
                {schedules.length < 7 && <button onClick={addSched} style={{ padding: "8px", border: "2px dashed #cbd5e1", borderRadius: 8, background: "transparent", cursor: "pointer", color: "#64748b", fontSize: 12, fontWeight: 600 }}>＋ 訪問枠を追加</button>}
              </div>
            </Section>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>備考・注意事項</label>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
                style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} />
            </div>

            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
              <button onClick={handleDelete}
                style={{ padding: "10px 16px", border: `1px solid ${confirmDelete ? "#dc2626" : "#fca5a5"}`, background: confirmDelete ? "#dc2626" : "#fef2f2", color: confirmDelete ? "white" : "#dc2626", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                {confirmDelete ? "本当に削除する" : "🗑 削除"}
              </button>
              {confirmDelete && <button onClick={() => setConfirmDelete(false)} style={{ padding: "10px 12px", border: "1px solid #e2e8f0", background: "white", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#64748b" }}>やめる</button>}
              <div style={{ flex: 1 }} />
              <button onClick={cancelEdit} style={{ padding: "10px 20px", border: "1px solid #e2e8f0", background: "white", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#64748b" }}>キャンセル</button>
              <button onClick={handleSave} style={{ padding: "10px 24px", border: "none", background: "linear-gradient(135deg, #0f172a, #1e3a5f)", color: "white", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: "0 2px 8px rgba(15,23,42,0.3)" }}>✓ 保存</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <button onClick={startEdit} style={{ border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#475569" }}>✏️ 編集</button>
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
