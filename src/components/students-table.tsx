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
import { Trash, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteStudent } from '@/app/dashboard/students/actions';
import { useToast } from './ui/use-toast';

type StudentsTableProps = {
  students: User[];
};

export default function StudentsTable({ students }: StudentsTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleEdit = (id: string) => {
    router.push(`/dashboard/students/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este alumno?')) {
      const result = await deleteStudent(id);
      if (result?.message) {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: 'Alumno eliminado correctamente.',
        });
      }
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
                <Button variant="ghost" size="icon" onClick={() => handleEdit(student.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
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
