import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "text" | "circular" | "rectangular"
}

function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      role="status"
      aria-live="polite"
      className={cn(
        "animate-pulse bg-muted",
        {
          "rounded-md": variant === "text",
          "rounded-full": variant === "circular",
          "rounded-none": variant === "rectangular",
        },
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
