import { mergeSlots, type Slot } from "../shared/slots";
import type { Lesson } from "../shared/types";

export interface GridBlock {
  day: number;
  /** minutes since midnight */
  start: number;
  end: number;
  lane: number;
  lanes: number;
  slot: Slot;
}

export interface GridLayout {
  firstMinute: number;
  lastMinute: number;
  days: number[];
  blocks: GridBlock[];
}

const DEFAULT_FIRST = 8 * 60;
const DEFAULT_LAST = 18 * 60;

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function compareBlocks(a: GridBlock, b: GridBlock): number {
  return (
    a.day - b.day ||
    a.start - b.start ||
    b.end - a.end ||
    a.slot.module.localeCompare(b.slot.module)
  );
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
 * Places a class's lessons on a week grid: one block per module and slot, and blocks of
 * different modules side by side only while they overlap.
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

  const blocks: GridBlock[] = mergeSlots(lessons).map((slot) => ({
    day: slot.day,
    start: toMinutes(slot.start),
    end: toMinutes(slot.end),
    lane: 0,
    lanes: 1,
    slot,
  }));
  blocks.sort(compareBlocks);
  for (const day of days) assignLanes(blocks.filter((b) => b.day === day));

  return { firstMinute, lastMinute, days, blocks };
}
