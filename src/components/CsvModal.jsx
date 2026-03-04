import React, { useState, useRef } from "react";
import { STAFF, DAYS } from "../data.js";
import { generateStaffCsv, generateUsersCsv, parseUsersCsv, downloadCsv } from "../utils/csv.js";
import { lbl } from "../styles.js";

export default function CsvModal({ users, areas, onClose, onImport, isDemo }) {
  const [tab, setTab] = useState("export");
  const [file, setFile] = useState(null);
  const [mergeMode, setMergeMode] = useState(isDemo ? "replace" : "merge"); // merge | replace
  const [parseResult, setParseResult] = useState(null); // { data, errors }
  const [importDone, setImportDone] = useState(false);
  const fileRef = useRef(null);

  const handleExportStaff = () => {
    downloadCsv("職員マスタ.csv", generateStaffCsv());
  };

  const handleExportUsers = () => {
    downloadCsv("利用者スケジュール.csv", generateUsersCsv(users));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setImportDone(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = parseUsersCsv(ev.target.result, areas);
      setParseResult(result);
    };
    reader.readAsText(f, "UTF-8");
  };

  const handleImport = () => {
    if (!parseResult || parseResult.data.length === 0) return;
    if (mergeMode === "replace" && !isDemo && !window.confirm("全件置換すると既存の利用者データがすべて削除されます。よろしいですか？")) return;
    onImport(parseResult.data, mergeMode);
    setImportDone(true);
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
      <div style={{ background: "white", borderRadius: 14, width: 640, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>CSV入出力</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>利用者・スケジュールデータの一括エクスポート・インポート</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <div style={{ padding: "16px 24px" }}>
          {/* タブ */}
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, marginBottom: 16 }}>
            <button onClick={() => setTab("export")} style={tabStyle(tab === "export")}>エクスポート</button>
            <button onClick={() => setTab("import")} style={tabStyle(tab === "import")}>インポート</button>
          </div>

          {tab === "export" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* 職員マスタ */}
              <div style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>職員マスタ</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>ID・名前・役職（{STAFF.length}名）</div>
                  </div>
                  <button onClick={handleExportStaff} style={{ padding: "8px 16px", border: "none", background: "#0f172a", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>ダウンロード</button>
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>※ インポート時の担当者ID参照用</div>
              </div>

              {/* 利用者・スケジュール */}
              <div style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>利用者・スケジュール</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>利用者情報＋定期訪問スケジュール（{users.length}名）</div>
                  </div>
                  <button onClick={handleExportUsers} style={{ padding: "8px 16px", border: "none", background: "#0f172a", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>ダウンロード</button>
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>※ 1行＝1訪問スケジュール、BOM付きUTF-8（Excel対応）</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* ファイル選択 */}
              <div style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 8, border: "2px dashed #cbd5e1", textAlign: "center" }}>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: "none" }} />
                <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 20px", border: "1px solid #e2e8f0", background: "white", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                  CSVファイルを選択
                </button>
                {file && <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{file.name}</div>}
              </div>

              {/* マージモード選択 */}
              <div>
                <label style={lbl}>インポートモード</label>
                {isDemo && (
                  <div style={{ padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, marginBottom: 8, fontSize: 11, color: "#92400e" }}>
                    現在デモデータを使用中のため、インポート時にデモデータは自動的に置換されます
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { value: "merge", label: "更新", desc: "名前+住所一致で上書き＋新規追加" },
                    { value: "replace", label: "全件置換", desc: "既存データを全削除して入れ替え" },
                  ].map((m) => (
                    <button key={m.value} onClick={() => !isDemo && setMergeMode(m.value)}
                      style={{
                        flex: 1, padding: "10px 12px", border: `2px solid ${mergeMode === m.value ? "#3b82f6" : "#e2e8f0"}`,
                        borderRadius: 8, cursor: isDemo ? "default" : "pointer", textAlign: "left",
                        background: mergeMode === m.value ? "#eff6ff" : "white",
                        opacity: isDemo && m.value !== "replace" ? 0.5 : 1,
                      }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: mergeMode === m.value ? "#1d4ed8" : "#1e293b" }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* バリデーション結果 */}
              {parseResult && (
                <div style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    <div style={{ padding: "6px 12px", background: "#ecfdf5", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#059669" }}>
                      正常: {parseResult.data.length}件
                    </div>
                    {parseResult.errors.length > 0 && (
                      <div style={{ padding: "6px 12px", background: "#fef2f2", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#dc2626" }}>
                        エラー: {parseResult.errors.length}件
                      </div>
                    )}
                  </div>

                  {/* エラー詳細 */}
                  {parseResult.errors.length > 0 && (
                    <div style={{ maxHeight: 120, overflowY: "auto", marginBottom: 8 }}>
                      {parseResult.errors.map((e, i) => (
                        <div key={i} style={{ fontSize: 10, color: "#dc2626", padding: "3px 0", borderBottom: "1px solid #fef2f2" }}>
                          行{e.row}: {e.message}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* プレビュー */}
                  {parseResult.data.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>プレビュー（先頭5件）</div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ background: "#f8fafc" }}>
                              {["ID", "利用者名", "エリア", "保険", "スケジュール数"].map((h) => (
                                <th key={h} style={{ padding: "4px 6px", textAlign: "left", borderBottom: "1px solid #e2e8f0", fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {parseResult.data.slice(0, 5).map((u, i) => (
                              <tr key={i}>
                                <td style={{ padding: "4px 6px", borderBottom: "1px solid #f1f5f9" }}>{u.id || "新規"}</td>
                                <td style={{ padding: "4px 6px", borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>{u.name}</td>
                                <td style={{ padding: "4px 6px", borderBottom: "1px solid #f1f5f9" }}>{u.area}</td>
                                <td style={{ padding: "4px 6px", borderBottom: "1px solid #f1f5f9" }}>{u.insuranceType}</td>
                                <td style={{ padding: "4px 6px", borderBottom: "1px solid #f1f5f9" }}>
                                  {u.regularSchedule.length > 0
                                    ? u.regularSchedule.map((s) => `${DAYS[s.day]}${Math.floor(s.hour)}:${String(Math.round((s.hour % 1) * 60)).padStart(2, "0")}`).join(", ")
                                    : "なし"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* インポート実行 */}
              {importDone ? (
                <div style={{ padding: "12px 16px", background: "#ecfdf5", borderRadius: 8, border: "1px solid #a7f3d0", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>インポートが完了しました</div>
                </div>
              ) : (
                <button onClick={handleImport}
                  disabled={!parseResult || parseResult.data.length === 0}
                  style={{
                    width: "100%", padding: "12px", border: "none", borderRadius: 8, cursor: parseResult?.data.length > 0 ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 700,
                    background: parseResult?.data.length > 0 ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "#e2e8f0",
                    color: parseResult?.data.length > 0 ? "white" : "#94a3b8",
                    boxShadow: parseResult?.data.length > 0 ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
                  }}>
                  {parseResult?.data.length > 0
                    ? `${parseResult.data.length}件をインポート${mergeMode === "replace" ? "（全件置換）" : ""}`
                    : "CSVファイルを選択してください"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
