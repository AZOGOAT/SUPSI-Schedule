# SUPSI DTI timetable

Turns the DTI class timetable into a calendar subscription you can add to Apple Calendar, Google Calendar or Outlook. Pick your class, tap away the lessons you do not follow, choose your group where the class is split, and the calendar keeps itself in sync when SUPSI republishes the timetable.

Unofficial student project, not affiliated with SUPSI. The timetable data comes from the [official DTI timetable](https://www3.supsi.ch/inside/area_riservata_dti/orari/definitivi/) as published; no guarantees.

## How it works

- A GitHub Actions job fetches the Untis HTML export every three hours, parses every class page and commits `public/data/timetable.json` when something changed. The scrape stops early when the export's "ultimo aggiornamento" time has not moved.
- The site is a static page on Cloudflare Pages. A Pages Function at `/api/ics` turns a selection into an iCalendar feed on request.
- Each lesson becomes one event per week of the semester, in Europe/Zurich time, with the course name and type, room code and room name, teacher, course code and class in the event. Holidays and breaks from the DTI academic calendar are left out; the calendar entries themselves can be added as all-day events.

## Feed URL

```text
/api/ics?sel=i1a-informatica:E1204,B1201;approfondimenti-ultimo-anno:I5331&skip=E-E1204@RVR&academic=1&lang=en
```

- `sel`: classes separated by `;`, each `classId[:module,module,...]`. A class without a module list means all of its modules. Class ids are the lowercase class names, for example `i1a-informatica` or `mse-cs-ds`. Precalcolo+ keeps its plus as part of the module id, written `B1201%2B` in a URL, so it can be dropped without touching the regular Precalcolo lessons.
- `skip`: parallel groups to hide, as `code@teacher` (or `code@room` when the lesson has no teacher), separated by `,`.
- `academic`: `1` (default) or `0` for the academic calendar events.
- `lang`: `en` (default) or `it` for the event labels.

A selection that no longer matches any lesson (for example after the semester changed) still returns a valid calendar with a single all-day event that asks you to update your selection on the site.

## Development

Requires Node 24 and pnpm.

```sh
pnpm install
pnpm scrape --force   # fetch the timetable into public/data/timetable.json
pnpm dev              # UI at http://localhost:5173
pnpm build && pnpm pages:dev   # UI plus the /api/ics function, like production
pnpm lint && pnpm typecheck && pnpm test
```

Layout:

- `scripts/scrape/` parses the Untis export (`untis.ts`), assembles the JSON (`build.ts`) and runs the fetch (`index.ts`). Fixture pages live in `fixtures/`.
- `src/shared/` is dependency-free logic used by the function and the page: the selection grammar, occurrence expansion, the iCalendar writer and the feed composer.
- `functions/api/ics.ts` is the Cloudflare Pages Function.
- `src/ui/` is the page, a small React app: layout maths for the week grid, course summaries, subscription links and URL state in plain modules with tests, and the components next to them.
- `public/data/academic-calendar.json` holds the DTI academic calendar.

## Updating the academic calendar

Once a year, when DTI publishes the new calendar, edit `public/data/academic-calendar.json`: the semester ranges (with `endFinalYear` for the shorter final-year spring), the holidays and breaks that cancel lessons, and the exam sessions and other dates shown as all-day events. `finalYearClasses` lists the classes in their last semester of the bachelor: the third-year full-time classes and the fourth-year part-time ones, whose lessons sit in the same module series. `pnpm test` checks the file.

## Deploying

The `Deploy` workflow runs on every push to `main`, every three hours, and by hand. It scrapes, commits new data, builds and deploys with `wrangler pages deploy`. It needs two repository secrets: `CLOUDFLARE_API_TOKEN` (Pages edit permission) and `CLOUDFLARE_ACCOUNT_ID`, and a Pages project named `supsi-schedule`.

## Good to know

- Calendar apps refresh subscriptions on their own schedule: Google Calendar roughly every 12 to 24 hours, Apple Calendar according to its refresh setting, Outlook a few times a day. The feed itself is rebuilt on every request.
- The page leads with the calendar app that fits the device: Apple Calendar on iPhone, iPad and Mac, Google Calendar everywhere else, with the other apps one tap away. The Apple button opens a `webcal://` link, the Google button opens Google Calendar's add-by-address page, and the Outlook button opens Outlook on the web for Microsoft 365 accounts (the SUPSI ones). Personal Outlook.com accounts and any device where a button does nothing can copy the link and follow the manual steps listed under "The button did nothing?" on the page.
- Untis truncates course names to about 30 characters and some short class ids; the page and the feed show them as published.
- WebUntis exists for SUPSI but does not allow anonymous access, so the HTML export is the source.
