'use client';

import { useState, useTransition } from 'react';
import { type User } from '@/lib/types';
import { saveAttendance, type AttendanceStatus } from '@/app/dashboard/attendance/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AttendanceTrackerProps {
  classId: string;
  students: User[];
}

const getCurrentDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function AttendanceTracker({ classId, students }: AttendanceTrackerProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  
  // Para saber qué botón específico está cargando
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);

  const handleSetAttendance = (studentId: string, status: AttendanceStatus) => {
    setLoadingStudentId(studentId);
    startTransition(async () => {
      const result = await saveAttendance({
        classId: classId,
        studentId: studentId,
        status: status,
        date: getCurrentDateString(),
      });

      if (result.success) {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
        toast({
          title: 'Éxito',
          description: `Asistencia guardada.`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo guardar la asistencia.',
          variant: 'destructive',
        });
      }
      setLoadingStudentId(null);
    });
  };

  if (students.length === 0) {
    return <p className="text-center text-muted-foreground">No hay alumnos inscritos en esta clase.</p>;
  }

  return (
    <div className="space-y-4">
      {students.map(student => {
        const studentIsLoading = isPending && loadingStudentId === student.id;
        return (
          <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <span className="font-medium">{student.name || 'Nombre no disponible'}</span>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSetAttendance(student.id, 'present')}
                disabled={studentIsLoading}
                variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
              >
                {studentIsLoading && attendance[student.id] !== 'present' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Presente
              </Button>
              <Button
                onClick={() => handleSetAttendance(student.id, 'absent')}
                disabled={studentIsLoading}
                variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'}
              >
                {studentIsLoading && attendance[student.id] !== 'absent' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Ausente
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
