import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: { theme: { text: ["2xs", "xs", "s", "m", "l", "xl", "hero"] } },
});

/** Joins class lists; a later Tailwind utility replaces an earlier one of the same kind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
