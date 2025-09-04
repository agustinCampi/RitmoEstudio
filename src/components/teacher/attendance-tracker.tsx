"use client";

import { useState } from 'react';
import type { StudentProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type AttendanceStatus = 'presente' | 'ausente' | 'no-marcado';
type AttendanceState = {
  [studentId: string]: AttendanceStatus;
};

interface AttendanceTrackerProps {
  classId: string;
  students: StudentProfile[];
}

export default function AttendanceTracker({ classId, students }: AttendanceTrackerProps) {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceState>(() => {
    const initialState: AttendanceState = {};
    students.forEach(s => {
      initialState[s.id] = 'no-marcado';
    });
    return initialState;
  });

  const handleMarkAttendance = (studentId: string, studentName: string, status: 'presente' | 'ausente') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
    
    // Simulate API call to Make.com
    console.log('Webhook a Make.com (Registrar Asistencia):', {
      id_clase: classId,
      id_alumno: studentId,
      estado: status,
      fecha: new Date().toISOString(),
    });

    toast({
      title: 'Asistencia registrada',
      description: `${studentName} ha sido marcado como ${status}.`,
    });
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });


  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Lista de Alumnos Inscritos</CardTitle>
        <CardDescription>
            Marca la asistencia para la clase de hoy, {today}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map(student => {
            const status = attendance[student.id];
            return (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} />
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{student.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={status === 'presente' ? 'default' : 'outline'}
                    onClick={() => handleMarkAttendance(student.id, student.name, 'presente')}
                    className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Presente
                  </Button>
                  <Button
                    size="sm"
                    variant={status === 'ausente' ? 'destructive' : 'outline'}
                    onClick={() => handleMarkAttendance(student.id, student.name, 'ausente')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Ausente
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
