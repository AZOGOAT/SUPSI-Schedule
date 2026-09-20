import { Skeleton } from "@/ui/components/skeleton";
import type { Lang } from "../shared/selection";
import { Header, Page } from "./Page";
import { STRINGS } from "./strings";

const COLUMNS = [
  ["mt-8 h-24", "mt-6 h-32"],
  ["mt-2 h-28", "mt-10 h-20"],
  ["mt-8 h-24", "mt-3 h-40"],
  ["mt-2 h-32", "mt-12 h-24"],
  ["mt-8 h-36", "mt-6 h-20"],
];

/** The page's shape while the two JSON files load: header, title and week lines, a five-day grid with a few blocks. */
export function Loading({ lang }: { lang: Lang }) {
  const s = STRINGS[lang];
  return (
    <Page>
      <div data-skeleton="" aria-busy="true">
        <Header s={s} />
        <div className="pt-7 lg:pt-9">
          <Skeleton className="h-12 w-60 md:h-14 md:w-72" />
          <Skeleton className="mt-3 h-4 w-52" />
        </div>
        <Skeleton className="mt-9 h-6 w-72" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        <div className="mt-5 grid grid-cols-5 gap-2 md:mt-6">
          {COLUMNS.map((blocks, column) => (
            <div key={String(column)} className="flex flex-col">
              {blocks.map((block) => (
                <Skeleton key={block} className={block} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
