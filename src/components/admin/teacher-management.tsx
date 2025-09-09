
"use client";

import { useState, useEffect, useTransition, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { createTeacher, updateTeacher, deleteTeacher } from '@/app/actions/teacher-actions';

export function TeacherManagement() {
  const supabase = useMemo(createClient, []);
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const getTeachers = async () => {
        setLoading(true);
        const { data } = await supabase.from('users').select('*').eq('role', 'teacher');
        setTeachers(data || []);
        setLoading(false);
    };
    getTeachers();

    const channel = supabase
      .channel('realtime-teachers')
      .on<User>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: 'role=eq.teacher' },
        () => {
          getTeachers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleFormAction = (action: (formData: FormData) => Promise<{ success: boolean; message: string; }>) => {
    return (formData: FormData) => {
        startTransition(async () => {
            const result = await action(formData);
            toast({ title: result.success ? 'Éxito' : 'Error', description: result.message, variant: result.success ? 'default' : 'destructive' });
            if(result.success) {
                setIsDialogOpen(false);
                setEditingTeacher(null);
            }
        });
    }
  }

  const openEditDialog = (teacher: User) => {
    setEditingTeacher(teacher);
    setIsDialogOpen(true);
  }

  const openNewDialog = () => {
    setEditingTeacher(null);
    setIsDialogOpen(true);
  }

  const SkeletonLoader = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profesores</h2>
          <p className="text-muted-foreground">Aquí puedes ver, añadir, editar o eliminar profesores.</p>
        </div>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Profesor
        </Button>
      </div>
      <main className="p-4 sm:p-0">
        <Card>
          <CardContent className="pt-6">
             {loading ? <SkeletonLoader /> : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => openEditDialog(teacher)}>Editar</DropdownMenuItem>
                            <form action={handleFormAction(deleteTeacher)}>
                                <input type="hidden" name="id" value={teacher.id} />
                                <button type="submit" className="w-full text-left px-2 py-1.5 text-sm text-red-500 hover:bg-muted rounded-sm">Eliminar</button>
                            </form>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form action={handleFormAction(editingTeacher ? updateTeacher : createTeacher)}>
            <DialogHeader>
              <DialogTitle>{editingTeacher ? 'Editar Profesor' : 'Añadir Nuevo Profesor'}</DialogTitle>
              <DialogDescription>
                {editingTeacher ? 'Edita los detalles del profesor.' : 'Rellena los detalles para añadir un nuevo profesor.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               {editingTeacher && <input type="hidden" name="id" value={editingTeacher.id} />}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input id="name" name="name" defaultValue={editingTeacher?.name} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingTeacher?.email} className="col-span-3" disabled={!!editingTeacher} required/>
              </div>
              {!editingTeacher && (
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">Contraseña</Label>
                      <Input id="password" name="password" type="password" className="col-span-3" required/>
                  </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : (editingTeacher ? 'Guardar Cambios' : 'Crear Profesor')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
