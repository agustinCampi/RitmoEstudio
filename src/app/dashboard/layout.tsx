
"use client";

import DashboardSidebar from "@/components/dashboard-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[56px_1fr] lg:grid-cols-[56px_1fr]">
      <DashboardSidebar />
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

    