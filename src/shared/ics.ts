export interface TimedIcsEvent {
  uid: string;
  summary: string;
  location: string | null;
  description: string;
  date: string;
  start: string;
  end: string;
}

export interface AllDayIcsEvent {
  uid: string;
  summary: string;
  description: string;
  start: string;
  /** exclusive */
  end: string;
}

export interface CalendarInput {
  name: string;
  /** ISO instant used as DTSTAMP on every event */
  dtstamp: string;
  timed: TimedIcsEvent[];
  allDay: AllDayIcsEvent[];
}

const TZID = "Europe/Zurich";

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19810329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19961027T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** Escapes text for an iCalendar property value (RFC 5545 section 3.3.11). */
export function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function utf8Length(char: string): number {
  const cp = char.codePointAt(0) ?? 0;
  if (cp < 0x80) return 1;
  if (cp < 0x800) return 2;
  if (cp < 0x10000) return 3;
  return 4;
}

/** Folds a content line at 75 octets, continuation lines starting with a space, never inside a character. */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74;
    const size = utf8Length(char);
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.map((part, i) => (i === 0 ? part : ` ${part}`)).join("\r\n");
}

function utcStamp(iso: string): string {
  return iso.replace(/\.\d+/, "").replace(/[-:]/g, "");
}

function localStamp(date: string, time: string): string {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function eventLines(uid: string, dtstamp: string, summary: string, description: string): string[] {
  const lines = [`UID:${uid}`, `DTSTAMP:${dtstamp}`, `SUMMARY:${escapeText(summary)}`];
  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
  return lines;
}

/** Renders a complete VCALENDAR with CRLF line ends and folded lines. */
export function buildCalendar(input: CalendarInput): string {
  const dtstamp = utcStamp(input.dtstamp);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SUPSI Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(input.name)}`,
    `X-WR-TIMEZONE:${TZID}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...VTIMEZONE,
  ];
  for (const event of input.timed) {
    lines.push(
      "BEGIN:VEVENT",
      ...eventLines(event.uid, dtstamp, event.summary, event.description),
      `DTSTART;TZID=${TZID}:${localStamp(event.date, event.start)}`,
      `DTEND;TZID=${TZID}:${localStamp(event.date, event.end)}`,
    );
    if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    lines.push("END:VEVENT");
  }
  for (const event of input.allDay) {
    lines.push(
      "BEGIN:VEVENT",
      ...eventLines(event.uid, dtstamp, event.summary, event.description),
      `DTSTART;VALUE=DATE:${event.start.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${event.end.replace(/-/g, "")}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
