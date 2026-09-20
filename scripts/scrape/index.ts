import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import type { Timetable } from "../../src/shared/types";
import { buildTimetable, isSameTimetable } from "./build";
import { parseClassPage, parseFooter, parseNavbar, parseTeacherPage, parseTitle } from "./untis";

const SOURCE = "https://www3.supsi.ch/inside/area_riservata_dti/orari/definitivi/";
const USER_AGENT =
  "supsi-schedule (student timetable feed; https://github.com/AZOGOAT/SUPSI-Schedule)";
const CONCURRENCY = 4;

const { values: args } = parseArgs({
  options: {
    force: { type: "boolean", default: false },
    out: { type: "string", default: "public/data/timetable.json" },
  },
});

async function fetchPage(path: string): Promise<string | null> {
  const response = await fetch(SOURCE + path, { headers: { "User-Agent": USER_AGENT } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return new TextDecoder("iso-8859-1").decode(await response.arrayBuffer());
}

async function fetchRequired(path: string): Promise<string> {
  const html = await fetchPage(path);
  if (html === null) throw new Error(`${path}: not found`);
  return html;
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index] as T);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function pageNumber(index: number): string {
  return String(index).padStart(5, "0");
}

async function readPrevious(path: string): Promise<Timetable | null> {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

async function main(): Promise<void> {
  const previous = await readPrevious(args.out);
  const [navbarHtml, titleHtml, footerHtml] = await Promise.all([
    fetchRequired("frames/navbar.htm"),
    fetchRequired("frames/title.htm"),
    fetchRequired("frames/fuss.htm"),
  ]);
  const sourceUpdatedAt = parseFooter(footerHtml);
  if (!args.force && previous?.sourceUpdatedAt === sourceUpdatedAt) {
    console.log("unchanged");
    return;
  }

  const navbar = parseNavbar(navbarHtml);
  const firstWeek = navbar.weeks[0];
  if (!firstWeek) throw new Error("navbar lists no weeks");

  const teacherIndexes = navbar.teachers.map((_, i) => i + 1);
  const teacherPages = await mapLimit(teacherIndexes, CONCURRENCY, (i) =>
    fetchPage(`t/${firstWeek.week}/t${pageNumber(i)}.htm`),
  );
  const teachers: Record<string, string> = {};
  for (const html of teacherPages) {
    if (html === null) continue;
    const { short, name } = parseTeacherPage(html);
    teachers[short] = name;
  }

  const roomCodes = new Set(Object.keys(navbar.rooms));
  const jobs = navbar.weeks.flatMap((w) =>
    navbar.classes.map((name, i) => ({ week: w.week, index: i + 1, name })),
  );
  const pages = await mapLimit(jobs, CONCURRENCY, async ({ week, index, name }) => {
    const html = await fetchPage(`c/${week}/c${pageNumber(index)}.htm`);
    if (html === null) {
      console.error(`warning: no page for "${name}" in week ${week}`);
      return null;
    }
    return { week, page: parseClassPage(html, roomCodes) };
  });

  const timetable = buildTimetable({
    source: SOURCE,
    sourceUpdatedAt,
    scrapedAt: new Date().toISOString(),
    semester: parseTitle(titleHtml),
    weeks: navbar.weeks,
    teachers,
    rooms: navbar.rooms,
    pages: pages.filter((p) => p !== null),
  });

  if (previous && isSameTimetable(previous, timetable)) {
    console.log("unchanged");
    return;
  }
  await mkdir(dirname(args.out), { recursive: true });
  await writeFile(args.out, `${JSON.stringify(timetable, null, 2)}\n`);
  const lessonCount = timetable.classes.reduce((n, c) => n + c.lessons.length, 0);
  console.error(
    `${timetable.classes.length} classes, ${lessonCount} lessons, source ${sourceUpdatedAt}`,
  );
  console.log("changed");
}

await main();
