import { Input as InputPrimitive } from "@base-ui/react/input";
import type { ComponentProps } from "react";
import { cn } from "@/ui/cn";

/** A text field in the palette; a read-only one sits on the surface colour in the small size. */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <InputPrimitive
      className={cn(
        "min-h-11 w-full min-w-0 rounded-md border border-rule-strong bg-paper px-2.5 text-s text-ink read-only:bg-surface read-only:text-muted read-only:text-xs",
        className,
      )}
      {...props}
    />
  );
}
