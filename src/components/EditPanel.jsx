import { HOURS, DAYS, SERVICE_CODES, ALL_CODES, getCodeShort } from "../data.js";
import { lbl, sty } from "../styles.js";

export default function EditPanel({ editV, setEditV, staff, users, calendarMode, onSave, onDelete, setViewUser }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1000 }} onClick={() => setEditV(null)}>
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 400,
        background: "white", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column", overflow: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>訪問予定の編集</div>
          <button onClick={() => setEditV(null)} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <div style={{ padding: "16px 20px", flex: 1 }}>
          {/* 利用者リンク */}
          <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{editV.userName}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{editV.insuranceType === "医療" ? "医療保険" : editV.insuranceType === "自費" ? "自費" : "介護保険"} · {getCodeShort(editV.serviceCode)}</div>
            </div>
            <button onClick={() => {
              const u = users.find((u) => u.id === editV.userId);
              if (u) { setViewUser(u); setEditV(null); }
            }} style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#3b82f6" }}>
              利用者情報を編集 →
            </button>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={lbl}>担当スタッフ</label>
              <select value={editV.staffId} onChange={(e) => setEditV({ ...editV, staffId: Number(e.target.value) })} style={sty}>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><label style={lbl}>曜日</label><select value={editV.day} onChange={(e) => setEditV({ ...editV, day: Number(e.target.value) })} style={sty}>{DAYS.map((d, i) => <option key={i} value={i}>{d}曜日</option>)}</select></div>
              <div><label style={lbl}>開始時間</label><select value={editV.startHour} onChange={(e) => setEditV({ ...editV, startHour: Number(e.target.value) })} style={sty}>{HOURS.flatMap((h) => Array.from({ length: 12 }, (_, i) => { const t = h + i * 5 / 60; return <option key={t} value={t}>{h}:{String(i * 5).padStart(2, "0")}</option>; }))}</select></div>
            </div>
            <div><label style={lbl}>サービスコード</label>
              <select value={editV.serviceCode} onChange={(e) => { const sc = ALL_CODES.find((c) => c.code === e.target.value); setEditV({ ...editV, serviceCode: e.target.value, insuranceType: sc?.insurance || editV.insuranceType }); }} style={sty}>
                <optgroup label="介護保険">{SERVICE_CODES.kaigo.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
                <optgroup label="医療保険">{SERVICE_CODES.iryo.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
                <optgroup label="自費">{SERVICE_CODES.jihi.map((c) => <option key={c.code} value={c.code}>{c.short} - {c.label}</option>)}</optgroup>
              </select></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><label style={lbl}>訪問種別</label><select value={editV.type} onChange={(e) => setEditV({ ...editV, type: e.target.value })} style={sty}>{["訪問看護", "医療訪問看護", "リハビリ", "特別訪問", "緊急訪問"].map((t) => <option key={t}>{t}</option>)}</select></div>
              <div><label style={lbl}>ステータス</label><select value={editV.status} onChange={(e) => setEditV({ ...editV, status: e.target.value })} style={sty}>{["予定", "確定", "完了", "キャンセル"].map((s) => <option key={s}>{s}</option>)}</select></div>
            </div>
          </div>

          {calendarMode === "day" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 10px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6 }}>
              <input type="checkbox" id="editPerm" checked={editV.editPerm || false} onChange={(e) => setEditV({ ...editV, editPerm: e.target.checked })}
                style={{ accentColor: "#d97706" }} />
              <label htmlFor="editPerm" style={{ fontSize: 11, color: "#92400e", fontWeight: 600, cursor: "pointer" }}>定期スケジュールにも反映する</label>
              <span style={{ fontSize: 9, color: "#b45309" }}>（この日のみ / 定期）</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
          <button onClick={onDelete} style={{ padding: "8px 14px", border: "1px solid #fca5a5", background: "#fef2f2", color: "#dc2626", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>削除</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => setEditV(null)} style={{ padding: "8px 14px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#64748b" }}>キャンセル</button>
          <button onClick={onSave} style={{ padding: "8px 14px", border: "none", background: "#0f172a", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{calendarMode === "day" && !editV.editPerm ? "この日のみ保存" : "保存"}</button>
        </div>
      </div>
    </div>
  );
}
