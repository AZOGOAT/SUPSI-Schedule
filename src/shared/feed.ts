import { academicEvents, addDays, expandLessons, findClass, type Occurrence } from "./events";
import { type AllDayIcsEvent, buildCalendar, type TimedIcsEvent } from "./ics";
import type { Lang, Selection } from "./selection";
import { slugify } from "./slug";
import type { AcademicCalendar, ClassTimetable, LessonKind, Timetable } from "./types";

export interface FeedInput {
  timetable: Timetable;
  calendar: AcademicCalendar;
  selection: Selection;
  /** Link shown in the nudge event when a selection has no lessons any more */
  siteUrl: string;
}

interface Labels {
  lecture: string;
  exercises: string;
  lab: string;
  teacher: string;
  course: string;
  class: string;
  type: string;
  source: string;
  updated: string;
  nudgeTitle: string;
  nudgeBody: string;
}

const LABELS: Record<Lang, Labels> = {
  en: {
    lecture: "lecture",
    exercises: "exercises",
    lab: "lab",
    teacher: "Teacher",
    course: "Course",
    class: "Class",
    type: "Type",
    source: "Source",
    updated: "Updated by SUPSI",
    nudgeTitle: "Update your SUPSI timetable selection",
    nudgeBody:
      "This calendar has no lessons for the current timetable. Open the link and pick your courses again.",
  },
  it: {
    lecture: "lezione",
    exercises: "esercitazione",
    lab: "laboratorio",
    teacher: "Docente",
    course: "Corso",
    class: "Classe",
    type: "Tipo",
    source: "Fonte",
    updated: "Aggiornato da SUPSI",
    nudgeTitle: "Aggiorna la selezione del tuo orario SUPSI",
    nudgeBody:
      "Questo calendario non ha lezioni per l'orario attuale. Apri il link e scegli di nuovo i tuoi corsi.",
  },
};

/** The short id as shown to people: Untis truncates it, so fall back to the full name when it does not match. */
export function displayShort(cls: ClassTimetable): string {
  return cls.name.toUpperCase().startsWith(cls.short.toUpperCase()) ? cls.short : cls.name;
}

/** "SUPSI I1A", plus "+N" when the selection spans more classes. */
export function calendarName(timetable: Timetable, selection: Selection): string {
  const first = selection.classes[0];
  if (!first) throw new Error("selection has no classes");
  const label = `SUPSI ${displayShort(findClass(timetable, first.classId))}`;
  const extra = selection.classes.length - 1;
  return extra > 0 ? `${label} +${extra}` : label;
}

function kindLabel(kind: LessonKind, labels: Labels): string {
  if (kind === "C") return labels.lecture;
  if (kind === "E") return labels.exercises;
  return labels.lab;
}

function kindList(kinds: LessonKind[], labels: Labels): string {
  return kinds.map((kind) => kindLabel(kind, labels)).join(", ");
}

/** The name alone when a lecture is in the slot, else the name with the kinds. */
function summary(occurrence: Occurrence, labels: Labels): string {
  const { name, kinds } = occurrence.slot;
  if (kinds.length === 0 || kinds.includes("C")) return name;
  return `${name} (${kindList(kinds, labels)})`;
}

function location(occurrence: Occurrence, timetable: Timetable): string | null {
  const { rooms } = occurrence.slot;
  if (rooms.length === 0) return null;
  return rooms
    .map((room) => {
      const roomName = timetable.rooms[room];
      return roomName ? `${room} ${roomName}` : room;
    })
    .join(", ");
}

function formatUpdated(localIso: string): string {
  const [year, month, day] = localIso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

function description(occurrence: Occurrence, timetable: Timetable, labels: Labels): string {
  const { slot } = occurrence;
  const lines: string[] = [];
  for (const teacher of slot.teachers) {
    const fullName = timetable.teachers[teacher];
    lines.push(`${labels.teacher}: ${fullName ? `${fullName} (${teacher})` : teacher}`);
  }
  lines.push(`${labels.course}: ${slot.module} (${slot.codes.join(", ")})`);
  lines.push(`${labels.class}: ${occurrence.className}`);
  if (slot.kinds.length > 0) lines.push(`${labels.type}: ${kindList(slot.kinds, labels)}`);
  lines.push(`${labels.source}: ${timetable.source}`);
  lines.push(`${labels.updated}: ${formatUpdated(timetable.sourceUpdatedAt)}`);
  return lines.join("\n");
}

function uid(occurrence: Occurrence): string {
  const { classId, date, start, slot } = occurrence;
  return `${classId}-${date}-${start.replace(":", "")}-${slot.module}@supsi-schedule`;
}

function nudgeDate(timetable: Timetable, calendar: AcademicCalendar): string {
  const monday = timetable.weeks[0]?.monday;
  const semester = monday && calendar.semesters.find((s) => s.start <= monday && monday <= s.end);
  if (!semester) throw new Error("no semester in the academic calendar covers the published week");
  return semester.start;
}

/** Builds the subscription feed for a selection. */
export function buildFeed({ timetable, calendar, selection, siteUrl }: FeedInput): string {
  const labels = LABELS[selection.lang];
  const occurrences = expandLessons(timetable, calendar, selection);
  const timed: TimedIcsEvent[] = occurrences.map((occurrence) => ({
    uid: uid(occurrence),
    summary: summary(occurrence, labels),
    location: location(occurrence, timetable),
    description: description(occurrence, timetable, labels),
    date: occurrence.date,
    start: occurrence.start,
    end: occurrence.end,
  }));
  const allDay: AllDayIcsEvent[] = [];
  if (occurrences.length === 0) {
    const date = nudgeDate(timetable, calendar);
    allDay.push({
      uid: `nudge-${date}@supsi-schedule`,
      summary: labels.nudgeTitle,
      description: `${labels.nudgeBody}\n${siteUrl}`,
      start: date,
      end: addDays(date, 1),
    });
  }
  if (selection.academic) {
    for (const event of academicEvents(calendar)) {
      allDay.push({
        uid: `acad-${event.start}-${slugify(event.title)}@supsi-schedule`,
        summary: event.title,
        description: "",
        start: event.start,
        end: event.end,
      });
    }
  }
  return buildCalendar({
    name: calendarName(timetable, selection),
    dtstamp: timetable.scrapedAt,
    timed,
    allDay,
  });
}
