import { useEffect, useRef, useState } from "react";
import { calendarName } from "../shared/feed";
import type { Lang, Selection } from "../shared/selection";
import type { AcademicCalendar, ClassTimetable, Timetable } from "../shared/types";
import type { Actions } from "./actions";
import { AddClass, ClassSection } from "./ClassSection";
import { Courses } from "./Courses";
import { courseSummaries } from "./courses";
import { dottedDate } from "./format";
import { classLabel } from "./labels";
import { Header, Page } from "./Page";
import { AppsSheet, CoursesSheet, GuideSheet } from "./Sheets";
import { ActionBar, calendarTargets, SubscribeDetails } from "./Subscribe";
import {
  addClass,
  isModuleSelected,
  removeClass,
  setClass,
  toggleGroup,
  toggleModule,
  writeSelection,
} from "./state";
import { fill, STRINGS, type Strings } from "./strings";
import { feedSelection, feedUrl, type Platform } from "./subscribe";

export const REPO_URL = "https://github.com/AZOGOAT/SUPSI-Schedule";
export const AUTHOR_URL = "https://github.com/AZOGOAT";

export interface AppProps {
  timetable: Timetable;
  calendar: AcademicCalendar;
  initialSelection: Selection | null;
  initialLang: Lang;
  today: string;
  origin: string;
  platform: Platform;
}

function Footer({ timetable, s }: { timetable: Timetable; s: Strings }) {
  return (
    <footer className="mt-14 grid gap-1 border-rule border-t pt-4 text-muted text-xs">
      <p>{s.unofficial}</p>
      <p className="flex flex-wrap gap-x-4 gap-y-1 print:hidden">
        <a className="text-muted" href={timetable.source} target="_blank" rel="noopener">
          {s.official}
        </a>
        <a className="text-muted" href={REPO_URL} target="_blank" rel="noopener">
          {s.sourceCode}
        </a>
      </p>
      <p>{fill(s.updated, { date: dottedDate(timetable.sourceUpdatedAt) })}</p>
      <a
        className="mt-2 inline-flex items-center gap-2 justify-self-start text-muted no-underline hover:underline print:hidden"
        href={AUTHOR_URL}
        target="_blank"
        rel="noopener"
      >
        <img className="block size-6" src="/azo.png" alt="" width="24" height="24" />
        {s.madeBy}
      </a>
    </footer>
  );
}

interface CourseCount {
  selected: number;
  total: number;
}

function countCourses(classes: ClassTimetable[], selection: Selection): CourseCount {
  const count = { selected: 0, total: 0 };
  for (const cls of classes) {
    const summaries = courseSummaries(cls);
    count.total += summaries.length;
    count.selected += summaries.filter((c) => isModuleSelected(selection, cls.id, c.module)).length;
  }
  return count;
}

type SheetName = "apps" | "guide" | "courses";

