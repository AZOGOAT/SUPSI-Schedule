declare module "*/academic-calendar.json" {
  const calendar: import("./types").AcademicCalendar;
  export default calendar;
}

declare module "*/timetable.json" {
  const timetable: import("./types").Timetable;
  export default timetable;
}
