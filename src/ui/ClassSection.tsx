import { ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/ui/cn";
import { Button, buttonVariants } from "@/ui/components/button";
import type { Selection } from "../shared/selection";
import type { AcademicCalendar, ClassTimetable, Timetable } from "../shared/types";
import type { Actions } from "./actions";
import { weekRange } from "./format";
import { Grid } from "./Grid";
import { layoutGrid } from "./grid";
import { classLabel, groupClasses, semesterLabel } from "./labels";
import type { Strings } from "./strings";
import { weekMonday } from "./week";

interface OptionsProps {
  classes: ClassTimetable[];
  s: Strings;
}

function ClassOptions({ classes, s }: OptionsProps) {
  return groupClasses(classes).map((group) => (
    <optgroup key={group.family} label={s.families[group.family]}>
      {group.classes.map((cls) => {
        const label = classLabel(cls);
        return (
          <option key={cls.id} value={cls.id}>
            {label.short} {label.programme}
          </option>
        );
      })}
    </optgroup>
  ));
}

interface PickerProps {
  index: number;
  cls: ClassTimetable | undefined;
  classes: ClassTimetable[];
  s: Strings;
  actions: Actions;
}

const HERO_ID = "text-hero md:text-[3.25rem] lg:text-[3.5rem]";
const SMALL_ID = "text-xl tracking-[-0.02em]";
// Chrome paints the option list in the select's own colours, so they are set on the invisible control.
const OVERLAY = "absolute inset-0 m-0 h-full w-full cursor-pointer bg-paper text-ink opacity-0";

/** The class name set as a title, with the native select laid over it so the title is the control. */
function ClassPicker({ index, cls, classes, s, actions }: PickerProps) {
  const label = cls ? classLabel(cls) : null;
  const hero = index === 0;
  return (
    <span className="group relative inline-flex max-w-full rounded-[2px] has-focus-visible:outline-2 has-focus-visible:outline-blue has-focus-visible:outline-offset-6">
      <span className="inline min-w-0 leading-[1.05]" aria-hidden="true">
        {label ? (
          <>
            <span
              className={cn(
                "mr-[0.22em] font-bold tracking-[-0.03em] [font-stretch:112%]",
                hero ? HERO_ID : SMALL_ID,
              )}
            >
              {label.short}
            </span>
            <span
              className={cn(
                "font-medium text-muted transition-colors duration-120 group-hover:text-ink motion-reduce:transition-none",
                hero ? "text-l" : "text-m",
              )}
            >
              {label.programme}
            </span>
          </>
        ) : (
          <span
            className={cn(
              "font-bold text-blue tracking-[-0.03em] transition-colors duration-120 [font-stretch:108%] group-hover:text-blue-deep motion-reduce:transition-none",
              hero ? HERO_ID : SMALL_ID,
            )}
          >
            {s.choose}
          </span>
        )}
        <ChevronDown
          className={cn(
            "ml-1.5 inline-block align-middle text-blue transition-transform duration-160 group-hover:translate-y-0.5 motion-reduce:transition-none print:hidden",
            hero ? "size-[26px]" : "size-5",
          )}
          strokeWidth={2.25}
        />
      </span>
      <select
        className={OVERLAY}
        aria-label={index === 0 ? s.classLabel : s.otherClass}
        value={cls?.id ?? ""}
        onChange={(event) => actions.setClass(index, event.currentTarget.value)}
      >
        <option value="" disabled>
          {s.choose}
        </option>
        <ClassOptions classes={classes} s={s} />
      </select>
    </span>
  );
}

interface SectionProps {
  index: number;
  classId: string;
  timetable: Timetable;
  calendar: AcademicCalendar;
  selection: Selection | null;
  today: string;
  s: Strings;
  actions: Actions;
}

const HELP = "mb-3.5 max-w-[58ch] text-muted text-s print:hidden";

/** One class: its name as the title, the week it shows, and its grid. */
export function ClassSection({
  index,
  classId,
  timetable,
  calendar,
  selection,
  today,
  s,
  actions,
}: SectionProps) {
  const cls = timetable.classes.find((c) => c.id === classId);
  const layout = cls ? layoutGrid(cls.lessons) : null;
  const hasSplit = layout?.blocks.some((b) => b.groups.length > 1) ?? false;
  const monday = weekMonday(today, timetable, calendar);
  const semester = semesterLabel(timetable.semester, s);
  const sub =
    layout && layout.blocks.length > 0
      ? `${semester}, ${weekRange(monday, layout.days, s)}`
      : semester;
  return (
    <section className={cn(index > 0 && "mt-10 border-rule border-t")}>
      <div
        className={cn("flex flex-wrap items-baseline gap-x-4", index > 0 ? "pt-6" : "pt-7 lg:pt-9")}
      >
        <ClassPicker index={index} cls={cls} classes={timetable.classes} s={s} actions={actions} />
        {index > 0 && (
          <Button
            variant="link"
            className="print:hidden"
            onClick={() => actions.removeClass(index)}
          >
            <X aria-hidden="true" size={16} />
            {s.removeClass}
          </Button>
        )}
        {index === 0 && <p className="mt-2 basis-full text-muted text-s">{sub}</p>}
      </div>
      {!cls || !layout || !selection ? (
        index === 0 && <p className={cn(HELP, "mt-4")}>{s.emptyState}</p>
      ) : (
        <>
          {index === 0 && (
            <h2 className="mt-9 mb-1.5 font-semibold text-l leading-[1.15] tracking-[-0.015em] print:hidden">
              {s.step2}
            </h2>
          )}
          <p className={HELP}>{index === 0 ? s.step2Help : s.addedHelp}</p>
          <Grid
            cls={cls}
            layout={layout}
            monday={monday}
            today={today}
            selection={selection}
            timetable={timetable}
            s={s}
            actions={actions}
          />
          {hasSplit && <p className={cn(HELP, "mt-3")}>{s.splitHelp}</p>}
        </>
      )}
    </section>
  );
}

interface AddClassProps {
  timetable: Timetable;
  taken: string[];
  s: Strings;
  actions: Actions;
}

/** A button-looking select that adds another class's grid below the first one. */
export function AddClass({ timetable, taken, s, actions }: AddClassProps) {
  const others = timetable.classes.filter((c) => !taken.includes(c.id));
  if (others.length === 0) return null;
  return (
    <label
      className={cn(
        buttonVariants({ variant: "outline" }),
        "relative mt-7 mb-2 min-h-12 gap-2 pr-[18px] pl-3.5 has-focus-visible:outline-2 has-focus-visible:outline-blue has-focus-visible:outline-offset-2 print:hidden",
      )}
    >
      <Plus aria-hidden="true" size={20} />
      <span>{s.addClass}</span>
      <select
        className={OVERLAY}
        aria-label={s.addClass}
        value=""
        onChange={(event) => {
          if (event.currentTarget.value) actions.addClass(event.currentTarget.value);
        }}
      >
        <option value="">{s.addClass}</option>
        <ClassOptions classes={others} s={s} />
      </select>
    </label>
  );
}
