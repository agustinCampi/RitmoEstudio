import { Home, Users, ClipboardList, Settings, User } from 'lucide-react';

export const navItems = [
  {
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />,
    label: 'Dashboard',
  },
  {
    href: '/dashboard/classes',
    icon: <ClipboardList className="h-4 w-4" />,
    label: 'Clases',
  },
  {
    href: '/dashboard/students',
    icon: <Users className="h-4 w-4" />,
    label: 'Alumnos',
  },
  {
    href: '/dashboard/teachers',
    icon: <User className="h-4 w-4" />,
    label: 'Profesores',
  },
  {
    href: '/dashboard/settings',
    icon: <Settings className="h-4 w-4" />,
    label: 'Configuración',
  },
];
