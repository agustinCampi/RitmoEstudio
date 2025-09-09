'use client';

import { type User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash, Edit, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteTeacher } from '@/app/dashboard/teachers/actions';
import { useToast } from '@/components/ui/toast'; // Corregido a la ruta correcta
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

type TeachersTableProps = {
  teachers: User[];
};

export default function TeachersTable({ teachers }: TeachersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    router.push('/dashboard/teachers/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/teachers/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
        setIsDeleting(id); // Show spinner on the specific row
        startTransition(async () => {
            const result = await deleteTeacher(id);
            if (!result.success) {
                toast({
                title: 'Error',
                description: result.message || 'No se pudo eliminar al profesor.',
                variant: 'destructive',
                });
            } else {
                toast({
                title: 'Éxito',
                description: 'Profesor eliminado correctamente.',
                });
                // No es necesario un router.refresh() aquí si la acción revalida el path
            }
            setIsDeleting(null); // Hide spinner
        });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Profesor
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                {/* Corregido: Usar user_metadata.full_name */}
                <TableCell className="font-medium">{teacher.user_metadata?.full_name || 'Nombre no disponible'}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(teacher.id)} disabled={isPending}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)} disabled={isPending || isDeleting === teacher.id}>
                    {isDeleting === teacher.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
