import academicCalendar from "../../public/data/academic-calendar.json";
import timetableData from "../../public/data/timetable.json";
import { UnknownClassError } from "../../src/shared/events";
import { buildFeed } from "../../src/shared/feed";
import { parseSelection, SelectionError } from "../../src/shared/selection";
import type { AcademicCalendar, Timetable } from "../../src/shared/types";

/** Answers a feed request from the given data; 400 with a plain reason when the query is unusable. */
export async function handleFeedRequest(
  request: Request,
  timetable: Timetable,
  calendar: AcademicCalendar,
): Promise<Response> {
  const url = new URL(request.url);
  try {
    const selection = parseSelection(url.searchParams);
    const body = buildFeed({ timetable, calendar, selection, siteUrl: `${url.origin}/` });
    const first = selection.classes[0];
    if (!first) throw new SelectionError("missing sel parameter");
    return new Response(body, {
      headers: {
        "content-type": "text/calendar; charset=utf-8",
        "cache-control": "public, max-age=3600, s-maxage=21600",
        "content-disposition": `inline; filename="supsi-${first.classId}.ics"`,
      },
    });
  } catch (error) {
    if (error instanceof SelectionError || error instanceof UnknownClassError) {
      return new Response(error.message, {
        status: 400,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    throw error;
  }
}

export function onRequestGet({ request }: { request: Request }): Promise<Response> {
  return handleFeedRequest(request, timetableData, academicCalendar);
}
