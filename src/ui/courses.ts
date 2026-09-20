import { longestName, mergeSlots, type Slot, sortKinds } from "../shared/slots";
import type { ClassTimetable, Lesson, LessonKind } from "../shared/types";

export interface CourseSummary {
  module: string;
  name: string;
  kinds: LessonKind[];
  slots: Slot[];
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
    const slots = mergeSlots(lessons).sort(
      (a, b) => a.day - b.day || a.start.localeCompare(b.start),
    );
    summaries.push({ module, name: longestName(lessons), kinds: sortKinds(lessons), slots });
  }
  return summaries.sort((a, b) => a.name.localeCompare(b.name));
}
