
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { useAuth } from '@/hooks/use-auth';
import { adminNav, teacherNav, studentNav } from '@/config/nav-config';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getNavItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return adminNav;
      case 'teacher':
        return teacherNav;
      case 'student':
        return studentNav;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="hidden border-r bg-muted/40 lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Logo />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href && 'bg-muted text-primary'
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
