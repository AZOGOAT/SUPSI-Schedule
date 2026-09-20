import type { ClassTimetable, Lesson, LessonKind } from "../shared/types";
import { groupLessons, type LessonGroup, longestName, sortKinds } from "./grid";

export interface CourseSlot {
  day: number;
  start: string;
  end: string;
  kinds: LessonKind[];
  groups: LessonGroup[];
}

export interface CourseSummary {
  module: string;
  name: string;
  kinds: LessonKind[];
  slots: CourseSlot[];
}

/** One entry per module of a class, named by its longest published name, sorted by name. */
export function courseSummaries(cls: ClassTimetable): CourseSummary[] {
  const byModule = new Map<string, Lesson[]>();
  for (const lesson of cls.lessons) {
    const lessons = byModule.get(lesson.module);
    if (lessons) lessons.push(lesson);
    else byModule.set(lesson.module, [lesson]);
  }
  const summaries: CourseSummary[] = [];
  for (const [module, lessons] of byModule) {
    const slotLessons = new Map<string, Lesson[]>();
    for (const lesson of lessons) {
      const key = `${lesson.day}|${lesson.start}|${lesson.end}`;
      const slot = slotLessons.get(key);
      if (slot) slot.push(lesson);
      else slotLessons.set(key, [lesson]);
    }
    const slots: CourseSlot[] = [];
    for (const group of slotLessons.values()) {
      const [first] = group;
      if (!first) continue;
      slots.push({
        day: first.day,
        start: first.start,
        end: first.end,
        kinds: sortKinds(group),
        groups: groupLessons(group),
      });
    }
    slots.sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
    summaries.push({ module, name: longestName(lessons), kinds: sortKinds(lessons), slots });
  }
  return summaries.sort((a, b) => a.name.localeCompare(b.name));
}
