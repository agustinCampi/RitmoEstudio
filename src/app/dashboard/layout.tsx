
"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { adminNav, teacherNav, studentNav } from "@/config/nav-config";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  let navItems: { title: string; href: string; icon: React.ReactNode }[] = [];

  if (user?.role === 'admin') {
    navItems = adminNav;
  } else if (user?.role === 'teacher') {
    navItems = teacherNav;
  } else if (user?.role === 'student') {
    navItems = studentNav;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardNav items={navItems} />
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
