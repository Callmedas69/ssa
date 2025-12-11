import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none transition-all duration-150",
  {
    variants: {
      variant: {
        // Mac1 variants (legacy)
        default:
          "bg-white text-black hover:bg-black hover:text-white border-2 border-black",
        destructive:
          "bg-white text-black hover:bg-white hover:text-black border-2 border-black hover:border-[3px] hover:shadow-[inset_0_0_0_1px_black]",
        outline:
          "bg-transparent text-black hover:bg-black hover:text-white border-2 border-black",
        secondary:
          "bg-[#E8E8E8] text-black hover:bg-white hover:border-black border-2 border-[#808080]",
        ghost: "bg-transparent border-0 shadow-none hover:bg-[#E8E8E8]",
        link: "text-black underline-offset-4 hover:underline bg-transparent border-0 shadow-none",
        // Retro variants
        retro:
          "bg-[#E85D3B] text-white border-2 border-[#2D2A26] rounded-lg font-bold uppercase tracking-wide shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] active:translate-y-0 active:shadow-[2px_2px_0_#2D2A26] disabled:bg-[#8B8680] disabled:translate-y-0 disabled:shadow-[2px_2px_0_#2D2A26]",
        "retro-outline":
          "bg-[#F5F0E8] text-[#2D2A26] border-2 border-[#2D2A26] rounded-lg font-bold uppercase tracking-wide shadow-[3px_3px_0_#2D2A26] hover:bg-[#E85D3B] hover:text-white hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26]",
        "retro-ghost":
          "bg-transparent text-[#2D2A26] border-0 shadow-none hover:bg-[#E8E3DB] rounded-lg font-medium",
        "retro-success":
          "bg-[#2A9D8F] text-white border-2 border-[#2D2A26] rounded-lg font-bold uppercase tracking-wide shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "retro",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
