import { skipKey } from "../shared/events";
import {
  formatSelection,
  parseSelection,
  type Selection,
  SelectionError,
} from "../shared/selection";
import type { ClassTimetable, Lesson } from "../shared/types";
import type { LessonGroup } from "./grid";
import { feedSelection } from "./subscribe";

/** The selection encoded in the page query, or null when there is none worth showing. */
export function readSelection(search: string): Selection | null {
  try {
    return parseSelection(new URLSearchParams(search));
  } catch (error) {
    if (error instanceof SelectionError) return null;
    throw error;
  }
}

export function writeSelection(selection: Selection): string {
  const kept = feedSelection(selection);
  return kept.classes.length > 0 ? `?${formatSelection(kept)}` : "";
}

export function isModuleSelected(selection: Selection, classId: string, module: string): boolean {
  const cls = selection.classes.find((c) => c.classId === classId);
  return cls !== undefined && (cls.modules === null || cls.modules.includes(module));
}

function allModules(cls: ClassTimetable): string[] {
  return [...new Set(cls.lessons.map((l) => l.module))];
}

/** Adds or removes a module. The first class collapses back to "all" once every module is in. */
export function toggleModule(selection: Selection, cls: ClassTimetable, module: string): Selection {
  const modules = allModules(cls);
  return {
    ...selection,
    classes: selection.classes.map((entry, index) => {
      if (entry.classId !== cls.id) return entry;
      const current = entry.modules ?? modules;
      const next = current.includes(module)
        ? current.filter((m) => m !== module)
        : [...current, module];
      const ordered = modules.filter((m) => next.includes(m));
      const complete = index === 0 && ordered.length === modules.length;
      return { ...entry, modules: complete ? null : ordered };
    }),
  };
}

export function isLessonSelected(selection: Selection, classId: string, lesson: Lesson): boolean {
  if (!isModuleSelected(selection, classId, lesson.module)) return false;
  const key = skipKey(lesson);
  return key === null || !selection.skip.includes(key);
}

/** A parallel group is in the calendar while any of its lessons is. */
export function isGroupSelected(
  selection: Selection,
  classId: string,
  group: LessonGroup,
): boolean {
  return group.lessons.some((lesson) => isLessonSelected(selection, classId, lesson));
}

/**
 * A tap on one group of a split slot hides that group or brings it back. A group whose module
 * is out, or that cannot be told apart from the others, toggles the whole module instead.
 */
export function toggleGroup(
  selection: Selection,
  cls: ClassTimetable,
  group: LessonGroup,
): Selection {
  const keys = group.lessons.map(skipKey).filter((key): key is string => key !== null);
  if (keys.length === 0 || !isModuleSelected(selection, cls.id, group.module)) {
    return toggleModule(selection, cls, group.module);
  }
  const hidden = keys.every((key) => selection.skip.includes(key));
  const skip = hidden
    ? selection.skip.filter((key) => !keys.includes(key))
    : [...new Set([...selection.skip, ...keys])];
  return { ...selection, skip };
}

export function setClass(selection: Selection, index: number, classId: string): Selection {
  return {
    ...selection,
    classes: selection.classes.map((entry, i) =>
      i === index ? { classId, modules: index === 0 ? null : [] } : entry,
    ),
  };
}

export function addClass(selection: Selection, classId: string): Selection {
  return { ...selection, classes: [...selection.classes, { classId, modules: [] }] };
}

export function removeClass(selection: Selection, index: number): Selection {
  return { ...selection, classes: selection.classes.filter((_, i) => i !== index) };
}
