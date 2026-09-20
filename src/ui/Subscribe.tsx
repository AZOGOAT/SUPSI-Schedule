import { Check, CircleHelp, Copy } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Button, type ButtonProps } from "@/ui/components/button";
import { Switch } from "@/ui/components/switch";
import type { Selection } from "../shared/selection";
import type { Actions } from "./actions";
import { RailTitle } from "./Courses";
import { AppleMark, GoogleMark, OutlookMark } from "./icons";
import { fill, type Guide, type Strings } from "./strings";
import { googleUrl, outlookUrl, type Platform, webcalUrl } from "./subscribe";

/** One calendar app the feed can be added to, with its link and mark. */
export interface Target {
  key: "apple" | "google" | "outlook";
  label: string;
  href: string;
  external: boolean;
  icon: ReactNode;
}

export interface Targets {
  primary: Target;
  others: Target[];
}

/** The calendar apps in the order to offer them: the device's own first, the rest behind it. */
export function calendarTargets(
  platform: Platform,
  feed: string,
  name: string,
  s: Strings,
): Targets {
  const apple: Target = {
    key: "apple",
    label: fill(s.addTo, { app: s.apps.apple }),
    href: webcalUrl(feed),
    external: false,
    icon: <AppleMark />,
  };
  const google: Target = {
    key: "google",
    label: fill(s.addTo, { app: s.apps.google }),
    href: googleUrl(feed),
    external: true,
    icon: <GoogleMark />,
  };
  const outlook: Target = {
    key: "outlook",
    label: fill(s.addTo, { app: s.apps.outlook }),
    href: outlookUrl(feed, name),
    external: true,
    icon: <OutlookMark />,
  };
  return platform === "apple"
    ? { primary: apple, others: [google, outlook] }
    : { primary: google, others: [outlook] };
}

type LinkProps = { target: Target } & Omit<ButtonProps, "render" | "nativeButton" | "children">;

/** A calendar app's link with a button's look; web apps open in a new tab. */
export function TargetLink({ target, ...props }: LinkProps) {
  return (
    <Button
      nativeButton={false}
      render={
        <a
          href={target.href}
          target={target.external ? "_blank" : undefined}
          rel={target.external ? "noopener" : undefined}
        />
      }
      {...props}
    >
      {target.icon}
      {target.label}
    </Button>
  );
}

type CopyProps = { copied: boolean; s: Strings; actions: Actions } & Omit<
  ButtonProps,
  "onClick" | "children"
>;

/** Copies the feed link and says so for two seconds. */
export function CopyButton({ copied, s, actions, ...props }: CopyProps) {
  const size = props.size === "sm" ? 16 : 18;
  return (
    <Button aria-live="polite" onClick={() => actions.copyLink()} {...props}>
      {copied ? <Check aria-hidden="true" size={size} /> : <Copy aria-hidden="true" size={size} />}
      {copied ? s.copied : s.copy}
    </Button>
  );
}

