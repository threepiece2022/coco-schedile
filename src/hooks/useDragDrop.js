import { useState, useCallback } from "react";
import { HOURS } from "../data.js";

export function useDragDrop(calendarMode, dayOff, setVisits, setDayAdj) {
  const [dragV, setDragV] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);

  const onDS = useCallback((e, v) => {
    setDragV(v);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const calcDropHour = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawMin = ratio * HOURS.length * 60;
    return HOURS[0] + Math.round(rawMin / 5) * 5 / 60;
  };

  const onDrop = useCallback((e, day, hour, sid) => {
    e.preventDefault();
    if (!dragV) return;
    if (calendarMode === "day") {
      const d = new Date(); d.setDate(d.getDate() + dayOff);
      const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      setDayAdj((prev) => ({ ...prev, [`${dk}:${dragV.id}`]: { startHour: hour, staffId: sid || dragV.staffId } }));
    } else {
      setVisits((p) => p.map((v) => v.id === dragV.id ? { ...v, day, startHour: hour, ...(sid ? { staffId: sid } : {}) } : v));
    }
    setDragV(null);
    setDragPreview(null);
  }, [dragV, calendarMode, dayOff, setVisits, setDayAdj]);

  return { dragV, setDragV, dragPreview, setDragPreview, onDS, onDrop, calcDropHour };
}
