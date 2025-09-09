
'use client';

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { adminNav, teacherNav, studentNav } from "@/config/nav-config";
import { Logo } from "./logo";
import { UserMenu } from "@/components/user-menu";

export default function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin': return adminNav;
      case 'teacher': return teacherNav;
      case 'student': return studentNav;
      default: return [];
    }
  }

  const navItems = getNavItems();

  const getTitle = () => {
    // Find the nav item that matches the current path
    for (const item of navItems) {
        if (pathname === item.href) {
            return item.title;
        }
    }
    // Handle nested routes like attendance
    if (pathname.startsWith('/dashboard/attendance/')) {
        return 'Tomar Asistencia';
    }
    if (pathname === '/dashboard') {
        // Usar name en lugar de full_name
        return `¡Hola, ${user?.name?.split(' ')[0]}!`;
    }
    return 'RitmoEstudio';
  }


  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 lg:border-0 sticky top-0 bg-background z-30">
       <div className="lg:hidden">
        <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-left"><Logo /></SheetTitle>
                </SheetHeader>
                <nav className="grid gap-2 text-lg font-medium p-4">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                      href={item.href}
                      className={cn(
                          "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground",
                          pathname === item.href && "bg-muted text-foreground"
                      )}
                      >
                      {item.icon}
                      {item.title}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
            </SheetContent>
            </Sheet>
       </div>

        <div className="w-full flex-1">
           <h1 className="text-lg font-semibold">{getTitle()}</h1>
        </div>

        {/* Añadir el menú de usuario aquí */}
        <UserMenu />
    </header>
  );
}
