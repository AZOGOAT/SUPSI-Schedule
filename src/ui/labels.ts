import type { ClassTimetable } from "../shared/types";
import type { Strings } from "./strings";

export interface ClassLabel {
  short: string;
  programme: string;
}

export type Family =
  | "informatica"
  | "data"
  | "elettronica"
  | "gestionale"
  | "meccanica"
  | "mse"
  | "other";

export interface ClassGroup {
  family: Family;
  classes: ClassTimetable[];
}

const BACHELOR = /^([A-Z]\d[A-Z])-(.+)$/;
const FAMILY_ORDER: Family[] = [
  "informatica",
  "data",
  "elettronica",
  "gestionale",
  "meccanica",
  "mse",
  "other",
];
const BY_LETTER: Record<string, Family> = {
  I: "informatica",
  D: "data",
  E: "elettronica",
  G: "gestionale",
  M: "meccanica",
};

function readable(word: string): string {
  return word.length <= 3 ? word : word.charAt(0) + word.slice(1).toLowerCase();
}

/** The class as people say it: "D1A" and "Data Science" instead of D1A-DATA-SCIENCE. */
export function classLabel(cls: ClassTimetable): ClassLabel {
  const match = BACHELOR.exec(cls.name);
  const short = match?.[1];
  const rest = match?.[2];
  if (short && rest) return { short, programme: rest.split("-").map(readable).join(" ") };
  if (cls.name.startsWith("MSE-")) return { short: "MSE", programme: cls.name.slice(4) };
  return { short: cls.short, programme: cls.name };
}

export function classFamily(cls: ClassTimetable): Family {
  const match = BACHELOR.exec(cls.name);
  const letter = match?.[1]?.charAt(0);
  if (letter) return BY_LETTER[letter] ?? "other";
  return cls.name.startsWith("MSE-") ? "mse" : "other";
}

/** Classes by programme in a fixed order, keeping the timetable's order inside each group. */
export function groupClasses(classes: ClassTimetable[]): ClassGroup[] {
  return FAMILY_ORDER.map((family) => ({
    family,
    classes: classes.filter((cls) => classFamily(cls) === family),
  })).filter((group) => group.classes.length > 0);
}

/** "SEMESTRE AUTUNNALE 2026" in the page language, or the title as published. */
export function semesterLabel(title: string, s: Strings): string {
  const match = /^SEMESTRE (AUTUNNALE|PRIMAVERILE) (\d{4})$/.exec(title);
  const season = match?.[1];
  const year = match?.[2];
  if (!season || !year) return title;
  return `${season === "AUTUNNALE" ? s.autumn : s.spring} ${year}`;
}
