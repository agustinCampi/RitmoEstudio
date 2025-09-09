'use client';

import { type User } from '@/lib/types';
import { enrollStudent, unenrollStudent } from '../actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast'; // Corregido a la ruta correcta
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EnrollClientPageProps {
  classId: string;
  allStudents: User[];
  enrolledStudents: User[];
}

export default function EnrollClientPage({ classId, allStudents, enrolledStudents }: EnrollClientPageProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  
  const enrolledStudentIds = new Set(enrolledStudents.map(s => s.id));

  const handleEnroll = (studentId: string) => {
    startTransition(async () => {
      const result = await enrollStudent(classId, studentId);
      if (result?.success) {
        toast({ title: 'Éxito', description: 'Alumno inscrito correctamente.' });
      } else {
        toast({ title: 'Error', description: result.message || 'No se pudo inscribir al alumno.', variant: 'destructive' });
      }
    });
  };

  const handleUnenroll = (studentId: string) => {
    startTransition(async () => {
      const result = await unenrollStudent(classId, studentId);
      if (result?.success) {
        toast({ title: 'Éxito', description: 'Alumno desinscrito correctamente.' });
      } else {
        toast({ title: 'Error', description: result.message || 'No se pudo desinscribir al alumno.', variant: 'destructive' });
      }
    });
  };

  const filteredStudents = allStudents.filter(student => 
    (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Buscar alumno por email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map(student => {
              const isEnrolled = enrolledStudentIds.has(student.id);
              return (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.user_metadata?.full_name || student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isEnrolled ? (
                      <Button onClick={() => handleUnenroll(student.id)} disabled={isPending} variant="outline">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Desinscribir'}
                      </Button>
                    ) : (
                      <Button onClick={() => handleEnroll(student.id)} disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Inscribir'}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
