/** Untis prefixes exercise and lab names with "Es.", "Ex." or "Lab."; the kind is shown separately. */
export function baseName(name: string): string {
  const stripped = name.replace(/^(Es\.|Ex\.|Lab\.)\s*/, "");
  if (stripped === name) return name;
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}
