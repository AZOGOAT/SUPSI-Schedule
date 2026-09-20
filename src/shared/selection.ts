export type Lang = "en" | "it";

export interface ClassSelection {
  classId: string;
  /** null means every module of the class */
  modules: string[] | null;
}

export interface Selection {
  classes: ClassSelection[];
  academic: boolean;
  lang: Lang;
}

export class SelectionError extends Error {}

const CLASS_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MODULE = /^[A-Za-z0-9_]+\+?$/;

function parseFlag(value: string | null, name: string): boolean {
  if (value === null || value === "1") return true;
  if (value === "0") return false;
  throw new SelectionError(`${name} must be 0 or 1`);
}

function parseLang(value: string | null): Lang {
  if (value === null || value === "en") return "en";
  if (value === "it") return "it";
  throw new SelectionError("lang must be en or it");
}

/** Parses the feed and page query grammar: sel=class[:module,...][;...]&academic=0|1&lang=en|it */
export function parseSelection(params: URLSearchParams): Selection {
  const sel = params.get("sel");
  if (!sel) throw new SelectionError("missing sel parameter");
  const classes: ClassSelection[] = [];
  for (const entry of sel.split(";")) {
    const [classId, moduleList, ...rest] = entry.split(":");
    if (!classId || !CLASS_ID.test(classId) || rest.length > 0) {
      throw new SelectionError(`bad class entry "${entry}"`);
    }
    if (classes.some((c) => c.classId === classId)) {
      throw new SelectionError(`class "${classId}" listed twice`);
    }
    let modules: string[] | null = null;
    if (moduleList !== undefined) {
      // a plus typed straight into the address bar arrives as a space
      modules = moduleList.split(",").map((m) => m.replace(/ $/, "+"));
      if (modules.some((m) => !MODULE.test(m))) {
        throw new SelectionError(`bad module list for "${classId}"`);
      }
    }
    classes.push({ classId, modules });
  }
  return {
    classes,
    academic: parseFlag(params.get("academic"), "academic"),
    lang: parseLang(params.get("lang")),
  };
}

/**
 * Writes the query string for a selection, leaving the separators readable and omitting defaults.
 * A plus (Precalcolo+) is the one character that must be encoded, or the query reads it as a space.
 */
export function formatSelection(selection: Selection): string {
  const sel = selection.classes
    .map((c) => (c.modules ? `${c.classId}:${c.modules.join(",")}` : c.classId))
    .join(";");
  const parts = [`sel=${sel}`];
  if (!selection.academic) parts.push("academic=0");
  if (selection.lang !== "en") parts.push(`lang=${selection.lang}`);
  return parts.join("&").replaceAll("+", "%2B");
}
