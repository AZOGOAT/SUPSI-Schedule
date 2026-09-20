import { addDays } from "../shared/events";
import type { LessonKind, Timetable } from "../shared/types";
import type { LessonGroup } from "./grid";
import { fill, type Strings } from "./strings";

export function kindLabel(kind: LessonKind, s: Strings): string {
  if (kind === "C") return s.lecture;
  if (kind === "E") return s.exercises;
  return s.lab;
}

/** "Grafica (lab)": the kind is named only when the slot holds no lecture. */
export function blockTitle(name: string, kinds: LessonKind[], s: Strings): string {
  if (kinds.length === 0 || kinds.includes("C")) return name;
  return `${name} (${kinds.map((kind) => kindLabel(kind, s)).join(", ")})`;
}

/** The teacher's surname, as Untis publishes names surname first; the abbreviation when unknown. */
export function teacherLabel(abbr: string | null, timetable: Timetable): string | null {
  if (!abbr) return null;
  const full = timetable.teachers[abbr];
  if (!full) return abbr;
  const [surname] = full.split(" ");
  return surname && surname.length > 0 ? surname : full;
}

/** Room and teacher of a group, as shown on a lesson block. */
export function groupMeta(group: LessonGroup, timetable: Timetable): string[] {
  return [group.room, teacherLabel(group.teacher, timetable)].filter(
    (part): part is string => part !== null,
  );
}

export function shortDate(iso: string, s: Strings): string {
  const [, month, day] = iso.split("-");
  return `${Number(day)} ${s.months[Number(month) - 1]}`;
}

export function dayNumber(iso: string): string {
  return String(Number(iso.slice(8, 10)));
}

export function dottedDate(localIso: string): string {
  const [year, month, day] = localIso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

function clock(minute: number): string {
  const h = String(Math.floor(minute / 60)).padStart(2, "0");
  const m = String(minute % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/** "08:30-10:00" from minutes since midnight, as printed inside a lesson block. */
export function timeRange(start: number, end: number): string {
  return `${clock(start)}-${clock(end)}`;
}

/** The two-digit hour on the grid's time rail. */
export function hourLabel(minute: number): string {
  return String(minute / 60).padStart(2, "0");
}

/** "14 to 18 Sep": the first and last drawn day of the week under the class name. */
export function weekRange(monday: string, days: number[], s: Strings): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (first === undefined || last === undefined) return "";
  const from = shortDate(addDays(monday, first - 1), s);
  const to = shortDate(addDays(monday, last - 1), s);
  if (first === last) return from;
  const sameMonth = from.slice(from.indexOf(" ")) === to.slice(to.indexOf(" "));
  return fill(s.weekSpan, { from: sameMonth ? from.slice(0, from.indexOf(" ")) : from, to });
}
