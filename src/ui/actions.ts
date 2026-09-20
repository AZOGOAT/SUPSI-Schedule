import type { Lang } from "../shared/selection";
import type { ClassTimetable } from "../shared/types";
import type { LessonGroup } from "./grid";

/** Everything the page can do, handed down to the components. */
export interface Actions {
  setLang(lang: Lang): void;
  setClass(index: number, classId: string): void;
  addClass(classId: string): void;
  removeClass(index: number): void;
  toggleModule(cls: ClassTimetable, module: string): void;
  toggleGroup(cls: ClassTimetable, group: LessonGroup): void;
  toggleAcademic(): void;
  copyLink(): void;
}
