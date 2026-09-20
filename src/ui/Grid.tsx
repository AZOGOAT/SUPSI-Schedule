import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/ui/cn";
import { Toggle } from "@/ui/components/toggle";
import { ToggleGroup } from "@/ui/components/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/components/tooltip";
import { addDays } from "../shared/events";
import type { Selection } from "../shared/selection";
import type { ClassTimetable, Timetable } from "../shared/types";
import type { Actions } from "./actions";
import { blockTitle, dayNumber, groupMeta, hourLabel, timeRange } from "./format";
import type { GridBlock, GridLayout, LessonGroup } from "./grid";
import { CAN_HOVER, useMediaQuery } from "./media";
import { isGroupSelected, isModuleSelected } from "./state";
import { fill, type Strings } from "./strings";

interface GridProps {
  cls: ClassTimetable;
  layout: GridLayout;
  monday: string;
  today: string;
  selection: Selection;
  timetable: Timetable;
  s: Strings;
  actions: Actions;
}

interface BlockProps {
  cls: ClassTimetable;
  block: GridBlock;
  layout: GridLayout;
  selection: Selection;
  timetable: Timetable;
  s: Strings;
  actions: Actions;
  hover: boolean;
}

const BLOCK =
  "tt-lesson @container overflow-hidden rounded-sm border border-tint-edge text-left text-ink text-xs leading-[1.2] transition-[background-color,border-color,color] duration-120 [font-stretch:94%] motion-reduce:transition-none";
const OFF_EDGE = "border-dashed border-rule-strong";
const HEAD = "flex flex-col gap-px pt-[5px] pr-2 pb-1 pl-2.5";
const TIME = "whitespace-nowrap font-medium text-2xs text-muted [font-stretch:105%]";
const NAME = "wrap-anywhere font-semibold";
const STRUCK = "line-through decoration-faint";

interface MetaProps {
  group: LessonGroup;
  timetable: Timetable;
  off?: boolean;
  row?: boolean;
}

/** Room and teacher: side by side when the container is wide enough, stacked in a narrow one; a half that has one line keeps them side by side. */
function Meta({ group, timetable, off = false, row = false }: MetaProps) {
  const parts = groupMeta(group, timetable);
  return (
    <span
      className={cn(
        "flex min-w-0 text-muted",
        row ? "flex-row gap-2" : "flex-col @min-[7.5rem]:flex-row @min-[7.5rem]:gap-2",
        off && STRUCK,
      )}
    >
      {parts.map((part, i) => (
        <span
          key={part}
          className={cn("truncate", i === 0 && group.room && "shrink-0 font-medium")}
        >
          {part}
        </span>
      ))}
    </span>
  );
}

interface DetailProps {
  block: GridBlock;
  group: LessonGroup;
  timetable: Timetable;
}

/** What the tooltip adds to a block: the full names and the codes behind it. */
function Detail({ block, group, timetable }: DetailProps) {
  const teacher = group.teacher ? (timetable.teachers[group.teacher] ?? group.teacher) : null;
  const rooms = group.room
    ? group.room
        .split(", ")
        .map((code) => timetable.rooms[code] ?? code)
        .join(", ")
    : null;
  const codes = [...new Set(group.lessons.map((lesson) => lesson.code))].join(", ");
  return (
    <>
      {teacher && <p className="font-semibold">{teacher}</p>}
      {rooms && <p>{rooms}</p>}
      <p className="text-faint">
        {block.module}, {codes}
      </p>
    </>
  );
}

interface TappableProps {
  hover: boolean;
  detail: ReactNode;
  pressed: boolean;
  className: string;
  style?: CSSProperties;
  onClick: () => void;
  children: ReactNode;
}

/** A block or a half: a pressed button, with a tooltip on devices that can hover. */
function Tappable({ hover, detail, pressed, className, style, onClick, children }: TappableProps) {
  const props = { type: "button" as const, className, style, "aria-pressed": pressed, onClick };
  if (!hover) return <button {...props}>{children}</button>;
  return (
    <Tooltip>
      <TooltipTrigger render={<button {...props} />}>{children}</TooltipTrigger>
      <TooltipContent>{detail}</TooltipContent>
    </Tooltip>
  );
}

