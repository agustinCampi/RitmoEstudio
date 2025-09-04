
"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MOCK_STUDENTS_PROFILES } from '@/lib/mock-data';
import type { StudentProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, MoreHorizontal, Trash2, CalendarDays, BookUser, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const studentSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  email: z.string().email("El email no es válido."),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function StudentManagement() {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS_PROFILES);
  const [isFormOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', email: '' },
  });
  
  const onSubmit = (data: StudentFormValues) => {
    const newStudent: StudentProfile = {
      id: `usr_student_${Date.now()}`,
      ...data,
      role: 'student',
      joinedDate: new Date(),
      bookedClasses: 0,
    };
    console.log('Webhook a Make.com (Añadir Alumno):', newStudent);
    setStudents([newStudent, ...students]);
    toast({ title: "Alumno añadido", description: `${data.name} ha sido añadido al sistema.` });
    setFormOpen(false);
    form.reset();
  };

  const handleDelete = (studentId: string) => {
    console.log('Webhook a Make.com (Eliminar Alumno):', { id: studentId });
    setStudents(students.filter(s => s.id !== studentId));
    toast({ title: "Alumno eliminado", variant: "destructive" });
  };
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, students]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="font-headline text-2xl font-bold">Lista de Alumnos</h2>
          <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                  <Button><PlusCircle className="mr-2 h-4 w-4" /> Añadir Alumno</Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Añadir Nuevo Alumno</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                      <div>
                          <Label htmlFor="name">Nombre Completo</Label>
                          <Input id="name" {...form.register('name')} />
                          {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
                      </div>
                      <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" {...form.register('email')} />
                          {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
                      </div>
                      <DialogFooter>
                          <Button type="submit">Añadir Alumno</Button>
                      </DialogFooter>
                  </form>
              </DialogContent>
          </Dialog>
      </div>

       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

       {filteredStudents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStudents.map((student) => (
                <Card key={student.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                     <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription className="truncate">{student.email}</CardDescription>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500">
                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará el perfil del alumno permanentemente.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>Miembro desde el {format(student.joinedDate, "d/MM/yy", { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <BookUser className="h-4 w-4" />
                        <span>{student.bookedClasses} clases reservadas</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
        ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="font-headline text-2xl font-bold">No se encontraron alumnos</h3>
                <p className="text-muted-foreground mt-2">Prueba con otro término de búsqueda.</p>
            </div>
        )}
    </div>
  );
}
