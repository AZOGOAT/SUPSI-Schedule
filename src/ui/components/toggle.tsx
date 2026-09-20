import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/ui/cn";

export const toggleVariants = cva(
  "group inline-flex cursor-pointer items-center transition-[color,background-color,border-color,box-shadow] duration-120 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        chip: "relative min-h-8 overflow-hidden rounded-sm border border-tint-edge bg-tint pr-2.5 pl-3 font-medium text-ink text-xs before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-blue hover:bg-tint-strong aria-[pressed=false]:border-dashed aria-[pressed=false]:border-rule-strong aria-[pressed=false]:bg-paper aria-[pressed=false]:text-muted aria-[pressed=false]:line-through aria-[pressed=false]:decoration-faint aria-[pressed=false]:before:hidden aria-[pressed=false]:hover:bg-surface",
        tab: "min-h-[46px] gap-[5px] px-3 font-semibold text-muted text-s shadow-[inset_0_-2px_0_transparent] aria-pressed:text-ink aria-pressed:shadow-[inset_0_-2px_0_var(--ink)]",
      },
    },
    defaultVariants: { variant: "chip" },
  },
);

type ToggleProps = Omit<TogglePrimitive.Props, "className"> &
  VariantProps<typeof toggleVariants> & { className?: string };

/** A two-state button: a chip styled like a lesson block, or an underlined tab. */
export function Toggle({ className, variant, ...props }: ToggleProps) {
  return <TogglePrimitive className={cn(toggleVariants({ variant }), className)} {...props} />;
}
