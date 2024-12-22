import { cn } from "@/lib/utils"
import { DashboardNav } from "./dashboard-nav"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <DashboardNav />
      <main className={cn("flex w-full flex-col overflow-hidden", className)} {...props}>
        <div className="container flex-1 space-y-4 p-8 pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}