function LessonBlock({ cls, block, layout, selection, timetable, s, actions, hover }: BlockProps) {
  const rows = (block.end - block.start) / 15;
  const style = {
    "--row": (block.start - layout.firstMinute) / 15,
    "--rows": rows,
    "--lane": block.lane,
    "--lanes": block.lanes,
  } as CSSProperties;
  const short = rows <= 3;
  const title = blockTitle(block.name, block.kinds, s);
  const time = timeRange(block.start, block.end);
  const moduleOn = isModuleSelected(selection, cls.id, block.module);
  const [first] = block.groups;
  if (!first) return null;

  if (block.groups.length === 1) {
    const on = isGroupSelected(selection, cls.id, first);
    return (
      <Tappable
        hover={hover}
        detail={<Detail block={block} group={first} timetable={timetable} />}
        pressed={on}
        style={style}
        className={cn(
          BLOCK,
          HEAD,
          "cursor-pointer bg-tint hover:bg-tint-strong",
          !on && [OFF_EDGE, "bg-paper text-muted hover:bg-surface print:hidden"],
        )}
        onClick={() =>
          moduleOn && !on
            ? actions.toggleGroup(cls, first)
            : actions.toggleModule(cls, block.module)
        }
      >
        <span className={TIME}>{time}</span>
        <span className={cn(NAME, short ? "line-clamp-1" : "line-clamp-2", !on && STRUCK)}>
          {title}
        </span>
        <Meta group={first} timetable={timetable} />
      </Tappable>
    );
  }

  const compact = rows <= 5;
  const anyOn = block.groups.some((group) => isGroupSelected(selection, cls.id, group));
  return (
    <div
      className={cn(BLOCK, "flex flex-col bg-paper", !anyOn && [OFF_EDGE, "print:hidden"])}
      style={style}
      data-off={anyOn ? undefined : ""}
    >
      <div
        className={cn(
          HEAD,
          "border-rule border-b",
          compact && "flex-row items-baseline gap-1.5 pt-1 pb-[3px]",
          !anyOn && "text-muted",
        )}
      >
        <span className={TIME}>{time}</span>
        <span
          className={cn(
            NAME,
            compact ? "block min-w-0 truncate" : "line-clamp-2",
            !anyOn && STRUCK,
          )}
        >
          {title}
        </span>
        {!compact && (
          <span className="text-2xs text-faint">{fill(s.groups, { n: block.groups.length })}</span>
        )}
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col", compact && "flex-row")}>
        {block.groups.map((group) => {
          const on = isGroupSelected(selection, cls.id, group);
          return (
            <Tappable
              key={group.key}
              hover={hover}
              detail={<Detail block={block} group={group} timetable={timetable} />}
              pressed={on}
              className={cn(
                "flex min-h-0 min-w-0 flex-1 cursor-pointer items-center overflow-hidden bg-tint py-[3px] pr-2 pl-2.5 text-left text-ink transition-[background-color,color] duration-120 hover:bg-tint-strong motion-reduce:transition-none",
                compact
                  ? "@container border-rule not-first:border-l"
                  : "border-rule not-first:border-t",
                !on && "bg-paper text-muted hover:bg-surface print:hidden",
              )}
              onClick={() => actions.toggleGroup(cls, group)}
            >
              <Meta group={group} timetable={timetable} off={!on} row={!compact} />
            </Tappable>
          );
        })}
      </div>
    </div>
  );
}

/** Where the scroll position lands when a day column is snapped against the time column. */
function columnLeft(wrap: HTMLDivElement, index: number): number | null {
  const col = wrap.querySelectorAll<HTMLElement>("[data-day-col]")[index];
  const times = wrap.querySelector<HTMLElement>("[data-times]");
  if (!col || !times) return null;
  return col.offsetLeft - times.offsetWidth;
}

const TODAY_TAB =
  "text-blue aria-pressed:text-blue aria-pressed:shadow-[inset_0_-2px_0_var(--blue)]";

