import { baseName } from "./names";
import type { Lesson, LessonKind } from "./types";

/** One module at one time in one week, with everything Untis lists there. */
export interface Slot {
  week: number;
  day: number;
  start: string;
  end: string;
  module: string;
  /** longest published name, without the Es. and Lab. prefixes */
  name: string;
  /** distinct kinds in lecture, exercises, lab order */
  kinds: LessonKind[];
  codes: string[];
  rooms: string[];
  teachers: string[];
}

const KIND_ORDER: LessonKind[] = ["C", "E", "L"];

/** Distinct kinds in lecture, exercises, lab order. */
export function sortKinds(lessons: Lesson[]): LessonKind[] {
  const kinds = new Set<LessonKind>();
  for (const lesson of lessons) if (lesson.kind) kinds.add(lesson.kind);
  return KIND_ORDER.filter((kind) => kinds.has(kind));
}

/** The longest published name of a set of lessons, without the Es. and Lab. prefixes. */
export function longestName(lessons: Lesson[]): string {
  return lessons.map((l) => baseName(l.name)).reduce((a, b) => (b.length > a.length ? b : a), "");
}

function distinct(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => value !== null))];
}

/**
 * Folds lessons into one slot per week, day, time and module, in lesson order. Untis lists a
 * lesson once per teacher or room and once per kind; a student sees one lesson.
 */
export function mergeSlots(lessons: Lesson[]): Slot[] {
  const byKey = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const key = `${lesson.week}|${lesson.day}|${lesson.start}|${lesson.end}|${lesson.module}`;
    const entry = byKey.get(key);
    if (entry) entry.push(lesson);
    else byKey.set(key, [lesson]);
  }
  return [...byKey.values()].map((entries) => {
    const [first] = entries;
    if (!first) throw new Error("empty slot");
    return {
      week: first.week,
      day: first.day,
      start: first.start,
      end: first.end,
      module: first.module,
      name: longestName(entries),
      kinds: sortKinds(entries),
      codes: distinct(entries.map((l) => l.code)),
      rooms: distinct(entries.map((l) => l.room)),
      teachers: distinct(entries.map((l) => l.teacher)),
    };
  });
}
