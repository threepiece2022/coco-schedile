import React, { useState } from "react";
import { lbl, sty, inp } from "../styles.js";

export default function SettingsModal({ office, areas, onClose, onSaveOffice, onSaveAreas }) {
  const [tab, setTab] = useState("office");
  const [officeForm, setOfficeForm] = useState({ ...office });
  const [areaList, setAreaList] = useState([...areas]);
  const [newArea, setNewArea] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);

  const handleSaveOffice = () => {
    onSaveOffice(officeForm);
  };

  const handleAddArea = () => {
    const trimmed = newArea.trim();
    if (!trimmed) return;
    if (areaList.includes(trimmed)) { alert("同名のエリアが既に存在します"); return; }
    const updated = [...areaList, trimmed];
    setAreaList(updated);
    onSaveAreas(updated);
    setNewArea("");
  };

  const handleEditArea = (idx) => {
    setEditIdx(idx);
    setEditVal(areaList[idx]);
    setConfirmDeleteIdx(null);
  };

  const handleSaveArea = (idx) => {
    const trimmed = editVal.trim();
    if (!trimmed) return;
    if (areaList.some((a, i) => i !== idx && a === trimmed)) { alert("同名のエリアが既に存在します"); return; }
    const updated = areaList.map((a, i) => i === idx ? trimmed : a);
    setAreaList(updated);
    onSaveAreas(updated);
    setEditIdx(null);
  };

  const handleDeleteArea = (idx) => {
    if (confirmDeleteIdx !== idx) { setConfirmDeleteIdx(idx); return; }
    const updated = areaList.filter((_, i) => i !== idx);
    setAreaList(updated);
    onSaveAreas(updated);
    setConfirmDeleteIdx(null);
  };

  const tabStyle = (active) => ({
    flex: 1, padding: "8px 0", border: "none", borderRadius: 6, cursor: "pointer",
    fontSize: 12, fontWeight: 600,
    background: active ? "white" : "transparent",
    color: active ? "#0f172a" : "#94a3b8",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 14, width: 520, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>設定</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>事業所情報・エリア管理</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <div style={{ padding: "16px 24px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, marginBottom: 16 }}>
            <button onClick={() => setTab("office")} style={tabStyle(tab === "office")}>事業所情報</button>
            <button onClick={() => setTab("areas")} style={tabStyle(tab === "areas")}>エリア管理</button>
          </div>

          {tab === "office" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={lbl}>事業所名</label>
                <input type="text" value={officeForm.name} onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })} placeholder="例: スリーピース株式会社" style={inp} />
              </div>
              <div>
                <label style={lbl}>住所</label>
                <input type="text" value={officeForm.address} onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })} placeholder="例: 柏市柏1-1-1" style={inp} />
              </div>
              <div>
                <label style={lbl}>電話番号</label>
                <input type="text" value={officeForm.phone} onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })} placeholder="例: 04-7100-0000" style={inp} />
              </div>
              <button onClick={handleSaveOffice}
                style={{ padding: "10px 20px", border: "none", background: "#0f172a", color: "white", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                保存
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Area list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {areaList.map((area, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    {editIdx === idx ? (
                      <>
                        <input type="text" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveArea(idx); if (e.key === "Escape") setEditIdx(null); }}
                          style={{ ...inp, flex: 1 }} autoFocus />
                        <button onClick={() => handleSaveArea(idx)}
                          style={{ padding: "6px 12px", border: "none", background: "#059669", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                          保存
                        </button>
                        <button onClick={() => setEditIdx(null)}
                          style={{ padding: "6px 10px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                          取消
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{area}</span>
                        <button onClick={() => handleEditArea(idx)}
                          style={{ padding: "4px 10px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#475569" }}>
                          編集
                        </button>
                        <button onClick={() => handleDeleteArea(idx)}
                          style={{ padding: "4px 10px", border: `1px solid ${confirmDeleteIdx === idx ? "#dc2626" : "#fca5a5"}`, background: confirmDeleteIdx === idx ? "#dc2626" : "#fef2f2", color: confirmDeleteIdx === idx ? "white" : "#dc2626", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                          {confirmDeleteIdx === idx ? "確認" : "削除"}
                        </button>
                        {confirmDeleteIdx === idx && (
                          <button onClick={() => setConfirmDeleteIdx(null)}
                            style={{ padding: "4px 8px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#64748b" }}>
                            取消
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new area */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="text" value={newArea} onChange={(e) => setNewArea(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddArea(); }}
                  placeholder="新しいエリア名..." style={{ ...inp, flex: 1 }} />
                <button onClick={handleAddArea}
                  style={{ padding: "8px 16px", border: "none", background: "linear-gradient(135deg, #059669, #10b981)", color: "white", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                  追加
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
