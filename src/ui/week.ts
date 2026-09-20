import { addDays } from "../shared/events";
import type { AcademicCalendar, Timetable } from "../shared/types";

/** Monday of the week to show: the current one while the semester runs, else the published week. */
export function weekMonday(
  today: string,
  timetable: Timetable,
  calendar: AcademicCalendar,
): string {
  const published = timetable.weeks[0]?.monday;
  if (!published) throw new Error("timetable has no published weeks");
  const semester = calendar.semesters.find((s) => s.start <= published && published <= s.end);
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const monday = addDays(today, -((weekday + 6) % 7));
  if (!semester || monday < semester.start || monday > semester.end) return published;
  return monday;
}
