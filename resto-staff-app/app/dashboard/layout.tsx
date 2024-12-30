import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed">
        <DashboardNav />
      </div>
      <main className="flex-1 overflow-y-auto ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
