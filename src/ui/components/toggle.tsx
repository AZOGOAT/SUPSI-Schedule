import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/ui/cn";

export const toggleVariants = cva(
  "group inline-flex cursor-pointer items-center transition-[color,background-color,border-color,box-shadow] duration-120 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        tab: "min-h-[46px] gap-[5px] px-3 font-semibold text-muted text-s shadow-[inset_0_-2px_0_transparent] aria-pressed:text-ink aria-pressed:shadow-[inset_0_-2px_0_var(--ink)]",
      },
    },
    defaultVariants: { variant: "tab" },
  },
);

type ToggleProps = Omit<TogglePrimitive.Props, "className"> &
  VariantProps<typeof toggleVariants> & { className?: string };

/** A two-state button drawn as an underlined tab. */
export function Toggle({ className, variant, ...props }: ToggleProps) {
  return <TogglePrimitive className={cn(toggleVariants({ variant }), className)} {...props} />;
}
