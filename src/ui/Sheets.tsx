import { CircleHelp } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Sheet } from "@/ui/components/sheet";
import type { Actions } from "./actions";
import { DESKTOP, useMediaQuery } from "./media";
import { CopyButton, GuideContent, TargetLink, type Targets } from "./Subscribe";
import type { Strings } from "./strings";

interface SheetState {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opener: RefObject<HTMLElement | null>;
  s: Strings;
}

interface AppsProps extends SheetState {
  targets: Targets;
  name: string;
  count: string;
  feed: string;
  linkShown: boolean;
  copied: boolean;
  actions: Actions;
  onShowGuide: () => void;
}

const ROW = "w-full justify-start rounded-none border-rule border-b px-1";

/** The phone list behind "Not using X?": the other apps, Copy link, and the way to the manual guide. */
export function AppsSheet({
  open,
  onOpenChange,
  opener,
  targets,
  name,
  count,
  feed,
  linkShown,
  copied,
  s,
  actions,
  onShowGuide,
}: AppsProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      opener={opener}
      side="bottom"
      title={s.step3}
      closeLabel={s.close}
    >
      <p className="mb-3 text-muted text-s">
        <span className="font-semibold text-ink">{name}</span>, {count}
      </p>
      {linkShown && (
        <Input
          readOnly
          value={feed}
          aria-label={s.linkLabel}
          onFocus={(event) => event.currentTarget.select()}
          className="mb-3"
        />
      )}
      <div className="flex flex-col border-rule border-t">
        {targets.others.map((target) => (
          <TargetLink key={target.key} variant="ghost" className={ROW} target={target} />
        ))}
        <CopyButton variant="ghost" className={ROW} copied={copied} s={s} actions={actions} />
        <Button variant="ghost" className={ROW} onClick={onShowGuide}>
          <CircleHelp aria-hidden="true" size={18} />
          {s.showHow}
        </Button>
      </div>
    </Sheet>
  );
}

interface GuideProps extends SheetState {
  copied: boolean;
  actions: Actions;
}

/** The manual guide: a bottom sheet on phones, a right-hand sheet on desktop. */
export function GuideSheet({ open, onOpenChange, opener, copied, s, actions }: GuideProps) {
  const desktop = useMediaQuery(DESKTOP);
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      opener={opener}
      side={desktop ? "right" : "bottom"}
      title={s.guideSummary}
      closeLabel={s.close}
    >
      <GuideContent copied={copied} s={s} actions={actions} />
    </Sheet>
  );
}

interface CoursesProps extends SheetState {
  children: ReactNode;
}

/** The phone drawer holding the course lists and the calendar settings that the desktop rail shows. */
export function CoursesSheet({ open, onOpenChange, opener, s, children }: CoursesProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      opener={opener}
      side="bottom"
      title={s.courses}
      closeLabel={s.close}
      className="h-[85dvh]"
    >
      <div className="flex flex-col gap-8 pt-1">{children}</div>
    </Sheet>
  );
}
