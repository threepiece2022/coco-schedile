import React, { useState } from "react";
import { getStaffColor } from "../data.js";
import { lbl, inp } from "../styles.js";

const VALID_ROLES = ["看護師", "理学療法士", "作業療法士", "言語聴覚士"];

export default function StaffManagerPanel({ staff, visits, onClose, onSave }) {
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("看護師");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("看護師");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const startEdit = (s) => {
    setEditId(s.id);
    setEditName(s.name);
    setEditRole(s.role);
    setConfirmDeleteId(null);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    const updated = staff.map((s) => s.id === editId ? { ...s, name: editName.trim(), role: editRole } : s);
    onSave(updated);
    setEditId(null);
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const nextId = staff.length > 0 ? Math.max(...staff.map((s) => s.id)) + 1 : 1;
    onSave([...staff, { id: nextId, name, role: newRole }]);
    setNewName("");
    setNewRole("看護師");
  };

  const handleDelete = (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    onSave(staff.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
  };

  const getVisitCount = (staffId) => visits.filter((v) => v.staffId === staffId).length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 14, width: 520, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>スタッフ管理</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>スタッフの追加・編集・削除（{staff.length}名）</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <div style={{ padding: "16px 24px" }}>
          {/* Staff list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {staff.map((s) => {
              const vc = getVisitCount(s.id);
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  {editId === s.id ? (
                    <>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditId(null); }}
                        style={{ ...inp, flex: 1 }} autoFocus />
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                        style={{ padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, outline: "none" }}>
                        {VALID_ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                      <button onClick={saveEdit}
                        style={{ padding: "6px 12px", border: "none", background: "#059669", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        保存
                      </button>
                      <button onClick={() => setEditId(null)}
                        style={{ padding: "6px 10px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${getStaffColor(s.id)}18`, color: getStaffColor(s.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{s.name[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.role} · {vc}件</div>
                      </div>
                      <button onClick={() => startEdit(s)}
                        style={{ padding: "4px 10px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#475569" }}>
                        編集
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        style={{ padding: "4px 10px", border: `1px solid ${confirmDeleteId === s.id ? "#dc2626" : "#fca5a5"}`, background: confirmDeleteId === s.id ? "#dc2626" : "#fef2f2", color: confirmDeleteId === s.id ? "white" : "#dc2626", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        {confirmDeleteId === s.id ? "確認" : "削除"}
                      </button>
                      {confirmDeleteId === s.id && (
                        <>
                          {vc > 0 && <span style={{ fontSize: 9, color: "#dc2626", fontWeight: 600 }}>担当{vc}件あり</span>}
                          <button onClick={() => setConfirmDeleteId(null)}
                            style={{ padding: "4px 8px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#64748b" }}>
                            取消
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add new staff */}
          <div style={{ padding: "12px 16px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 8 }}>新しいスタッフを追加</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                placeholder="名前..." style={{ ...inp, flex: 1 }} />
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                style={{ padding: "8px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, outline: "none" }}>
                {VALID_ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <button onClick={handleAdd}
                style={{ padding: "8px 16px", border: "none", background: "linear-gradient(135deg, #059669, #10b981)", color: "white", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                追加
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
