import { useState, useEffect } from "react";
import { DEFAULT_STAFF, INITIAL_USERS, generateVisits, getCodeDuration, getCodeShort, DEFAULT_AREAS } from "./data.js";
import UserDetailPanel from "./components/UserDetailPanel.jsx";
import AddUserModal from "./components/AddUserModal.jsx";
import AvailabilityPanel from "./components/AvailabilityPanel.jsx";
import RegularSchedulePanel from "./components/RegularSchedulePanel.jsx";
import CsvModal from "./components/CsvModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import StaffManagerPanel from "./components/StaffManagerPanel.jsx";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import CalendarToolbar from "./components/CalendarToolbar.jsx";
import UnassignedBanner from "./components/UnassignedBanner.jsx";
import DayCalendar from "./components/DayCalendar.jsx";
import WeekCalendar from "./components/WeekCalendar.jsx";
import EditPanel from "./components/EditPanel.jsx";
import { useCalendarState } from "./hooks/useCalendarState.js";
import { useDragDrop } from "./hooks/useDragDrop.js";

const loadState = (key, fallback) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
};

export default function App() {
  const [staff, setStaff] = useState(() => loadState("coco_staff", DEFAULT_STAFF));
  const [users, setUsers] = useState(() => {
    const raw = loadState("coco_users", INITIAL_USERS);
    return raw.map((u) => ({ ...u, nameKana: u.nameKana || "", status: u.status || "利用中", careLevel: u.careLevel || "" }));
  });
  const [visits, setVisits] = useState(() => loadState("coco_visits", null) || generateVisits(loadState("coco_users", INITIAL_USERS)));
  const [areas, setAreas] = useState(() => loadState("coco_areas", DEFAULT_AREAS));
  const [office, setOffice] = useState(() => loadState("coco_office", { name: "スリーピース株式会社", address: "", phone: "" }));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [staffMgrOpen, setStaffMgrOpen] = useState(false);

  useEffect(() => { localStorage.setItem("coco_staff", JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem("coco_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("coco_visits", JSON.stringify(visits)); }, [visits]);
  useEffect(() => { localStorage.setItem("coco_areas", JSON.stringify(areas)); }, [areas]);
  useEffect(() => { localStorage.setItem("coco_office", JSON.stringify(office)); }, [office]);

  const [viewMode, setViewMode] = useState("staff");
  const [selStaff, setSelStaff] = useState(null);
  const [selUser, setSelUser] = useState(null);
  const [editV, setEditV] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [wOff, setWOff] = useState(0);
  const [insF, setInsF] = useState("all");
  const [regSchedOpen, setRegSchedOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [unassignedOpen, setUnassignedOpen] = useState(true);
  const [userDataImported, setUserDataImported] = useState(() => !!localStorage.getItem("coco_user_imported"));
  const [calendarMode, setCalendarMode] = useState("day");
  const [dayOff, setDayOff] = useState(0);
  const [dayAdj, setDayAdj] = useState(() => loadState("coco_dayAdj", {}));

  useEffect(() => { localStorage.setItem("coco_dayAdj", JSON.stringify(dayAdj)); }, [dayAdj]);

  const { wDates, wLabel, todayDow, selDow, selDateLabel, dateKey } = useCalendarState(wOff, dayOff);
  const { dragV, setDragV, dragPreview, setDragPreview, onDS, onDrop, calcDropHour } = useDragDrop(calendarMode, dayOff, setVisits, setDayAdj);

  // 日次ビュー：一時調整を反映した訪問リスト
  const dayAllVisits = visits.filter((v) => (insF === "all" || v.insuranceType === insF) && v.day === selDow);
  const dayAdjVisits = dayAllVisits.map((v) => {
    const adj = dayAdj[`${dateKey}:${v.id}`];
    return adj ? { ...v, startHour: adj.startHour, staffId: adj.staffId, _isAdj: true } : v;
  });
  const dayFilteredVisits = dayAdjVisits.filter((v) => {
    if (viewMode === "staff" && selStaff) return v.staffId === selStaff;
    if (viewMode === "user" && selUser) return v.userId === selUser;
    return true;
  });
  const dateAdjCount = Object.keys(dayAdj).filter((k) => k.startsWith(`${dateKey}:`)).length;

  const fv = visits.filter((v) => {
    if (insF !== "all" && v.insuranceType !== insF) return false;
    if (viewMode === "staff" && selStaff) return v.staffId === selStaff;
    if (viewMode === "user" && selUser) return v.userId === selUser;
    return true;
  });

  const unassignedUsers = users.filter((u) => !u.regularSchedule || u.regularSchedule.length === 0);

  const fUsers = users.filter((u) =>
    (u.name.includes(search) || (u.nameKana || "").includes(search) || u.area.includes(search) || u.address.includes(search) || u.serviceCode.includes(search)) &&
    (insF === "all" || u.insuranceType === insF)
  );

  const save = () => {
    if (!editV) return;
    const { _isAdj, editPerm, ...cleanV } = editV;
    if (calendarMode === "day" && !editPerm) {
      const d = new Date(); d.setDate(d.getDate() + dayOff);
      const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      setDayAdj((prev) => ({ ...prev, [`${dk}:${cleanV.id}`]: { startHour: cleanV.startHour, staffId: cleanV.staffId } }));
    } else {
      setVisits((p) => p.map((v) => v.id === cleanV.id ? cleanV : v));
      if (calendarMode === "day") {
        const d = new Date(); d.setDate(d.getDate() + dayOff);
        const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        setDayAdj((prev) => { const n = { ...prev }; delete n[`${dk}:${cleanV.id}`]; return n; });
      }
    }
    setEditV(null);
  };
  const del = () => { if (!editV) return; setVisits((p) => p.filter((v) => v.id !== editV.id)); setEditV(null); };

  const addUser = (form) => {
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser = { ...form, id: newId };
    setUsers((prev) => [...prev, newUser]);
    const newVisits = form.regularSchedule.map((s, i) => {
      const staffId = s.staffId ?? form.staffId;
      const serviceCode = s.serviceCode ?? form.serviceCode;
      const serviceLabel = s.serviceLabel ?? form.serviceLabel;
      const insuranceType = s.insuranceType ?? form.insuranceType;
      const duration = s.duration ?? getCodeDuration(serviceCode);
      return {
        id: Date.now() + i, staffId, userId: newId, userName: form.name, area: form.area,
        day: s.day, startHour: s.hour, duration,
        type: serviceLabel.includes("理学") ? "リハビリ" : insuranceType === "医療" ? "医療訪問看護" : "訪問看護",
        serviceCode, insuranceType, status: "予定",
      };
    });
    setVisits((prev) => [...prev, ...newVisits]);
    setAddUserOpen(false);
  };

  const updateUser = (form) => {
    setUsers((prev) => prev.map((u) => u.id === form.id ? { ...u, ...form } : u));
    setVisits((prev) => {
      const kept = prev.filter((v) => v.userId !== form.id);
      const newVisits = form.regularSchedule.map((s, i) => {
        const staffId = s.staffId ?? form.staffId;
        const serviceCode = s.serviceCode ?? form.serviceCode;
        const serviceLabel = s.serviceLabel ?? form.serviceLabel;
        const insuranceType = s.insuranceType ?? form.insuranceType;
        const duration = s.duration ?? getCodeDuration(serviceCode);
        return {
          id: Date.now() + i, staffId, userId: form.id, userName: form.name, area: form.area,
          day: s.day, startHour: s.hour, duration,
          type: serviceLabel.includes("理学") ? "リハビリ" : insuranceType === "医療" ? "医療訪問看護" : "訪問看護",
          serviceCode, insuranceType, status: "予定",
        };
      });
      return [...kept, ...newVisits];
    });
    setViewUser(null);
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setVisits((prev) => prev.filter((v) => v.userId !== userId));
    setViewUser(null);
  };

  const importUsers = (importedUsers, mergeMode) => {
    const prepareUsers = (list, startId) => list.map((u, i) => {
      const first = u.regularSchedule?.[0];
      return {
        ...u,
        id: u.id || startId + i,
        nameKana: u.nameKana || "",
        status: u.status || "利用中",
        insuranceType: u.insuranceType || first?.insuranceType || "介護",
        serviceCode: u.serviceCode || first?.serviceCode || "1313",
        serviceLabel: u.serviceLabel || first?.serviceLabel || "",
        staffId: u.staffId || first?.staffId || 1,
      };
    });
    const effectiveMode = userDataImported ? mergeMode : "replace";
    if (effectiveMode === "replace") {
      const newUsers = prepareUsers(importedUsers, 1);
      setUsers(newUsers);
      setVisits(generateVisits(newUsers));
      if (!userDataImported) setDayAdj({});
    } else {
      setUsers((prev) => {
        const nextId = prev.length > 0 ? Math.max(...prev.map((u) => u.id)) + 1 : 1;
        const prepared = prepareUsers(importedUsers, nextId);
        const merged = [...prev];
        for (const u of prepared) {
          const existIdx = merged.findIndex((m) => m.name === u.name && m.address === u.address);
          if (existIdx >= 0) {
            merged[existIdx] = { ...u, id: merged[existIdx].id };
          } else {
            merged.push(u);
          }
        }
        setVisits(generateVisits(merged));
        return merged;
      });
    }
    localStorage.setItem("coco_user_imported", "1");
    setUserDataImported(true);
    setCsvOpen(false);
  };

  const importStaff = (importedStaff) => {
    let nextId = 1;
    const newStaff = importedStaff.map((s) => ({
      ...s,
      id: s.id != null ? s.id : nextId++,
    }));
    const usedIds = new Set(newStaff.filter((s) => s.id != null).map((s) => s.id));
    let autoId = usedIds.size > 0 ? Math.max(...usedIds) + 1 : 1;
    const result = newStaff.map((s) => {
      if (s.id != null) return s;
      while (usedIds.has(autoId)) autoId++;
      usedIds.add(autoId);
      return { ...s, id: autoId++ };
    });
    setStaff(result);
    setCsvOpen(false);
  };

  const dayDow = calendarMode === "day" ? selDow : todayDow;
  const tVis = visits.filter((v) => v.day === dayDow).length;

  return (
    <div style={{ fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b" }}>
      <Header office={office} calendarMode={calendarMode} dayOff={dayOff} tVis={tVis} totalVisits={visits.length} onSettingsOpen={() => setSettingsOpen(true)} />

      <div style={{ display: "flex", height: "calc(100vh - 42px)" }}>
        <Sidebar
          viewMode={viewMode} setViewMode={setViewMode} selStaff={selStaff} setSelStaff={setSelStaff}
          selUser={selUser} setSelUser={setSelUser} insF={insF} setInsF={setInsF}
          staff={staff} visits={visits} fUsers={fUsers} search={search} setSearch={setSearch}
          onStaffMgrOpen={() => setStaffMgrOpen(true)} onAddUserOpen={() => setAddUserOpen(true)} setViewUser={setViewUser}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <CalendarToolbar
            calendarMode={calendarMode} setCalendarMode={setCalendarMode}
            dayOff={dayOff} setDayOff={setDayOff} selDateLabel={selDateLabel} dateKey={dateKey} dateAdjCount={dateAdjCount} setDayAdj={setDayAdj}
            wOff={wOff} setWOff={setWOff} wLabel={wLabel}
            fvCount={fv.length} selStaff={selStaff} selUser={selUser} staff={staff} users={users}
            onRegSchedOpen={() => setRegSchedOpen(true)} onAvailOpen={() => setAvailOpen(true)} onCsvOpen={() => setCsvOpen(true)}
          />

          <UnassignedBanner unassignedUsers={unassignedUsers} unassignedOpen={unassignedOpen} setUnassignedOpen={setUnassignedOpen} setViewUser={setViewUser} />

          <div style={{ flex: 1, overflow: "auto" }}>
            {calendarMode === "day" ? (
              <DayCalendar
                staff={staff} dayFilteredVisits={dayFilteredVisits} selStaff={selStaff} setSelStaff={setSelStaff}
                selUser={selUser} selDow={selDow} dragV={dragV} dragPreview={dragPreview} setDragPreview={setDragPreview}
                calcDropHour={calcDropHour} onDrop={onDrop} onDS={onDS} setEditV={setEditV}
              />
            ) : (
              <WeekCalendar
                staff={staff} wDates={wDates} wOff={wOff} todayDow={todayDow} fv={fv}
                selStaff={selStaff} dragV={dragV} onDrop={onDrop} onDS={onDS} setEditV={setEditV}
              />
            )}
          </div>
        </div>
      </div>

      {editV && <EditPanel editV={editV} setEditV={setEditV} staff={staff} users={users} calendarMode={calendarMode} onSave={save} onDelete={del} setViewUser={setViewUser} />}
      {viewUser && <UserDetailPanel user={viewUser} visits={visits} areas={areas} staff={staff} onClose={() => setViewUser(null)} onSave={updateUser} onDelete={deleteUser} />}
      {addUserOpen && <AddUserModal areas={areas} staff={staff} onClose={() => setAddUserOpen(false)} onSave={addUser} />}
      {availOpen && <AvailabilityPanel visits={visits} staff={staff} onClose={() => setAvailOpen(false)} />}
      {regSchedOpen && <RegularSchedulePanel users={users} visits={visits} staff={staff} onClose={() => setRegSchedOpen(false)} />}
      {csvOpen && <CsvModal users={users} staff={staff} areas={areas} onClose={() => setCsvOpen(false)} onImport={importUsers} onImportStaff={importStaff} isDemo={!userDataImported} />}
      {settingsOpen && <SettingsModal office={office} areas={areas} onClose={() => setSettingsOpen(false)} onSaveOffice={setOffice} onSaveAreas={setAreas} />}
      {staffMgrOpen && <StaffManagerPanel staff={staff} visits={visits} onClose={() => setStaffMgrOpen(false)} onSave={setStaff} />}
    </div>
  );
}