function GuideApp({ guide, icon }: { guide: Guide; icon: ReactNode }) {
  return (
    <div className="mt-5 border-rule border-t pt-3.5">
      <h4 className="mb-1 flex items-center gap-2 font-semibold text-ink text-s">
        {icon}
        {guide.title}
      </h4>
      {guide.sections.map((section) => (
        <div key={section.where}>
          <p className="mt-2 mb-1 text-faint text-xs">{section.where}</p>
          <ol className="grid list-decimal gap-1 pl-[22px] marker:text-faint">
            {section.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

interface GuideProps {
  copied: boolean;
  s: Strings;
  actions: Actions;
}

/** The manual route: copy the link, then the steps for each calendar app. */
export function GuideContent({ copied, s, actions }: GuideProps) {
  return (
    <div className="max-w-[60ch] text-muted text-s">
      <p className="mb-3">{s.guideIntro}</p>
      <CopyButton variant="outline" size="sm" copied={copied} s={s} actions={actions} />
      <GuideApp guide={s.guideApple} icon={<AppleMark />} />
      <GuideApp guide={s.guideGoogle} icon={<GoogleMark />} />
      <GuideApp guide={s.guideOutlook} icon={<OutlookMark />} />
    </div>
  );
}

interface DetailsProps {
  selection: Selection;
  usable: boolean;
  s: Strings;
  actions: Actions;
  onOpenGuide?: () => void;
}

/** Step 3 in the page flow: the holidays switch, what happens next, and the way to the manual route. */
export function SubscribeDetails({ selection, usable, s, actions, onOpenGuide }: DetailsProps) {
  const id = useId();
  return (
    <section className="print:hidden">
      <RailTitle>{s.step3}</RailTitle>
      <label htmlFor={id} className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-s">
        <Switch
          id={id}
          nativeButton
          render={<button type="button" />}
          checked={selection.academic}
          onCheckedChange={() => actions.toggleAcademic()}
        />
        <span>{s.academic}</span>
      </label>
      <p className="mt-1 mb-3.5 max-w-[58ch] text-muted text-s">
        {usable ? s.afterHint : s.nothingSelected}
      </p>
      {usable && onOpenGuide && (
        <Button variant="link" onClick={onOpenGuide}>
          <CircleHelp aria-hidden="true" size={18} />
          {s.guideSummary}
        </Button>
      )}
    </section>
  );
}

interface BarProps {
  targets: Targets;
  feed: string;
  name: string;
  count: string;
  countOf: string;
  copied: boolean;
  linkShown: boolean;
  s: Strings;
  actions: Actions;
  onOpenApps: () => void;
  onOpenCourses: () => void;
}

/** The fixed bar: the device's calendar app first; the other apps in a sheet on phones and beside it on desktop. */
export function ActionBar({
  targets,
  feed,
  name,
  count,
  countOf,
  copied,
  linkShown,
  s,
  actions,
  onOpenApps,
  onOpenCourses,
}: BarProps) {
  const { primary, others } = targets;
  return (
    <section
      aria-label={s.step3}
      className="fixed inset-x-0 bottom-0 z-6 border-rule border-t bg-paper pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(5,18,38,0.05)] print:hidden"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-gutter lg:flex-row lg:items-center lg:gap-2.5">
        {linkShown ? (
          <input
            className="hidden min-h-11 min-w-0 flex-1 rounded-md border border-rule-strong bg-surface px-2.5 text-muted text-xs lg:block"
            type="text"
            readOnly
            value={feed}
            aria-label={s.linkLabel}
            onFocus={(event) => event.currentTarget.select()}
          />
        ) : (
          <p className="hidden min-w-0 flex-1 items-baseline gap-2.5 overflow-hidden whitespace-nowrap text-s lg:flex">
            <span className="overflow-hidden text-ellipsis font-semibold">{name}</span>
            <span className="shrink-0 text-muted">{count}</span>
          </p>
        )}
        <div className="hidden gap-2.5 lg:flex">
          {others.map((target) => (
            <TargetLink key={target.key} variant="outline" target={target} />
          ))}
          <CopyButton variant="outline" copied={copied} s={s} actions={actions} />
        </div>
        <div className="flex gap-2 lg:contents">
          <Button
            variant="outline"
            className="shrink-0 flex-col gap-0 px-3 leading-tight lg:hidden"
            onClick={onOpenCourses}
          >
            <span>{s.coursesButton}</span>
            <span className="font-medium text-2xs text-muted">{countOf}</span>
          </Button>
          <TargetLink
            size="lg"
            target={primary}
            className="min-w-0 flex-1 whitespace-normal text-s sm:text-m lg:flex-none lg:whitespace-nowrap"
          />
        </div>
        <Button variant="link" className="self-center py-1.5 lg:hidden" onClick={onOpenApps}>
          {fill(s.notUsing, { app: s.apps[primary.key] })}
        </Button>
      </div>
    </section>
  );
}
