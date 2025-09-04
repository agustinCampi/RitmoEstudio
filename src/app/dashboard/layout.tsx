"use client";

import { ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
