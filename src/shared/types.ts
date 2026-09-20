export type LessonKind = "C" | "E" | "L";

export interface Week {
  week: number;
  monday: string;
}

export interface Lesson {
  week: number;
  day: number;
  start: string;
  end: string;
  code: string;
  module: string;
  kind: LessonKind | null;
  name: string;
  room: string | null;
  teacher: string | null;
  color: string | null;
}

export interface ClassTimetable {
  id: string;
  short: string;
  name: string;
  lessons: Lesson[];
}

export interface Timetable {
  source: string;
  sourceUpdatedAt: string;
  scrapedAt: string;
  semester: string;
  weeks: Week[];
  teachers: Record<string, string>;
  rooms: Record<string, string>;
  classes: ClassTimetable[];
}

export type AcademicEventType = "holiday" | "break" | "exams" | "info";

export interface AcademicEvent {
  title: string;
  type: AcademicEventType;
  date?: string;
  start?: string;
  end?: string;
}

export interface Semester {
  id: string;
  label: string;
  start: string;
  end: string;
  endFinalYear?: string;
}

export interface AcademicCalendar {
  year: string;
  semesters: Semester[];
  finalYearClasses: string[];
  events: AcademicEvent[];
}
