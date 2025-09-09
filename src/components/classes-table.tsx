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
import { Trash, Edit, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteClass } from '@/app/dashboard/classes/actions';
import { useToast } from './ui/use-toast';

type ClassesTableProps = {
  classes: DanceClass[];
};

export default function ClassesTable({ classes }: ClassesTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleEdit = (id: string) => {
    router.push(`/dashboard/classes/${id}/edit`);
  };

  const handleEnroll = (id: string) => {
    router.push(`/dashboard/classes/${id}/enroll`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      const result = await deleteClass(id);
      if (result?.message) {
        toast({
          title: 'Error', // Corregido: Título de error
          description: result.message,
          variant: 'destructive', // Corregido: Variante destructiva para errores
        });
      } else {
        toast({
          title: 'Éxito',
          description: 'Clase eliminada correctamente.',
        });
        // Refrescar para actualizar la lista de clases
        router.refresh(); 
      }
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
                {danceClass.schedule && danceClass.schedule.length > 0 ? (
                  danceClass.schedule.map((time, index) => (
                    <div key={index}>{time}</div>
                  ))
                ) : (
                  <span>-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEnroll(danceClass.id)}>
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(danceClass.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(danceClass.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
