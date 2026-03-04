import { DAYS, DAY_FULL } from "../data.js";

export function useCalendarState(wOff, dayOff) {
  const today = new Date();

  // 週次ビュー用
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7) + wOff * 7);
  const wDates = DAYS.map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  const wLabel = `${mon.getFullYear()}年${mon.getMonth() + 1}月${mon.getDate()}日〜`;
  const todayDow = (today.getDay() + 6) % 7;

  // 日次ビュー用
  const selDate = new Date(today);
  selDate.setDate(today.getDate() + dayOff);
  const selDow = (selDate.getDay() + 6) % 7;
  const selDateLabel = `${selDate.getFullYear()}年${selDate.getMonth() + 1}月${selDate.getDate()}日（${DAY_FULL[selDow]}）`;
  const dateKey = `${selDate.getFullYear()}-${selDate.getMonth() + 1}-${selDate.getDate()}`;

  return { wDates, wLabel, todayDow, selDate, selDow, selDateLabel, dateKey };
}
