import { parse, type DefaultTreeAdapterTypes as Tree } from "parse5";

type Element = Tree.Element;
type Node = Tree.Node;

export interface WeekOption {
  week: number;
  monday: string;
}

export interface NavbarData {
  classes: string[];
  teachers: string[];
  rooms: Record<string, string>;
  weeks: WeekOption[];
}

export interface PageHeader {
  short: string;
  name: string;
}

export interface ParsedLesson {
  day: number;
  start: string;
  end: string;
  code: string;
  name: string;
  room: string | null;
  teacher: string | null;
  color: string | null;
}

export interface ClassPage extends PageHeader {
  lessons: ParsedLesson[];
}

const DAY_NUMBERS: Record<string, number> = {
  lunedì: 1,
  martedì: 2,
  mercoledì: 3,
  giovedì: 4,
  venerdì: 5,
  sabato: 6,
  domenica: 7,
};

const TIME = /\d{1,2}:\d{2}/g;
const TIME_TOKEN = /^\d{1,2}[.:]\d{2}$/;
const CODE_TOKEN = /^[A-Z]-[A-Z0-9]+\+?$|^[A-Z]{2,3}_[A-Za-z0-9]+$|^A$/;
const ROOM_TOKEN = /^[A-Z]?-?\d\.\d{2}$/;
const TEACHER_TOKEN = /^[A-Z]{2,4}$/;

function jsStringArray(html: string, name: string): string[] {
  const match = html.match(new RegExp(`var ${name} = (\\[.*?\\]);`));
  if (!match?.[1]) throw new Error(`navbar has no "${name}" array`);
  return JSON.parse(match[1]);
}

/** Reads the class, teacher and room lists plus the week options from frames/navbar.htm. */
export function parseNavbar(html: string): NavbarData {
  const rooms: Record<string, string> = {};
  for (const entry of jsStringArray(html, "rooms")) {
    const space = entry.indexOf(" ");
    rooms[entry.slice(0, space)] = entry.slice(space + 1);
  }
  const weeks: WeekOption[] = [];
  for (const m of html.matchAll(/<option value="(\d+)">(\d{1,2})\.(\d{1,2})\.(\d{4})<\/option>/g)) {
    const [, week, day, month, year] = m;
    weeks.push({
      week: Number(week),
      monday: `${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}`,
    });
  }
  return {
    classes: jsStringArray(html, "classes"),
    teachers: jsStringArray(html, "teachers"),
    rooms,
    weeks,
  };
}

function isElement(node: Node): node is Element {
  return "tagName" in node;
}

function attr(el: Element, name: string): string | undefined {
  return el.attrs.find((a) => a.name === name)?.value;
}

function textOf(node: Node): string {
  if ("value" in node) return node.value;
  if ("childNodes" in node) return node.childNodes.map(textOf).join("");
  return "";
}

function findAll(node: Node, tag: string, out: Element[] = []): Element[] {
  if (!("childNodes" in node)) return out;
  for (const child of node.childNodes) {
    if (isElement(child)) {
      if (child.tagName === tag) out.push(child);
      findAll(child, tag, out);
    }
  }
  return out;
}

function findFirst(node: Node, pred: (el: Element) => boolean): Element | undefined {
  if (!("childNodes" in node)) return undefined;
  for (const child of node.childNodes) {
    if (!isElement(child)) continue;
    if (pred(child)) return child;
    const nested = findFirst(child, pred);
    if (nested) return nested;
  }
  return undefined;
}

function elementChildren(el: Element, tag: string): Element[] {
  return el.childNodes.filter((n): n is Element => isElement(n) && n.tagName === tag);
}

function cleanText(node: Node): string {
  return textOf(node)
    .replace(/\u00a0/g, " ")
    .trim();
}

/** Reads the semester label from frames/title.htm. */
export function parseTitle(html: string): string {
  const span = findFirst(parse(html), (el) => el.tagName === "span");
  if (!span) throw new Error("title page has no span");
  return cleanText(span);
}

