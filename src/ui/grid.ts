import { baseName } from "../shared/names";
import type { Lesson, LessonKind } from "../shared/types";

export interface LessonGroup {
  module: string;
  /** teacher, else room, else empty: what tells parallel groups apart */
  key: string;
  teacher: string | null;
  /** distinct rooms of the group, comma separated */
  room: string | null;
  lessons: Lesson[];
}

export interface GridBlock {
  day: number;
  /** minutes since midnight */
  start: number;
  end: number;
  lane: number;
  lanes: number;
  module: string;
  name: string;
  kinds: LessonKind[];
  groups: LessonGroup[];
}

export interface GridLayout {
  firstMinute: number;
  lastMinute: number;
  days: number[];
  blocks: GridBlock[];
}

const DEFAULT_FIRST = 8 * 60;
const DEFAULT_LAST = 18 * 60;
const KIND_ORDER: LessonKind[] = ["C", "E", "L"];

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

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

/** Parallel groups of one slot: lessons with the same teacher (or, without one, the same room) are one group. */
export function groupLessons(lessons: Lesson[]): LessonGroup[] {
  const groups: LessonGroup[] = [];
  for (const lesson of lessons) {
    const key = lesson.teacher ?? lesson.room ?? "";
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { module: lesson.module, key, teacher: lesson.teacher, room: null, lessons: [] };
      groups.push(group);
    }
    group.lessons.push(lesson);
  }
  for (const group of groups) {
    const rooms = [...new Set(group.lessons.flatMap((l) => (l.room ? [l.room] : [])))];
    group.room = rooms.length > 0 ? rooms.join(", ") : null;
  }
  return groups;
}

function compareBlocks(a: GridBlock, b: GridBlock): number {
  return a.day - b.day || a.start - b.start || b.end - a.end || a.module.localeCompare(b.module);
}

function assignLanes(dayBlocks: GridBlock[]): void {
  const laneEnds: number[] = [];
  let cluster: GridBlock[] = [];
  let clusterEnd = 0;
  const close = () => {
    const lanes = cluster.reduce((max, b) => Math.max(max, b.lane + 1), 0);
    for (const b of cluster) b.lanes = lanes;
    cluster = [];
    laneEnds.length = 0;
  };
  for (const block of dayBlocks) {
    if (cluster.length > 0 && block.start >= clusterEnd) close();
    let lane = laneEnds.findIndex((end) => end <= block.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(block.end);
    } else {
      laneEnds[lane] = block.end;
    }
    block.lane = lane;
    cluster.push(block);
    clusterEnd = Math.max(clusterEnd, block.end);
  }
  close();
}

/**
 * Places a class's lessons on a week grid: one block per module and slot, parallel groups inside
 * it, and blocks of different modules side by side only while they overlap.
 */
export function layoutGrid(lessons: Lesson[]): GridLayout {
  let days = [1, 2, 3, 4, 5];
  let firstMinute = DEFAULT_FIRST;
  let lastMinute = DEFAULT_LAST;
  if (lessons.length > 0) {
    const lessonDays = lessons.map((l) => l.day);
    days = [];
    for (let day = Math.min(...lessonDays); day <= Math.max(...lessonDays); day++) days.push(day);
    firstMinute = Math.floor(Math.min(...lessons.map((l) => toMinutes(l.start))) / 60) * 60;
    lastMinute = Math.ceil(Math.max(...lessons.map((l) => toMinutes(l.end))) / 60) * 60;
  }

  const slots = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const key = `${lesson.day}|${lesson.start}|${lesson.end}|${lesson.module}`;
    const slot = slots.get(key);
    if (slot) slot.push(lesson);
    else slots.set(key, [lesson]);
  }
  const blocks: GridBlock[] = [];
  for (const slotLessons of slots.values()) {
    const groups = groupLessons(slotLessons);
    const [first] = groups;
    if (!first) continue;
    const [lesson] = first.lessons;
    if (!lesson) continue;
    blocks.push({
      day: lesson.day,
      start: toMinutes(lesson.start),
      end: toMinutes(lesson.end),
      lane: 0,
      lanes: 1,
      module: lesson.module,
      name: longestName(slotLessons),
      kinds: sortKinds(slotLessons),
      groups,
    });
  }
  blocks.sort(compareBlocks);
  for (const day of days) assignLanes(blocks.filter((b) => b.day === day));

  return { firstMinute, lastMinute, days, blocks };
}
