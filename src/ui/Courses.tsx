import { type ReactNode, useId } from "react";
import { cn } from "@/ui/cn";
import { Checkbox } from "@/ui/components/checkbox";
import type { Selection } from "../shared/selection";
import type { ClassTimetable, Timetable } from "../shared/types";
import type { Actions } from "./actions";
import { courseSummaries } from "./courses";
import { kindLabel, slotMeta } from "./format";
import { isModuleSelected } from "./state";
import { fill, type Strings } from "./strings";

interface TitleProps {
  children: ReactNode;
  count?: string;
}

/** A rail section heading over an ink rule, with a muted count on the right when given. */
export function RailTitle({ children, count }: TitleProps) {
  return (
    <h3 className="flex items-baseline justify-between gap-3 border-ink border-b pb-2.5 font-semibold text-m tracking-[-0.01em]">
      <span>{children}</span>
      {count && <span className="font-medium text-muted text-s">{count}</span>}
    </h3>
  );
}

interface CoursesProps {
  title: string;
  cls: ClassTimetable;
  selection: Selection;
  timetable: Timetable;
  s: Strings;
  actions: Actions;
}

/** The course list of one class: a checkbox per module and a line per weekly slot with its rooms and teachers. */
export function Courses({ title, cls, selection, timetable, s, actions }: CoursesProps) {
  const id = useId();
  const summaries = courseSummaries(cls);
  const selectedCount = summaries.filter((c) =>
    isModuleSelected(selection, cls.id, c.module),
  ).length;
  return (
    <section>
      <RailTitle count={fill(s.countOf, { n: selectedCount, total: summaries.length })}>
        {title}
      </RailTitle>
      <ul>
        {summaries.map((course) => {
          const on = isModuleSelected(selection, cls.id, course.module);
          const inputId = `${id}${course.module}`;
          return (
            <li key={course.module} className="border-rule border-b pt-2.5 pb-3">
              <label
                htmlFor={inputId}
                className="grid min-h-8 cursor-pointer grid-cols-[20px_1fr_auto] items-center gap-3"
              >
                <Checkbox
                  id={inputId}
                  nativeButton
                  render={<button type="button" />}
                  checked={on}
                  onCheckedChange={() => actions.toggleModule(cls, course.module)}
                />
                <span
                  className={cn(
                    "font-semibold text-s transition-colors duration-120 motion-reduce:transition-none",
                    !on && "text-muted line-through decoration-faint",
                  )}
                >
                  {course.name}
                </span>
                <span className="font-medium text-faint text-xs [font-stretch:105%]">
                  {course.module}
                </span>
              </label>
              <ul className="mt-1.5 ml-8 grid gap-1.5 text-muted text-xs">
                {course.slots.map((slot) => {
                  const kind = slot.kinds.includes("C")
                    ? null
                    : slot.kinds.map((k) => kindLabel(k, s)).join(", ");
                  return (
                    <li
                      key={`${slot.day}-${slot.start}`}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1"
                    >
                      <span className="font-medium">
                        {s.days[slot.day - 1]} {slot.start}-{slot.end}
                      </span>
                      {kind && <span className="text-faint">{kind}</span>}
                      {slotMeta(slot, timetable).map((part) => (
                        <span key={part}>{part}</span>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
