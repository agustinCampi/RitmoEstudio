'use client';

import type { DanceClass } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash, Edit, UserPlus, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteClass } from '@/app/dashboard/classes/actions';
import { useToast } from './ui/use-toast';
import { useState, useTransition } from 'react';

type ClassesTableProps = {
  classes: DanceClass[];
  userRole: string; 
};

export default function ClassesTable({ classes, userRole }: ClassesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (id: string) => {
    router.push(`/dashboard/classes/${id}/edit`);
  };

  const handleEnroll = (id: string) => {
    // Este es el flujo de auto-inscripción del alumno.
    router.push(`/dashboard/classes/${id}/enroll`);
  };

  const handleManageRoster = (id: string) => {
    // CORRECCIÓN: Este es el flujo de gestión del admin, ahora apunta a la nueva ruta.
    router.push(`/dashboard/classes/${id}/manage-roster`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      setIsDeleting(id);
      startTransition(async () => {
        const result = await deleteClass(id);
        if (!result.success) {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        } else {
          toast({ title: 'Éxito', description: 'Clase eliminada.' });
        }
        setIsDeleting(null);
      });
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Horarios</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((danceClass) => (
            <TableRow key={danceClass.id}>
              <TableCell className="font-medium">{danceClass.name}</TableCell>
              <TableCell>
                {danceClass.schedule?.join(', ') || '-'}
              </TableCell>
              <TableCell className="text-right">
                {userRole === 'student' && (
                  <Button variant="outline" size="sm" onClick={() => handleEnroll(danceClass.id)} disabled={isPending}>
                    <UserPlus className="mr-2 h-4 w-4" /> Inscribirse
                  </Button>
                )}
                {userRole === 'admin' && (
                  <>
                    {/* CORRECCIÓN: Botón para gestionar la lista de alumnos */}
                    <Button variant="ghost" size="icon" onClick={() => handleManageRoster(danceClass.id)} disabled={isPending}>
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(danceClass.id)} disabled={isPending}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(danceClass.id)} disabled={isPending || isDeleting === danceClass.id}>
                      {isDeleting === danceClass.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
