import type { Lang } from "../shared/selection";
import type { ClassTimetable } from "../shared/types";

/** Everything the page can do, handed down to the components. */
export interface Actions {
  setLang(lang: Lang): void;
  setClass(index: number, classId: string): void;
  addClass(classId: string): void;
  removeClass(index: number): void;
  toggleModule(cls: ClassTimetable, module: string): void;
  toggleAcademic(): void;
  copyLink(): void;
}
