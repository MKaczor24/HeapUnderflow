import React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-neutral-50",
        className,
      )}
      {...props}
    />
  );
}
