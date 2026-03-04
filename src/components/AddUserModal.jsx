import React, { useState } from "react";
import { SERVICE_CODES, ALL_CODES, HOURS, DAYS, getCodeDuration, USER_STATUSES, CARE_LEVELS } from "../data.js";
import { InsBadge, Section } from "./ui.jsx";
import { lbl, sty, inp } from "../styles.js";

const DURATION_OPTIONS = [1/3, 0.5, 2/3, 1, 1.5, 2];
const fmtDur = (d) => d < 1 ? `${Math.round(d * 60)}分` : Number.isInteger(d) ? `${d}時間` : `${Math.floor(d)}時間${Math.round((d % 1) * 60)}分`;

const EMPTY_USER = {
  name: "", nameKana: "", address: "", area: "柏エリア",
  insuranceType: "介護", serviceCode: "1313", serviceLabel: "訪看Ⅰ3（30分〜1時間未満）",
  frequency: 1,
  regularSchedule: [{ day: 0, hour: 9, staffId: 1, serviceCode: "1313", serviceLabel: "訪看Ⅰ3（30分〜1時間未満）", insuranceType: "介護", duration: 1 }],
  staffId: 1, notes: "", status: "利用中", careLevel: "",
};

export default function AddUserModal({ onClose, onSave, areas, staff }) {
  const [form, setForm] = useState({ ...EMPTY_USER });
  const [schedules, setSchedules] = useState([
    { day: 0, hour: 9, staffId: 1, serviceCode: "1313", serviceLabel: "訪看Ⅰ3（30分〜1時間未満）", insuranceType: "介護", duration: 1 },
  ]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addSched = () => {
    if (schedules.length < 7) {
      setSchedules([...schedules, {
        day: schedules.length, hour: 9,
        staffId: form.staffId, serviceCode: form.serviceCode,
        serviceLabel: form.serviceLabel, insuranceType: form.insuranceType,
        duration: getCodeDuration(form.serviceCode),
      }]);
    }
  };
  const rmSched = (i) => { if (schedules.length > 1) setSchedules(schedules.filter((_, j) => j !== i)); };
  const setSched = (i, k, v) => setSchedules(schedules.map((s, j) => j === i ? { ...s, [k]: v } : s));

  const setSchedCode = (i, code) => {
    const sc = ALL_CODES.find((c) => c.code === code);
    if (sc) setSchedules(schedules.map((s, j) => j === i ? { ...s, serviceCode: sc.code, serviceLabel: sc.label, insuranceType: sc.insurance, duration: sc.duration } : s));
  };

  const handleSave = () => {
    if (!form.name.trim()) { alert("利用者名を入力してください"); return; }
    if (!form.address.trim()) { alert("住所を入力してください"); return; }
    onSave({ ...form, regularSchedule: schedules, frequency: schedules.length });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 14, width: 540, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>➕ 新規利用者の追加</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>利用者情報と定期訪問スケジュールを設定します</div>
        </div>
        <div style={{ padding: "16px 24px" }}>
          <Section icon="👤" title="基本情報">
            <div style={{ display: "grid", gap: 10 }}>
              <div><label style={lbl}>利用者名 <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="例: 山田 太郎" style={inp} /></div>
              <div><label style={lbl}>フリガナ</label>
                <input type="text" value={form.nameKana} onChange={(e) => set("nameKana", e.target.value)} placeholder="例: ヤマダ タロウ" style={inp} /></div>
              <div><label style={lbl}>住所 <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="例: 柏市柏1-1-1" style={inp} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={lbl}>エリア</label>
                  <select value={form.area} onChange={(e) => set("area", e.target.value)} style={sty}>
                    {(areas || ["柏エリア", "高塚エリア", "松戸エリア"]).map((a) => <option key={a}>{a}</option>)}
                  </select></div>
                <div><label style={lbl}>ステータス</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} style={sty}>
                    {USER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div><label style={lbl}>介護度</label>
                <select value={form.careLevel} onChange={(e) => set("careLevel", e.target.value)} style={sty}>
                  {CARE_LEVELS.map((l) => <option key={l} value={l}>{l || "未設定"}</option>)}
                </select></div>
            </div>
          </Section>

          <Section icon="📅" title="定期訪問スケジュール" badge={`週${schedules.length}回`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {schedules.map((s, i) => {
                const insColor = s.insuranceType === "医療";
                return (
                  <div key={i} style={{ padding: "8px 12px", background: insColor ? "#fffbeb" : "#f8fafc", borderRadius: 8, border: `1px solid ${insColor ? "#fde68a" : "#f1f5f9"}` }}>
                    {/* Row 1: number, day, time, duration, delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", minWidth: 20 }}>{i + 1}.</span>
                      <select value={s.day} onChange={(e) => setSched(i, "day", Number(e.target.value))} style={{ ...sty, flex: 1 }}>
                        {DAYS.map((d, j) => <option key={j} value={j}>{d}曜日</option>)}
                      </select>
                      <select value={s.hour} onChange={(e) => setSched(i, "hour", Number(e.target.value))} style={{ ...sty, flex: 1 }}>
                        {HOURS.map((h) => <option key={h} value={h}>{h}:00</option>)}
                      </select>
                      <select value={s.duration} onChange={(e) => setSched(i, "duration", Number(e.target.value))} style={{ ...sty, width: 80, flex: "none", fontSize: 10, color: "#059669", fontWeight: 600 }}>
                        {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{fmtDur(d)}</option>)}
                      </select>
                      {schedules.length > 1 && <button onClick={() => rmSched(i)} style={{ border: "none", background: "#fee2e2", color: "#dc2626", borderRadius: 4, cursor: "pointer", padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>✕</button>}
                    </div>
                    {/* Row 2: staff, insurance toggle, service code */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 28 }}>
                      <select value={s.staffId} onChange={(e) => setSched(i, "staffId", Number(e.target.value))} style={{ ...sty, flex: 1, fontSize: 10 }}>
                        {staff.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                      </select>
                      <div style={{ display: "flex", gap: 2 }}>
                        {["介護", "医療", "自費"].map((t) => (
                          <button key={t} onClick={() => {
                            const codes = t === "介護" ? SERVICE_CODES.kaigo : t === "医療" ? SERVICE_CODES.iryo : SERVICE_CODES.jihi;
                            const sc = codes[0];
                            setSchedules(schedules.map((ss, j) => j === i ? { ...ss, insuranceType: t, serviceCode: sc.code, serviceLabel: sc.label, duration: sc.duration } : ss));
                          }}
                            style={{
                              padding: "3px 8px", border: `1.5px solid ${s.insuranceType === t ? (t === "医療" ? "#f59e0b" : t === "自費" ? "#a855f7" : "#3b82f6") : "#e2e8f0"}`,
                              borderRadius: 5, cursor: "pointer", fontWeight: 700, fontSize: 10,
                              background: s.insuranceType === t ? (t === "医療" ? "#fef3c7" : t === "自費" ? "#f3e8ff" : "#dbeafe") : "white",
                              color: s.insuranceType === t ? (t === "医療" ? "#92400e" : t === "自費" ? "#6b21a8" : "#1e40af") : "#94a3b8",
                            }}>{t}</button>
                        ))}
                      </div>
                      <select value={s.serviceCode} onChange={(e) => setSchedCode(i, e.target.value)} style={{ ...sty, flex: 2, fontSize: 10 }}>
                        <optgroup label="介護保険">{SERVICE_CODES.kaigo.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
                        <optgroup label="医療保険">{SERVICE_CODES.iryo.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
                        <optgroup label="自費">{SERVICE_CODES.jihi.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
                      </select>
                    </div>
                  </div>
                );
              })}
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
