import { HOURS } from "../data.js";
import { VCard } from "./VisitCard.jsx";

export default function DayCalendar({ staff, dayFilteredVisits, selStaff, setSelStaff, selUser, selDow, dragV, dragPreview, setDragPreview, calcDropHour, onDrop, onDS, setEditV }) {
  const groups = [
    { label: "看護師", members: staff.filter((s) => s.role === "看護師"), color: "#3b82f6" },
    { label: "リハビリ職", members: staff.filter((s) => s.role !== "看護師"), color: "#059669" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", minWidth: 800 }}>
      {/* ヘッダー: 空セル + 時間ラベル */}
      <div style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${HOURS.length}, 1fr)`, borderBottom: "2px solid #e2e8f0" }}>
        {HOURS.map((h) => (
          <div key={`dh-${h}`} style={{ textAlign: "left", padding: "8px 4px", borderLeft: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#64748b" }}>{h}:00</div>
        ))}
      </div>

      {/* スタッフ行（グループ別） */}
      {groups.map((group) => (<>
        {/* グループヘッダー */}
        <div key={`gh-${group.label}`} style={{ padding: "4px 8px", background: `${group.color}08`, borderBottom: "2px solid ${group.color}30", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: group.color }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: group.color }}>{group.label}</span>
          <span style={{ fontSize: 9, color: "#94a3b8" }}>{group.members.length}名</span>
        </div>
        <div style={{ background: `${group.color}05`, borderBottom: `2px solid ${group.color}20` }} />

        {group.members.map((s) => {
          const dayCt = dayFilteredVisits.filter((v) => v.staffId === s.id).length;
          const staffVisits = dayFilteredVisits.filter((v) => v.staffId === s.id);
          const isSelected = selStaff === s.id;
          return (<>
            <div key={`sl-${s.id}`} onClick={() => setSelStaff(selStaff === s.id ? null : s.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderBottom: "1px solid #e2e8f0", background: isSelected ? `${group.color}10` : "#f8fafc", cursor: "pointer" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${group.color}18`, color: group.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{s.name[0]}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? group.color : "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                <div style={{ fontSize: 9, color: "#94a3b8" }}>{dayCt}件</div>
              </div>
            </div>
            <div style={{ position: "relative", height: 56, borderBottom: "1px solid #e2e8f0", overflow: "visible" }}>
              {/* 時間グリッド線 */}
              <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${HOURS.length * 2}, 1fr)`, pointerEvents: "none" }}>
                {HOURS.flatMap((h) => [
                  <div key={`gl-${s.id}-${h}`} style={{ borderLeft: "1px solid #cbd5e1" }} />,
                  <div key={`gl-${s.id}-${h}-half`} style={{ borderLeft: "1px dashed #e2e8f0" }} />,
                ])}
              </div>
              {/* ドロップターゲット + プレビュー */}
              <div style={{ position: "absolute", inset: 0 }}
                onDragOver={(e) => { e.preventDefault(); const h = calcDropHour(e); setDragPreview({ staffId: s.id, hour: h }); }}
                onDragLeave={() => setDragPreview((p) => p?.staffId === s.id ? null : p)}
                onDrop={(e) => { const h = calcDropHour(e); onDrop(e, selDow, h, s.id); }}
              >
                {dragV && dragPreview?.staffId === s.id && (() => {
                  const ph = dragPreview.hour;
                  const dur = dragV.duration;
                  const pLeft = ((ph - HOURS[0]) / HOURS.length) * 100;
                  const pWidth = (dur / HOURS.length) * 100;
                  const mm = `${Math.floor(ph)}:${String(Math.round((ph % 1) * 60)).padStart(2, "0")}`;
                  return (
                    <div style={{ position: "absolute", left: `${pLeft}%`, width: `${pWidth}%`, top: 0, bottom: 0, background: "#3b82f620", border: "2px dashed #3b82f6", borderRadius: 6, zIndex: 10, pointerEvents: "none" }}>
                      <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 2, fontSize: 11, fontWeight: 800, color: "white", background: "#3b82f6", padding: "2px 8px", borderRadius: 4, boxShadow: "0 2px 8px rgba(59,130,246,0.4)", whiteSpace: "nowrap", zIndex: 20 }}>{mm}</div>
                    </div>
                  );
                })()}
              </div>
              {/* 訪問カード */}
              {staffVisits.map((v) => {
                const left = ((v.startHour - HOURS[0]) / HOURS.length) * 100;
                const width = (v.duration / HOURS.length) * 100;
                const isHighlighted = selUser && v.userId === selUser;
                const conflict = staffVisits.some((o) => o.id !== v.id && o.startHour < v.startHour + v.duration && o.startHour + o.duration > v.startHour);
                return (
                  <div key={v.id} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 2, bottom: 2, padding: "0 1px", boxSizing: "border-box", zIndex: 2 }}>
                    <VCard visit={v} staff={s} isDrag={dragV?.id === v.id} onDS={onDS} onEdit={(vv) => setEditV({ ...vv, editPerm: false })} hMode conflict={conflict} />
                    {isHighlighted && <div style={{ position: "absolute", inset: "0 1px", border: "2px solid #f59e0b", borderRadius: 6, pointerEvents: "none" }} />}
                    {v._isAdj && <div style={{ position: "absolute", top: 1, right: 3, fontSize: 7, fontWeight: 700, color: "#ea580c", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 3, padding: "0 3px", lineHeight: "13px", pointerEvents: "none", zIndex: 3 }}>一時</div>}
                  </div>
                );
              })}
            </div>
          </>);
        })}
      </>))}
    </div>
  );
}
