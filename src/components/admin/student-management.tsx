
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/supabase';
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
  DialogClose,
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
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function StudentManagement() {
  const { toast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  
  useEffect(() => {
    const fetchStudents = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('users').select('*').eq('role', 'student');
        if (error) {
            toast({ title: "Error", description: "No se pudieron cargar los alumnos.", variant: "destructive" });
            console.error(error);
        } else {
            setStudents(data as User[]);
        }
        setLoading(false);
    };
    fetchStudents();
  }, [toast]);
  
  const onSubmit = async (data: StudentFormValues) => {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      toast({ title: "Error en autenticación", description: authError?.message || "No se pudo crear el usuario.", variant: "destructive" });
      return;
    }

    // 2. Create profile in public.users table
    const newUser: Omit<User, 'created_at'> = {
      id: authData.user.id,
      name: data.name,
      email: data.email,
      role: 'student',
    };
    
    const { data: newStudent, error: profileError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (profileError) {
       toast({ title: "Error al crear perfil", description: profileError.message, variant: "destructive" });
    } else {
      setStudents([newStudent as User, ...students]);
      toast({ title: "Alumno añadido", description: `${data.name} ha sido añadido al sistema.` });
      setFormOpen(false);
      form.reset();
    }
  };

  const handleDelete = async (student: User) => {
    // This is a complex operation, ideally done via a Supabase Edge Function with admin rights.
    // For simplicity here, we'll just delete from the `users` table.
    // Deleting from `auth.users` from the client is protected.
    
    const { error } = await supabase.from('users').delete().eq('id', student.id);
    if (error) {
       toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } else {
      setStudents(students.filter(s => s.id !== student.id));
      toast({ title: "Alumno eliminado", description: `${student.name} ha sido eliminado. Aún debe ser eliminado de Auth.`, variant: "destructive" });
    }
  };
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, students]);

  if (loading) {
    return <div className="text-center py-12">Cargando alumnos...</div>;
  }

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
                      <div>
                          <Label htmlFor="password">Contraseña</Label>
                          <Input id="password" type="password" {...form.register('password')} />
                          {form.formState.errors.password && <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Añadiendo..." : "Añadir Alumno"}
                        </Button>
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
                                        Esta acción no se puede deshacer. Se eliminará el perfil del alumno de la tabla de perfiles.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(student)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                </Card>
              ))}
            </div>
        ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="font-headline text-2xl font-bold">No se encontraron alumnos</h3>
                <p className="text-muted-foreground mt-2">Prueba con otro término de búsqueda o añade un nuevo alumno.</p>
            </div>
        )}
    </div>
  );
}

    