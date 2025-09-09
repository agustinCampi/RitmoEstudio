
import React from 'react';
import { LayoutGrid, Calendar, Users, Book, ClipboardCheck, User as UserIcon } from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactElement;
}

export const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutGrid /> },
  { label: 'Clases', href: '/dashboard/classes', icon: <Calendar /> },
  { label: 'Alumnos', href: '/dashboard/students', icon: <Users /> },
  { label: 'Profesores', href: '/dashboard/teachers', icon: <UserIcon /> },
];

export const teacherNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutGrid /> },
  { label: 'Clases Asignadas', href: '/dashboard/assigned-classes', icon: <ClipboardCheck /> },
  { label: 'Mi Calendario', href: '/dashboard/calendar', icon: <Calendar /> },
];

export const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutGrid /> },
  { label: 'Catálogo de Clases', href: '/dashboard/classes', icon: <Calendar /> },
  { label: 'Mis Clases', href: '/dashboard/my-classes', icon: <Book /> },
];
