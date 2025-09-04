
"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "@/components/dashboard-header";
import ClassManagement from "@/components/admin/class-management";
import ClassCatalog from "@/components/student/class-catalog";

const roleSpecifics = {
    admin: {
        title: "Gestionar Clases",
        Component: ClassManagement,
    },
    teacher: {
        title: "Catálogo de Clases",
        Component: ClassCatalog,
    },
    student: {
        title: "Catálogo de Clases",
        Component: ClassCatalog,
    }
}

export default function ClassesPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const { title, Component } = roleSpecifics[user.role];

  return (
    <div className="w-full">
      <DashboardHeader title={title} />
      <div className="px-4 sm:px-0">
        <Component />
      </div>
    </div>
  );
}
