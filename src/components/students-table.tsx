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
import { Trash, Edit, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteStudent } from '@/app/dashboard/students/actions';
import { useToast } from './ui/use-toast';
import { useState, useTransition } from 'react';

type StudentsTableProps = {
  students: User[];
};

export default function StudentsTable({ students }: StudentsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (id: string) => {
    router.push(`/dashboard/students/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este alumno?')) {
      setIsDeleting(id);
      startTransition(async () => {
        const result = await deleteStudent(id);
        if (!result.success) {
          toast({
            title: 'Error',
            description: result.message || 'No se pudo eliminar al alumno.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Éxito',
            description: 'Alumno eliminado correctamente.',
          });
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
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(student.id)} disabled={isPending}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)} disabled={isPending || isDeleting === student.id}>
                  {isDeleting === student.id ? (
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
  );
}
