import React, { useState } from "react";
import { STAFF, SERVICE_CODES, ALL_CODES, HOURS, DAYS } from "../data.js";
import { Section } from "./ui.jsx";
import { lbl, sty, inp } from "../styles.js";

const EMPTY_USER = {
  name: "", address: "", area: "柏エリア", insuranceType: "介護",
  serviceCode: "1313", serviceLabel: "訪看I3（30分〜1時間未満）",
  frequency: 1, regularSchedule: [{ day: 0, hour: 9 }],
  staffId: 1, notes: "",
};

export default function AddUserModal({ onClose, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_USER });
  const [schedules, setSchedules] = useState([{ day: 0, hour: 9 }]);

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
    onSave({ ...form, regularSchedule: schedules, frequency: schedules.length });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 14, width: 500, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>➕ 新規利用者の追加</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>利用者情報と定期訪問スケジュールを設定します</div>
        </div>
        <div style={{ padding: "16px 24px" }}>
          <Section icon="👤" title="基本情報">
            <div style={{ display: "grid", gap: 10 }}>
              <div><label style={lbl}>利用者名 <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="例: 山田 太郎" style={inp} /></div>
              <div><label style={lbl}>住所 <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="例: 柏市柏1-1-1" style={inp} /></div>
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

          <Section icon="🏥" title="保険・サービス情報" bg={form.insuranceType === "医療" ? "#fffbeb" : "#eff6ff"} border={form.insuranceType === "医療" ? "#fde68a" : "#bfdbfe"}>
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
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="例: 独居・見守り強化、医療処置あり..." rows={2}
              style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
            <button onClick={onClose} style={{ padding: "10px 20px", border: "1px solid #e2e8f0", background: "white", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#64748b" }}>キャンセル</button>
            <button onClick={handleSave} style={{ padding: "10px 24px", border: "none", background: "linear-gradient(135deg, #059669, #10b981)", color: "white", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: "0 2px 8px rgba(5,150,105,0.3)" }}>✓ 利用者を追加</button>
          </div>
        </div>
      </div>
    </div>
  );
}
