import type { ComponentProps } from "react";
import { cn } from "@/ui/cn";

/** A pulsing surface-coloured placeholder for content still loading. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-surface motion-reduce:animate-none", className)}
      {...props}
    />
  );
}
