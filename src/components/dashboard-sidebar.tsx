'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, Briefcase, Calendar } from 'lucide-react'; // Import Calendar
import { Logo } from '@/components/logo'; // Corregido
import type { UserRole } from '@/lib/types';

const adminNav = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Alumnos', href: '/dashboard/students', icon: Users },
  { name: 'Clases', href: '/dashboard/classes', icon: BookOpen },
];

const teacherNav = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Mis Clases', href: '/dashboard/my-classes', icon: Briefcase },
  { name: 'Mi Horario', href: '/dashboard/teacher-schedule', icon: Calendar }, // Add new link
];

const studentNav = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Mis Clases', href: '/dashboard/my-classes', icon: BookOpen },
];

const navItems = {
  admin: adminNav,
  teacher: teacherNav,
  student: studentNav,
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();
  const navigation = navItems[userRole] || [];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
        <Logo />
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              pathname === item.href
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )}
          >
            <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
