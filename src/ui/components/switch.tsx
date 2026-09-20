import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/ui/cn";

type SwitchProps = Omit<SwitchPrimitive.Root.Props, "className"> & { className?: string };

/** A 44 by 26 switch: grey track, blue when on, white thumb sliding over 160 ms. */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-[26px] w-11 shrink-0 cursor-pointer items-center rounded-full bg-rule-strong transition-colors duration-160 data-checked:bg-blue-fill motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-[3px] rounded-full bg-white transition-transform duration-160 data-checked:translate-x-[21px] motion-reduce:transition-none" />
    </SwitchPrimitive.Root>
  );
}
