import { useSyncExternalStore } from "react";

/** The desktop breakpoint, the same 1100px as Tailwind's lg in styles.css. */
export const DESKTOP = "(min-width: 68.75rem)";
/** Devices with a pointer that can hover, where tooltips make sense. */
export const CAN_HOVER = "(hover: hover)";

function subscribe(query: string, onChange: () => void): () => void {
  const list = window.matchMedia(query);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

/** Whether a media query matches now, re-rendering when that changes. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => window.matchMedia(query).matches,
  );
}
