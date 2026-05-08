import { forwardRef } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const Spinner = forwardRef<SVGSVGElement, React.ComponentProps<"svg">>(
  ({ className, ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        data-icon="inline-start"
        className={cn("animate-spin", className)}
        {...props}
      />
    )
  }
)

Spinner.displayName = "Spinner"

export { Spinner }
