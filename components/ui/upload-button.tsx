import * as React from "react"
import { Upload } from "lucide-react"
import { Button } from "./button"
import type { ButtonProps } from "./button"
import { cn } from "@/lib/utils"

interface UploadButtonProps extends Omit<ButtonProps, 'children'> {
    text?: string
  }

const UploadButton = React.forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ text = "Upload", className, ...props }, ref) => {
    return (
      <Button
        variant="secondary"
        className={cn(
            "bg-gray-300 hover:bg-gray-400 text-black px-3 py-1.5 h-9 text-sm",
            className
          )}
        ref={ref}
        {...props}
      >
        <Upload className="w-4 h-4 mr-2" />
        <span>{text}</span>
      </Button>
    )
  }
)
UploadButton.displayName = "UploadButton"

export { UploadButton }
