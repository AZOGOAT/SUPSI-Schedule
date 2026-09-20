import type { Selection } from "./selection";
import type {
  AcademicCalendar,
  AcademicEventType,
  ClassTimetable,
  Lesson,
  Semester,
  Timetable,
} from "./types";

export interface Occurrence {
  date: string;
  start: string;
  end: string;
  classId: string;
  classShort: string;
  className: string;
  lesson: Lesson;
}

export interface AllDayEvent {
  title: string;
  type: AcademicEventType;
  start: string;
  /** exclusive */
  end: string;
}

export class UnknownClassError extends Error {}

const ELECTIVE_MODULE = /^[A-Z]\d{4}[YZ]$/;

/** Adds days to a YYYY-MM-DD date. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Identifies a parallel group for the skip list: by teacher, else by room, else nothing to tell apart. */
export function skipKey(lesson: Lesson): string | null {
  if (lesson.teacher) return `${lesson.code}@${lesson.teacher}`;
  if (lesson.room) return `${lesson.code}@${lesson.room}`;
  return null;
}

/** The class for an id from a selection. */
export function findClass(timetable: Timetable, classId: string): ClassTimetable {
  const cls = timetable.classes.find((c) => c.id === classId);
  if (!cls) throw new UnknownClassError(`unknown class "${classId}"`);
  return cls;
}

/** Module code without the elective marker, so class pages and the OPZ page agree. */
export function moduleBase(module: string): string {
  return ELECTIVE_MODULE.test(module) ? module.slice(0, -1) : module;
}

/** Academic calendar entries as all-day spans with an exclusive end, in file order. */
export function academicEvents(calendar: AcademicCalendar): AllDayEvent[] {
  return calendar.events.map((event) => {
    const start = event.date ?? event.start;
    const last = event.date ?? event.end;
    if (!start || !last) throw new Error(`"${event.title}" has no dates`);
    return { title: event.title, type: event.type, start, end: addDays(last, 1) };
  });
}

function closedDates(calendar: AcademicCalendar): Set<string> {
  const closed = new Set<string>();
  for (const event of calendar.events) {
    if (event.type !== "holiday" && event.type !== "break") continue;
    if (event.date) closed.add(event.date);
    if (event.start && event.end) {
      for (let d = event.start; d <= event.end; d = addDays(d, 1)) closed.add(d);
    }
  }
  return closed;
}

function semesterEnd(semester: Semester, cls: ClassTimetable, calendar: AcademicCalendar): string {
  if (semester.endFinalYear && calendar.finalYearClasses.includes(cls.short)) {
    return semester.endFinalYear;
  }
  return semester.end;
}

function minDate(a: string, b: string): string {
  return a < b ? a : b;
}

function compareOccurrences(a: Occurrence, b: Occurrence): number {
  const keyA = `${a.date} ${a.start} ${a.end} ${a.className} ${a.lesson.code} ${a.lesson.teacher ?? ""} ${a.lesson.room ?? ""}`;
  const keyB = `${b.date} ${b.start} ${b.end} ${b.className} ${b.lesson.code} ${b.lesson.teacher ?? ""} ${b.lesson.room ?? ""}`;
  if (keyA < keyB) return -1;
  if (keyA > keyB) return 1;
  return 0;
}

/**
 * Turns the weekly grids into dated occurrences for a selection: each published week applies
 * from its Monday until the next published week or the semester end, holidays and breaks are
 * dropped, skipped groups are hidden, and the same lesson reached through two classes appears once.
 */
export function expandLessons(
  timetable: Timetable,
  calendar: AcademicCalendar,
  selection: Selection,
): Occurrence[] {
  const chosen = selection.classes.map(({ classId, modules }) => {
    const cls = findClass(timetable, classId);
    const lessons = cls.lessons.filter((lesson) => {
      if (modules && !modules.includes(lesson.module)) return false;
      const key = skipKey(lesson);
      return key === null || !selection.skip.includes(key);
    });
    return { cls, lessons };
  });

  const closed = closedDates(calendar);
  const seen = new Set<string>();
  const occurrences: Occurrence[] = [];

  timetable.weeks.forEach((week, index) => {
    const semester = calendar.semesters.find((s) => s.start <= week.monday && week.monday <= s.end);
    if (!semester) throw new Error(`no semester in the academic calendar covers ${week.monday}`);
    const nextWeek = timetable.weeks[index + 1];
    for (const { cls, lessons } of chosen) {
      let rangeEnd = semesterEnd(semester, cls, calendar);
      if (nextWeek) rangeEnd = minDate(rangeEnd, addDays(nextWeek.monday, -1));
      for (const lesson of lessons) {
        if (lesson.week !== week.week) continue;
        for (let monday = week.monday; monday <= rangeEnd; monday = addDays(monday, 7)) {
          const date = addDays(monday, lesson.day - 1);
          if (date > rangeEnd || date < semester.start || closed.has(date)) continue;
          const key = `${date}|${lesson.start}|${lesson.end}|${lesson.teacher}|${lesson.room}|${moduleBase(lesson.module)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          occurrences.push({
            date,
            start: lesson.start,
            end: lesson.end,
            classId: cls.id,
            classShort: cls.short,
            className: cls.name,
            lesson,
          });
        }
      }
    }
  });

  return occurrences.sort(compareOccurrences);
}
