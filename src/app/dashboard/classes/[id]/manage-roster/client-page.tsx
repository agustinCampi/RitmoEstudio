
'use client';

import { type User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useState, useTransition, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EnrollClientPageProps {
  classId: string;
  allStudents: User[];
  enrolledStudents: string[]; // Pass array of IDs
  enrollAction: (classId: string, studentId: string) => Promise<any>;
  unenrollAction: (classId: string, studentId: string) => Promise<any>;
}

export default function EnrollClientPage({ 
  classId, 
  allStudents, 
  enrolledStudents,
  enrollAction,
  unenrollAction,
}: EnrollClientPageProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use local state to manage enrolled students for immediate UI feedback
  const [enrolledIds, setEnrolledIds] = useState(() => new Set(enrolledStudents));

  const handleEnroll = (studentId: string) => {
    startTransition(async () => {
      const result = await enrollAction(classId, studentId);
      if (result?.success) {
        toast({ title: 'Éxito', description: 'Alumno inscrito correctamente.' });
        setEnrolledIds(prev => new Set(prev).add(studentId));
      } else {
        toast({ title: 'Error', description: result.message || 'No se pudo inscribir al alumno.', variant: 'destructive' });
      }
    });
  };

  const handleUnenroll = (studentId: string) => {
    startTransition(async () => {
      const result = await unenrollAction(classId, studentId);
      if (result?.success) {
        toast({ title: 'Éxito', description: 'Alumno desinscrito correctamente.' });
        setEnrolledIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(studentId);
            return newSet;
        });
      } else {
        toast({ title: 'Error', description: result.message || 'No se pudo desinscribir al alumno.', variant: 'destructive' });
      }
    });
  };

  const filteredStudents = useMemo(() => 
    allStudents.filter(student => 
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ), [allStudents, searchTerm]);

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Buscar alumno por nombre o email..."
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
              const isEnrolled = enrolledIds.has(student.id);
              return (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name || student.email}</td>
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