/** The week grid of one class, with day tabs that follow the horizontal scroll on phones. */
export function Grid({ cls, layout, monday, today, selection, timetable, s, actions }: GridProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hover = useMediaQuery(CAN_HOVER);
  const dates = layout.days.map((day) => addDays(monday, day - 1));
  const todayIndex = dates.indexOf(today);
  const [active, setActive] = useState(todayIndex === -1 ? 0 : todayIndex);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onScroll = () => {
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      layout.days.forEach((_, index) => {
        const left = columnLeft(wrap, index);
        if (left === null) return;
        const distance = Math.abs(left - wrap.scrollLeft);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      setActive(best);
    };
    wrap.addEventListener("scroll", onScroll, { passive: true });
    return () => wrap.removeEventListener("scroll", onScroll);
  }, [layout.days]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || todayIndex <= 0) return;
    const left = columnLeft(wrap, todayIndex);
    if (left !== null) wrap.scrollLeft = left;
  }, [todayIndex]);

  function jump(index: number): void {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const left = columnLeft(wrap, index);
    if (left === null) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    wrap.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
    setActive(index);
  }

  if (cls.lessons.length === 0) return <p className="py-6 text-muted">{s.noLessons}</p>;

  const slots = (layout.lastMinute - layout.firstMinute) / 15;
  const lanesByDay = new Map<number, number>();
  for (const block of layout.blocks) {
    lanesByDay.set(block.day, Math.max(lanesByDay.get(block.day) ?? 1, block.lanes));
  }
  const columns = layout.days
    .map(
      (day) =>
        `minmax(max(var(--day-min), calc(var(--lane-min) * ${lanesByDay.get(day) ?? 1})), auto)`,
    )
    .join(" ");
  const hours: number[] = [];
  for (let minute = layout.firstMinute; minute <= layout.lastMinute; minute += 60)
    hours.push(minute);

  return (
    <TooltipProvider>
      <ToggleGroup
        aria-label={s.jumpTo}
        value={[String(active)]}
        onValueChange={([next]) => next !== undefined && jump(Number(next))}
        className="-mx-gutter sticky top-0 z-4 overflow-x-auto border-rule border-b bg-paper px-gutter [scrollbar-width:none] md:hidden print:hidden [&::-webkit-scrollbar]:hidden"
      >
        {layout.days.map((day, index) => {
          const date = dates[index] ?? monday;
          const isToday = date === today;
          return (
            <Toggle
              key={day}
              value={String(index)}
              variant="tab"
              className={cn("shrink-0 items-baseline", isToday && TODAY_TAB)}
            >
              {s.days[day - 1]}{" "}
              <span
                className={cn(
                  "font-medium text-faint group-aria-pressed:text-ink",
                  isToday && "text-blue group-aria-pressed:text-blue",
                )}
              >
                {dayNumber(date)}
              </span>
            </Toggle>
          );
        })}
      </ToggleGroup>
      <div
        ref={wrapRef}
        className="-mx-gutter snap-x snap-mandatory scroll-pl-(--time-w) overflow-x-auto overscroll-x-contain border-rule border-b bg-paper md:mx-0 md:snap-none md:rounded-sm md:border print:overflow-visible print:rounded-sm print:border"
      >
        <div
          className="tt-grid"
          style={
            { "--slots": slots, gridTemplateColumns: `var(--time-w) ${columns}` } as CSSProperties
          }
        >
          <div className="sticky top-0 left-0 z-3 border-rule border-b bg-paper md:border-r print:border-r" />
          {layout.days.map((day, index) => {
            const date = dates[index] ?? monday;
            const isToday = date === today;
            return (
              <div
                key={day}
                className={cn(
                  "flex snap-start items-baseline gap-1.5 border-rule border-b border-l bg-paper px-2.5 pt-3 pb-2 leading-none",
                  isToday && "shadow-[inset_0_2px_0_var(--blue)]",
                )}
              >
                <span className={cn("font-semibold text-s", isToday && "text-blue")}>
                  {s.days[day - 1]}
                </span>
                <span className={cn("font-medium text-faint text-s", isToday && "text-blue")}>
                  {dayNumber(date)}
                </span>
              </div>
            );
          })}
          <div
            data-times=""
            className="sticky left-0 z-2 bg-paper md:border-rule md:border-r print:border-rule print:border-r"
          >
            {hours.map((minute) => {
              const row = (minute - layout.firstMinute) / 15;
              const first = minute === layout.firstMinute;
              const last = minute === layout.lastMinute;
              return (
                <span
                  key={minute}
                  className={cn(
                    "tt-hour -translate-y-1/2 absolute right-[7px] font-semibold text-faint text-xs leading-none [font-stretch:112%]",
                    first && "top-1.5 translate-y-0",
                    last && "tt-hour-last -translate-y-full",
                  )}
                  style={{ "--row": row } as CSSProperties}
                >
                  {hourLabel(minute)}
                </span>
              );
            })}
          </div>
          {layout.days.map((day, index) => (
            <div
              key={day}
              data-day-col=""
              className={cn(
                "tt-day relative border-rule border-l",
                dates[index] === today && "bg-today",
              )}
            >
              {layout.blocks
                .filter((block) => block.day === day)
                .map((block) => (
                  <LessonBlock
                    key={`${block.start}-${block.module}`}
                    cls={cls}
                    block={block}
                    layout={layout}
                    selection={selection}
                    timetable={timetable}
                    s={s}
                    actions={actions}
                    hover={hover}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
