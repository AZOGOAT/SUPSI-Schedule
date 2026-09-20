import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cn } from "@/ui/cn";

type ToggleGroupProps = Omit<ToggleGroupPrimitive.Props, "className"> & { className?: string };

/** A row of Toggle children sharing one pressed value, moved with the arrow keys. */
export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return <ToggleGroupPrimitive className={cn("flex", className)} {...props} />;
}
