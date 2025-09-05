
import { LayoutGrid, Calendar, Users, Book, ClipboardCheck } from 'lucide-react';

export const adminNav = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
  { title: 'Clases', href: '/dashboard/classes', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Alumnos', href: '/dashboard/students', icon: <Users className="h-4 w-4" /> },
  { title: 'Profesores', href: '/dashboard/teachers', icon: <Users className="h-4 w-4" /> },
];

export const teacherNav = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
  { title: 'Clases Asignadas', href: '/dashboard/assigned-classes', icon: <ClipboardCheck className="h-4 w-4" /> },
];

export const studentNav = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
  { title: 'Catálogo de Clases', href: '/dashboard/classes', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Mis Clases', href: '/dashboard/my-classes', icon: <Book className="h-4 w-4" /> },
];

    