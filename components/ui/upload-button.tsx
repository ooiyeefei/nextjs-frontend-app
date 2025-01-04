import * as React from "react"
import { Upload } from "lucide-react"
import { Button } from "./button"
import type { ButtonProps } from "./button"

interface UploadButtonProps extends Omit<ButtonProps, 'variant'> {
  text?: string
}

const UploadButton = React.forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ text = "Upload files", className, ...props }, ref) => {
    return (
      <Button
        variant="outline"
        className={className}
        ref={ref}
        {...props}
      >
        <Upload className="w-5 h-5 mr-2" />
        <span>{text}</span>
      </Button>
    )
  }
)
UploadButton.displayName = "UploadButton"

export { UploadButton }
