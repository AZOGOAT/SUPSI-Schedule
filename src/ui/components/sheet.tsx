import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { cn } from "@/ui/cn";
import { Button } from "@/ui/components/button";

export type SheetSide = "bottom" | "right";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: SheetSide;
  title: string;
  closeLabel: string;
  /** The element that opened the sheet, focused again once it has closed. */
  opener?: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}

const SIDES: Record<SheetSide, string> = {
  bottom:
    "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t data-closed:slide-out-to-bottom data-open:slide-in-from-bottom",
  right:
    "inset-y-0 right-0 h-full w-full max-w-md border-l data-closed:slide-out-to-right data-open:slide-in-from-right",
};

/** A modal panel sliding in from the bottom on phones or the right on desktop, closed by the scrim, Escape or its button. */
export function Sheet({
  open,
  onOpenChange,
  side,
  title,
  closeLabel,
  opener,
  className,
  children,
}: SheetProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) opener?.current?.focus();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 duration-200 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 motion-reduce:animate-none" />
        <Dialog.Popup
          className={cn(
            "fixed z-50 flex flex-col border-rule bg-paper text-ink outline-none duration-200 ease-out data-closed:animate-out data-open:animate-in motion-reduce:animate-none",
            SIDES[side],
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 px-gutter pt-3 pb-1">
            <Dialog.Title className="pt-2 font-semibold text-m leading-tight">{title}</Dialog.Title>
            <Dialog.Close
              render={
                <Button variant="ghost" size="icon" aria-label={closeLabel} className="-mr-2" />
              }
            >
              <X aria-hidden="true" size={22} />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-gutter pb-[max(20px,env(safe-area-inset-bottom))] [scrollbar-color:var(--rule-strong)_transparent] [scrollbar-width:thin]">
            {children}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
