import { slugify } from "../../src/shared/slug";
import type { ClassTimetable, Lesson, LessonKind, Timetable, Week } from "../../src/shared/types";
import type { ClassPage } from "./untis";

export interface BuildInput {
  source: string;
  sourceUpdatedAt: string;
  scrapedAt: string;
  semester: string;
  weeks: Week[];
  teachers: Record<string, string>;
  rooms: Record<string, string>;
  pages: { week: number; page: ClassPage }[];
}

const KINDS: readonly LessonKind[] = ["C", "E", "L"];

/** URL-safe id for a class, derived from its full name because Untis truncates the short id. */
export function classId(name: string): string {
  return slugify(name);
}

/** Splits an Untis code like "E-B1201+" into its lesson kind and module; the plus of Precalcolo+ stays, it is a different offering. */
export function splitCode(code: string): { kind: LessonKind | null; module: string } {
  const kind = KINDS.find((k) => code.startsWith(`${k}-`));
  if (!kind) return { kind: null, module: code };
  return { kind, module: code.slice(2) };
}

function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function compareLessons(a: Lesson, b: Lesson): number {
  return (
    a.week - b.week ||
    a.day - b.day ||
    compareStrings(a.start, b.start) ||
    compareStrings(a.end, b.end) ||
    compareStrings(a.code, b.code) ||
    compareStrings(a.teacher ?? "", b.teacher ?? "") ||
    compareStrings(a.room ?? "", b.room ?? "")
  );
}

/** Assembles the parsed pages into the timetable JSON, sorted so that reruns produce identical files. */
export function buildTimetable(input: BuildInput): Timetable {
  const byId = new Map<string, ClassTimetable>();
  for (const { week, page } of input.pages) {
    const id = classId(page.name);
    const entry = byId.get(id) ?? { id, short: page.short, name: page.name, lessons: [] };
    byId.set(id, entry);
    for (const lesson of page.lessons) {
      const { kind, module } = splitCode(lesson.code);
      entry.lessons.push({
        week,
        day: lesson.day,
        start: lesson.start,
        end: lesson.end,
        code: lesson.code,
        module,
        kind,
        name: lesson.name,
        room: lesson.room,
        teacher: lesson.teacher,
        color: lesson.color,
      });
    }
  }
  const classes = [...byId.values()].sort((a, b) => compareStrings(a.id, b.id));
  for (const c of classes) c.lessons.sort(compareLessons);
  return {
    source: input.source,
    sourceUpdatedAt: input.sourceUpdatedAt,
    scrapedAt: input.scrapedAt,
    semester: input.semester,
    weeks: input.weeks,
    teachers: input.teachers,
    rooms: input.rooms,
    classes,
  };
}

/** True when two timetables carry the same data, ignoring when they were scraped. */
export function isSameTimetable(a: Timetable, b: Timetable): boolean {
  return JSON.stringify({ ...a, scrapedAt: "" }) === JSON.stringify({ ...b, scrapedAt: "" });
}
