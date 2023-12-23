import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// Spacing for left and right side page will always be the same
const MaxWdithWrapper  = ({
    className,
    children
}: {
    className?: string // '?' is optional of type string
    children: ReactNode
}) => { 
    return (
        // Merging what we always want applied by default as first argument and merge it with incoming 'className" where component is being reused.
        <div className={cn('mx-auto w-full max-w-screen-xl px-2.5 md:px-20', className)}>
        {children}
    </div>
    )
}

export default MaxWdithWrapper;