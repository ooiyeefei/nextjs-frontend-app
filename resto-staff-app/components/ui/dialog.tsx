import * as React from "react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onOpenChange.bind(null, false)}>
        <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]">
          <div onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      </div>
    )
  }

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

export function DialogContent({ className, children }: DialogContentProps) {
    return (
      <div className={`bg-background rounded-lg shadow-lg p-6 w-full max-w-md ${className}`}
      onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    )
  }

interface DialogHeaderProps {
  children: React.ReactNode
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="dialog-header">{children}</div>
}

interface DialogTitleProps {
  children: React.ReactNode
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="dialog-title">{children}</h2>
}

interface DialogDescriptionProps {
  children: React.ReactNode
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={`flex justify-between items-center px-8 space-x-3 ${className || ''}`}>
      {children}
    </div>
  )
}