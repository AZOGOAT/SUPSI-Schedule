import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/ui/cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap font-semibold text-s no-underline transition-colors duration-120 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-md border border-blue-fill bg-blue-fill text-white hover:border-blue-fill-hover hover:bg-blue-fill-hover",
        outline: "rounded-md border border-ink bg-paper text-ink hover:bg-surface",
        ghost: "rounded-md text-ink hover:bg-surface",
        link: "font-medium text-blue underline underline-offset-3 hover:text-blue-deep",
      },
      size: {
        default: "min-h-[50px] gap-2.5 px-[18px]",
        lg: "min-h-[50px] gap-2.5 px-[18px] text-m",
        sm: "min-h-10 gap-1.5 px-3.5 text-xs",
        icon: "size-11",
      },
    },
    compoundVariants: [{ variant: "link", className: "min-h-0 gap-1.5 px-0 py-2" }],
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = Omit<ButtonPrimitive.Props, "className"> &
  VariantProps<typeof buttonVariants> & { className?: string };

/** A button, or a link styled as one through Base UI's render prop with nativeButton off. */
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
