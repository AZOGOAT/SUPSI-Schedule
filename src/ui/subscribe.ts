import { formatSelection, type Selection } from "../shared/selection";

export type Platform = "apple" | "google";

/** The selection as the feed needs it: classes with nothing chosen add nothing, so they are left out. */
export function feedSelection(selection: Selection): Selection {
  return {
    ...selection,
    classes: selection.classes.filter((c) => c.modules === null || c.modules.length > 0),
  };
}

export function feedUrl(origin: string, selection: Selection): string {
  return `${origin}/api/ics?${formatSelection(feedSelection(selection))}`;
}

/** webcal:// makes Apple Calendar open its subscribe sheet directly. */
export function webcalUrl(feed: string): string {
  return feed.replace(/^https?:\/\//, "webcal://");
}

/** Google Calendar's add-by-address link takes the webcal form of the feed. */
export function googleUrl(feed: string): string {
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl(feed))}`;
}

/** Outlook on the web for Microsoft 365 accounts, which is what SUPSI issues to students. */
export function outlookUrl(feed: string, name: string): string {
  return `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(webcalUrl(feed))}&name=${encodeURIComponent(name)}`;
}

/** The calendar app to lead with: Apple's on iPhone, iPad and Mac, Google's everywhere else. */
export function primaryPlatform(userAgent: string): Platform {
  return /iPhone|iPad|iPod|Macintosh/.test(userAgent) ? "apple" : "google";
}
