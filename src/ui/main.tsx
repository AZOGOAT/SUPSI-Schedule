import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { Lang, Selection } from "../shared/selection";
import type { AcademicCalendar, Timetable } from "../shared/types";
import { App, LoadError } from "./App";
import { Loading } from "./Loading";
import { readSelection } from "./state";
import { primaryPlatform } from "./subscribe";

const root = document.getElementById("app");
if (!root) throw new Error("missing #app");
const app = createRoot(root);

async function loadJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Drops classes the timetable no longer has, so a stale link still opens. */
function knownClasses(selection: Selection | null, timetable: Timetable): Selection | null {
  if (!selection) return null;
  const classes = selection.classes.filter((c) =>
    timetable.classes.some((t) => t.id === c.classId),
  );
  return classes.length > 0 ? { ...selection, classes } : null;
}

async function boot(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const lang: Lang = params.get("lang") === "it" ? "it" : "en";
  document.documentElement.lang = lang;
  app.render(<Loading lang={lang} />);
  try {
    const [timetable, calendar] = await Promise.all([
      loadJson<Timetable>("/data/timetable.json"),
      loadJson<AcademicCalendar>("/data/academic-calendar.json"),
    ]);
    app.render(
      <StrictMode>
        <App
          timetable={timetable}
          calendar={calendar}
          initialSelection={knownClasses(readSelection(location.search), timetable)}
          initialLang={lang}
          today={localToday()}
          origin={location.origin}
          platform={primaryPlatform(navigator.userAgent)}
        />
      </StrictMode>,
    );
  } catch {
    app.render(<LoadError lang={lang} />);
  }
}

boot();