export function App({
  timetable,
  calendar,
  initialSelection,
  initialLang,
  today,
  origin,
  platform,
}: AppProps) {
  const [selection, setSelection] = useState<Selection | null>(initialSelection);
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [copied, setCopied] = useState(false);
  const [linkShown, setLinkShown] = useState(false);
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const copiedTimer = useRef(0);
  const s = STRINGS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    const query = (selection && writeSelection(selection)) || (lang === "it" ? "?lang=it" : "");
    history.replaceState(null, "", `${location.pathname}${query}`);
  }, [selection, lang]);

  const usable = selection !== null && feedSelection(selection).classes.length > 0;
  const feed = selection && usable ? feedUrl(origin, selection) : "";
  const name = selection && usable ? calendarName(timetable, feedSelection(selection)) : "";
  const classIds = selection ? selection.classes.map((c) => c.classId) : [""];
  const classes = classIds.flatMap((id) => {
    const cls = timetable.classes.find((c) => c.id === id);
    return cls ? [cls] : [];
  });
  const targets = calendarTargets(platform, feed, name, s);

  const actions: Actions = {
    setLang(next) {
      setLangState(next);
      setSelection((current) => current && { ...current, lang: next });
    },
    setClass(index, classId) {
      if (!classId) return;
      setSelection((current) =>
        current
          ? setClass(current, index, classId)
          : { classes: [{ classId, modules: null }], skip: [], academic: true, lang },
      );
    },
    addClass(classId) {
      setSelection((current) => current && addClass(current, classId));
    },
    removeClass(index) {
      setSelection((current) => current && removeClass(current, index));
    },
    toggleModule(cls, module) {
      setSelection((current) => current && toggleModule(current, cls, module));
    },
    toggleGroup(cls, group) {
      setSelection((current) => current && toggleGroup(current, cls, group));
    },
    toggleAcademic() {
      setSelection((current) => current && { ...current, academic: !current.academic });
    },
    copyLink() {
      if (!feed) return;
      if (!navigator.clipboard) {
        setLinkShown(true);
        return;
      }
      navigator.clipboard.writeText(feed).then(() => {
        setCopied(true);
        window.clearTimeout(copiedTimer.current);
        copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
      });
    },
  };

  /** Opens a sheet, remembering what had focus so closing hands it back; a sheet opened from another keeps the first opener. */
  function openSheet(name: SheetName): void {
    if (sheet === null && document.activeElement instanceof HTMLElement) {
      opener.current = document.activeElement;
    }
    setSheet(name);
  }

  const count = selection ? countCourses(classes, selection) : { selected: 0, total: 0 };
  const countLabel =
    count.selected === 1 ? s.oneCourse : fill(s.coursesCount, { n: count.selected });
  const countOf = fill(s.countOf, { n: count.selected, total: count.total });

  /** The course list of every class; the rail names the first one "Your courses", the drawer names each by class. */
  const courseLists = (byClass: boolean) =>
    selection &&
    classes.map((cls, index) => {
      const label = classLabel(cls);
      return (
        <Courses
          key={cls.id}
          title={index === 0 && !byClass ? s.courses : `${label.short} ${label.programme}`}
          cls={cls}
          selection={selection}
          timetable={timetable}
          s={s}
          actions={actions}
        />
      );
    });

  return (
    <Page hasBar={usable}>
      <Header s={s} lang={lang} onLang={actions.setLang} />
      <main className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 print:block">
        <div className="min-w-0">
          {classIds.map((id, index) => (
            <ClassSection
              key={id || "none"}
              index={index}
              classId={id}
              timetable={timetable}
              calendar={calendar}
              selection={selection}
              today={today}
              s={s}
              actions={actions}
            />
          ))}
          {selection && <AddClass timetable={timetable} taken={classIds} s={s} actions={actions} />}
        </div>
        <aside className="hidden min-w-0 flex-col gap-10 [scrollbar-color:var(--rule-strong)_transparent] [scrollbar-width:thin] lg:sticky lg:top-0 lg:flex lg:max-h-dvh lg:self-start lg:overflow-y-auto lg:pt-9 lg:pb-[calc(var(--bar-h)+24px)] print:flex">
          {courseLists(false)}
          {selection && (
            <SubscribeDetails
              selection={selection}
              usable={usable}
              s={s}
              actions={actions}
              onOpenGuide={() => openSheet("guide")}
            />
          )}
        </aside>
      </main>
      <Footer timetable={timetable} s={s} />
      {selection && (
        <CoursesSheet
          open={sheet === "courses"}
          onOpenChange={(open) => setSheet(open ? "courses" : null)}
          opener={opener}
          s={s}
        >
          {courseLists(true)}
          <SubscribeDetails selection={selection} usable={usable} s={s} actions={actions} />
        </CoursesSheet>
      )}
      {usable && (
        <>
          <ActionBar
            targets={targets}
            feed={feed}
            name={name}
            count={countLabel}
            countOf={countOf}
            copied={copied}
            linkShown={linkShown}
            s={s}
            actions={actions}
            onOpenApps={() => openSheet("apps")}
            onOpenCourses={() => openSheet("courses")}
          />
          <AppsSheet
            open={sheet === "apps"}
            onOpenChange={(open) => setSheet(open ? "apps" : null)}
            opener={opener}
            targets={targets}
            name={name}
            count={countLabel}
            feed={feed}
            linkShown={linkShown}
            copied={copied}
            s={s}
            actions={actions}
            onShowGuide={() => openSheet("guide")}
          />
          <GuideSheet
            open={sheet === "guide"}
            onOpenChange={(open) => setSheet(open ? "guide" : null)}
            opener={opener}
            copied={copied}
            s={s}
            actions={actions}
          />
        </>
      )}
    </Page>
  );
}

export function LoadError({ lang }: { lang: Lang }) {
  const s = STRINGS[lang];
  return (
    <Page>
      <Header s={s} />
      <p className="mt-6 max-w-[58ch] text-red text-s">{s.loadError}</p>
    </Page>
  );
}