/** Reads "ultimo aggiornamento: DD-MM-YYYY HH:MM" from frames/fuss.htm as local ISO time. */
export function parseFooter(html: string): string {
  const m = html.match(/ultimo aggiornamento:\s*(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) throw new Error("footer has no update time");
  const [, day, month, year, hour, minute] = m;
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function parseHeader(root: Node): PageHeader {
  const shortEl = findFirst(root, (el) => el.tagName === "font" && attr(el, "color") === "#0000FF");
  if (!shortEl?.parentNode) throw new Error("page has no header");
  const siblings = shortEl.parentNode.childNodes;
  const nameEl = siblings.slice(siblings.indexOf(shortEl) + 1).find(isElement);
  if (!nameEl) throw new Error("page header has no name");
  return { short: cleanText(shortEl), name: cleanText(nameEl) };
}

/** Reads abbreviation and full name from a teacher page header. */
export function parseTeacherPage(html: string): PageHeader {
  return parseHeader(parse(html));
}

function span(td: Element, name: "rowspan" | "colspan"): number {
  return Number(attr(td, name) ?? "1");
}

function collectLines(node: Node, lines: string[], buffer: { text: string }): void {
  if ("value" in node) {
    buffer.text += node.value;
    return;
  }
  if (isElement(node) && node.tagName === "br") {
    lines.push(buffer.text);
    buffer.text = "";
    return;
  }
  if ("childNodes" in node) for (const child of node.childNodes) collectLines(child, lines, buffer);
}

function cellTokens(td: Element): string[] {
  const lines: string[] = [];
  const buffer = { text: "" };
  collectLines(td, lines, buffer);
  lines.push(buffer.text);
  return lines.map((l) => l.replace(/\u00a0/g, " ").trim()).filter((l) => l.length > 0);
}

interface CellLesson {
  code: string;
  room: string | null;
  teacher: string | null;
  names: string[];
}

function parseCell(td: Element, roomCodes: Set<string>): CellLesson[] {
  const lessons: CellLesson[] = [];
  let current: CellLesson | null = null;
  for (const row of findAll(td, "tr")) {
    const tokens = elementChildren(row, "td")
      .flatMap(cellTokens)
      .filter((t) => roomCodes.has(t) || !TIME_TOKEN.test(t));
    const first = tokens[0];
    if (first === undefined) continue;
    if (CODE_TOKEN.test(first)) {
      current = { code: first, room: null, teacher: null, names: [] };
      lessons.push(current);
      for (const t of tokens.slice(1)) {
        if (t === "?") continue;
        if (roomCodes.has(t) || ROOM_TOKEN.test(t)) current.room = t;
        else if (TEACHER_TOKEN.test(t)) current.teacher = t;
        else current.names.push(t);
      }
    } else if (current) {
      current.names.push(...tokens);
    }
  }
  return lessons;
}

function padTime(t: string): string {
  return t.padStart(5, "0");
}

/** Parses a class timetable page into its header and one lesson per (slot, group). */
export function parseClassPage(html: string, roomCodes: Set<string>): ClassPage {
  const root = parse(html);
  const header = parseHeader(root);
  const table = findFirst(root, (el) => el.tagName === "table" && attr(el, "border") === "3");
  if (!table) throw new Error(`${header.short}: page has no timetable table`);
  const rows = elementChildren(table, "tbody").flatMap((body) => elementChildren(body, "tr"));
  const [headerRow, ...bodyRows] = rows;
  if (!headerRow) throw new Error(`${header.short}: timetable has no header row`);

  const dayColumns: { from: number; to: number; day: number }[] = [];
  const [corner, ...dayCells] = elementChildren(headerRow, "td");
  let col = corner ? span(corner, "colspan") : 1;
  for (const td of dayCells) {
    const label = cleanText(td).toLowerCase();
    const day = DAY_NUMBERS[label];
    if (day === undefined) throw new Error(`${header.short}: unknown day "${label}"`);
    const width = span(td, "colspan");
    dayColumns.push({ from: col, to: col + width, day });
    col += width;
  }

  const occupied = new Set<string>();
  const slots = new Map<number, { start: string; end: string }>();
  const placed: { row: number; rowspan: number; day: number; td: Element }[] = [];
  bodyRows.forEach((tr, index) => {
    const row = index + 1;
    let c = 0;
    for (const td of elementChildren(tr, "td")) {
      while (occupied.has(`${row}:${c}`)) c++;
      const rowspan = span(td, "rowspan");
      const colspan = span(td, "colspan");
      for (let r = row; r < row + rowspan; r++) {
        for (let cc = c; cc < c + colspan; cc++) occupied.add(`${r}:${cc}`);
      }
      if (c === 0) {
        const times = textOf(td).match(TIME);
        if (times && times.length >= 2) {
          const slot = { start: padTime(times[0] as string), end: padTime(times[1] as string) };
          for (let r = row; r < row + rowspan; r++) slots.set(r, slot);
        }
      } else {
        const column = dayColumns.find((d) => d.from <= c && c < d.to);
        if (!column) throw new Error(`${header.short}: cell outside the day columns at row ${row}`);
        placed.push({ row, rowspan, day: column.day, td });
      }
      c += colspan;
    }
  });

  const lessons: ParsedLesson[] = [];
  for (const { row, rowspan, day, td } of placed) {
    const found = parseCell(td, roomCodes);
    if (found.length === 0) continue;
    const first = slots.get(row);
    const last = slots.get(row + rowspan - 1);
    if (!first || !last) throw new Error(`${header.short}: lesson at row ${row} has no time slot`);
    const color = attr(td, "bgcolor") ?? null;
    for (const lesson of found) {
      lessons.push({
        day,
        start: first.start,
        end: last.end,
        code: lesson.code,
        name: lesson.names.join(" / "),
        room: lesson.room,
        teacher: lesson.teacher,
        color,
      });
    }
  }
  return { ...header, lessons };
}
