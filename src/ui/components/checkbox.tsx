import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import { cn } from "@/ui/cn";

type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, "className"> & { className?: string };

/** A 20px checkbox that fills with the blue when checked. */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-rule-strong bg-paper text-white transition-colors duration-120 data-checked:border-blue-fill data-checked:bg-blue-fill motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex">
        <Check aria-hidden="true" size={14} strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
