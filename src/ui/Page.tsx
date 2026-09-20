import type { ReactNode } from "react";
import { cn } from "@/ui/cn";
import { Toggle } from "@/ui/components/toggle";
import { ToggleGroup } from "@/ui/components/toggle-group";
import type { Lang } from "../shared/selection";
import { FlagGb, FlagIt } from "./icons";
import type { Strings } from "./strings";

interface PageProps {
  hasBar?: boolean;
  children: ReactNode;
}

/** The centred column every screen sits in, padded for the fixed bar when there is one. */
export function Page({ hasBar = false, children }: PageProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[1280px] px-gutter pb-10",
        hasBar && "pb-[calc(var(--bar-h)+40px)] print:pb-0",
      )}
    >
      {children}
    </div>
  );
}

interface HeaderProps {
  s: Strings;
  lang?: Lang;
  onLang?: (lang: Lang) => void;
}

/** One quiet line: the site name and, when the page is interactive, the language toggle. */
export function Header({ s, lang, onLang }: HeaderProps) {
  return (
    <header className="flex min-h-[52px] items-center justify-between gap-4 border-rule border-b">
      <p className="font-semibold text-s tracking-[-0.005em]">{s.title}</p>
      {lang && onLang && (
        <ToggleGroup
          aria-label={s.language}
          value={[lang]}
          onValueChange={([next]) => next && onLang(next === "it" ? "it" : "en")}
          className="shrink-0 gap-1 print:hidden"
        >
          {(["en", "it"] as const).map((code) => (
            <Toggle
              key={code}
              value={code}
              variant="tab"
              className="min-h-11 min-w-10 gap-[7px] px-1.5 text-faint tracking-[0.02em] hover:text-ink"
            >
              {code === "en" ? <FlagGb /> : <FlagIt />}
              {code.toUpperCase()}
            </Toggle>
          ))}
        </ToggleGroup>
      )}
    </header>
  );
}
