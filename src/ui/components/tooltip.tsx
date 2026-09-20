import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/ui/cn";

/** Groups tooltips so moving between triggers shows the next one at once. */
export function TooltipProvider({ delay = 400, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

export function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger {...props} />;
}

type ContentProps = Omit<TooltipPrimitive.Popup.Props, "className"> & {
  className?: string;
  side?: TooltipPrimitive.Positioner.Props["side"];
};

/** The ink panel with the details of a lesson, above its trigger by default. */
export function TooltipContent({ className, side = "top", children, ...props }: ContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} sideOffset={6} className="z-50">
        <TooltipPrimitive.Popup
          className={cn(
            "max-w-64 rounded-sm bg-ink px-3 py-2 text-paper text-xs leading-[1.35]",
            className,
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}
