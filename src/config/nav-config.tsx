
import { Home, Users, Calendar, Book, Settings, LayoutGrid } from 'lucide-react';

export const adminNav = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
  { title: 'Clases', href: '/dashboard/classes', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Alumnos', href: '/dashboard/students', icon: <Users className="h-4 w-4" /> },
  { title: 'Profesores', href: '/dashboard/teachers', icon: <Users className="h-4 w-4" /> },
  { title: 'Reservas', href: '/dashboard/bookings', icon: <Book className="h-4 w-4" /> },
  { title: 'Ajustes', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
];

export const teacherNav = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
  { title: 'Mis Clases', href: '/dashboard/assigned-classes', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Mi Perfil', href: '/dashboard/profile', icon: <Users className="h-4 w-4" /> },
];

export const studentNav = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
  { title: 'Explorar Clases', href: '/dashboard/classes', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Mis Reservas', href: '/dashboard/my-bookings', icon: <Book className="h-4 w-4" /> },
  { title: 'Mi Perfil', href: '/dashboard/profile', icon: <Settings className="h-4 w-4" /> },
];
