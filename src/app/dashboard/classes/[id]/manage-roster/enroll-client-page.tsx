'use client';

import { useState, useTransition } from 'react';
import { type User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast'; // Corregido
import { Loader2 } from 'lucide-react';

type EnrollClientPageProps = {
  classId: string;
  allStudents: User[];
  enrolledStudentIds: Set<string>;
  enrollAction: (classId: string, studentId: string) => Promise<any>;
  unenrollAction: (classId: string, studentId: string) => Promise<any>;
};

export default function EnrollClientPage({
  classId,
  allStudents,
  enrolledStudentIds,
  enrollAction,
  unenrollAction,
}: EnrollClientPageProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  // We need to manage the enrolled state on the client to provide instant feedback
  const [enrolledIds, setEnrolledIds] = useState(enrolledStudentIds);

  const handleEnrollmentChange = (studentId: string, isEnrolled: boolean) => {
    startTransition(async () => {
      const action = isEnrolled ? unenrollAction : enrollAction;
      const result = await action(classId, studentId);

      if (result?.success) {
        toast({
          title: 'Éxito',
          description: `Alumno ${isEnrolled ? 'dado de baja' : 'inscrito'} correctamente.`,
        });
        // Update client state for instant feedback
        setEnrolledIds(prev => {
            const newSet = new Set(prev);
            if (isEnrolled) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
      } else {
        toast({
          title: 'Error',
          description: result?.message || 'Ocurrió un error inesperado.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {allStudents.map((student) => {
        const isEnrolled = enrolledIds.has(student.id);
        return (
          <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
            <Button
              onClick={() => handleEnrollmentChange(student.id, isEnrolled)}
              disabled={isPending}
              variant={isEnrolled ? 'outline' : 'default'}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEnrolled ? 'Dar de Baja' : 'Inscribir'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
