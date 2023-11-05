"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// NOTE - Type for indicator color. 'ComponentPropsWithoutRef' is used because the ref is decleared seperately from 'React.ElementRef<typeof ProgressPrimitive.Root>' below. Generic base interface of '<typeof ProgressPrimitive.Root' will be extended with "&" and the custom object with {} with custom prop in the component which is 'indicatorColor' built.
// NOTE - The "?:" for TypeScript means it'll be optional 
type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  indicatorColor?: string
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  // NOTE - Took this base ComponentProps from prev lines above and resued it and extended it with custom object and custom prop, indicatorColor.

  // // React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>

  ProgressProps // declared the type so only need to called the varibale and not the whole thing like above that's crossed.

  // Added new property, 'indicatorColor' to have it change to green when upload is complete. Can change it from any component when calling the 'progress' component
>(({ className, value, indicatorColor, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      // className="h-full w-full flex-1 bg-primary transition-all"

      // NOTE - Custom className with 'cn' made prev from src\lib\utils.ts implemented below.
      // NOTE - Passing in any 'indicatorColor' will overwrite the styles but nothing passed will leave it default
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all",
        indicatorColor
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
