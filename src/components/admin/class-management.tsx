
"use client";

import { useState, useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Class, ClassLevel, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { upsertClass, deleteClass, getClassesWithTeachers } from '@/app/actions/class-actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Clock, Users, User as UserIcon, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const classSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción es muy corta."),
  teacher_id: z.string().nonempty("Debes asignar un profesor."),
  schedule: z.string().nonempty("El horario es obligatorio."),
  duration: z.coerce.number().min(30, "La duración mínima es de 30 minutos."),
  max_students: z.coerce.number().min(1, "Debe haber al menos un cupo."),
  level: z.enum(['principiante', 'intermedio', 'avanzado']),
});

type ClassFormValues = z.infer<typeof classSchema>;

const levels: (ClassLevel | 'Todos')[] = ["Todos", "principiante", "intermedio", "avanzado"];

interface ClassManagementProps {
  initialClasses: (Class & { teacher_name: string })[];
  initialTeachers: User[];
}

export default function ClassManagement({ initialClasses, initialTeachers }: ClassManagementProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState(initialClasses);
  const [teachers, setTeachers] = useState<User[]>(initialTeachers);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<ClassLevel | 'Todos'>('Todos');
  const [isPending, startTransition] = useTransition();

  const refreshData = async () => {
    const classesData = await getClassesWithTeachers();
    setClasses(classesData as (Class & { teacher_name: string })[]);
  };

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
        name: '',
        description: '',
        teacher_id: '',
        schedule: '',
        duration: 60,
        max_students: 10,
        level: 'principiante'
    }
  });


  const handleOpenForm = (cls: Class | null = null) => {
    setEditingClass(cls);
    if (cls) {
      form.reset({
        name: cls.name,
        description: cls.description,
        teacher_id: cls.teacher_id,
        schedule: cls.schedule,
        duration: cls.duration,
        max_students: cls.max_students,
        level: cls.level,
      });
    } else {
      form.reset({
        name: '', description: '', teacher_id: '', schedule: '', duration: 60, max_students: 10, level: 'principiante'
      });
    }
    setFormOpen(true);
  };

  const onSubmit = (data: ClassFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (editingClass) {
        formData.append('id', editingClass.id);
      }
      Object.keys(data).forEach(key => {
          const value = (data as any)[key];
          formData.append(key, String(value));
      });

      const result = await upsertClass(formData);

       if (result?.errors) {
        const fieldErrors = result.errors;
        Object.keys(fieldErrors).forEach((field) => {
            const message = (fieldErrors as any)[field]?.join(', ');
            (form.setError as any)(field, { type: 'server', message });
        });
        toast({ title: `Error al ${editingClass ? 'actualizar' : 'crear'} la clase`, description: "Por favor, revisa los campos del formulario.", variant: "destructive" });
      } else if (result?.error) {
        toast({ title: `Error al ${editingClass ? 'actualizar' : 'crear'}`, description: result.error.message, variant: "destructive" });
      } else {
        toast({ title: `Clase ${editingClass ? 'actualizada' : 'creada'}`, description: `La clase "${data.name}" ha sido guardada.` });
        await refreshData();
        setFormOpen(false);
      }
    });
  };

  const handleDelete = async (classId: string) => {
    startTransition(async () => {
      const result = await deleteClass(classId);
      if (result.error) {
        toast({ title: "Error al eliminar", description: result.error.message, variant: "destructive" });
      } else {
        toast({ title: "Clase eliminada", variant: "destructive" });
        await refreshData();
      }
    });
  };

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesLevel = selectedLevel === 'Todos' || cls.level === selectedLevel;
      const teacherName = cls.teacher_name || '';
      const matchesSearch = searchTerm === '' ||
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.level.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [searchTerm, selectedLevel, classes]);
  
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-headline text-2xl font-bold">Lista de Clases</h2>
            <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Clase
            </Button>
        </div>
        
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por clase, profesor, nivel..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
            <Select onValueChange={(value) => setSelectedLevel(value as ClassLevel | 'Todos')} defaultValue={selectedLevel}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                    {levels.map(level => (
                        <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
        {filteredClasses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredClasses.map((cls) => (
                <Card key={cls.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-grow">
                           <CardTitle>{cls.name}</CardTitle>
                            <CardDescription className="capitalize">{cls.level}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleOpenForm(cls)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                             </DropdownMenuItem>
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
                                      Esta acción no se puede deshacer. Se eliminará la clase permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(cls.id)} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
                                       {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                       Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <UserIcon className="h-4 w-4" />
                        <span>Prof: {cls.teacher_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{cls.schedule}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-4 flex justify-center items-center rounded-b-lg">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-bold">{cls.booked_students || 0} / {cls.max_students}</span>
                        <span className="text-muted-foreground">Cupos</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
        ) : (
             <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="font-headline text-2xl font-bold">No se encontraron clases</h3>
                <p className="text-muted-foreground mt-2">Prueba a cambiar los filtros o el término de búsqueda, o crea una nueva clase.</p>
            </div>
        )}
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Editar Clase' : 'Crear Nueva Clase'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Nombre de la Clase</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" {...form.register('description')} />
                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
              </div>
              <div>
                <Label htmlFor="teacher_id">Profesor</Label>
                <Select onValueChange={(value) => form.setValue('teacher_id', value)} defaultValue={form.getValues('teacher_id')}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un profesor" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                 {form.formState.errors.teacher_id && <p className="text-sm text-destructive">{form.formState.errors.teacher_id.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                 <div>
                  <Label htmlFor="level">Nivel</Label>
                  <Select onValueChange={(value) => form.setValue('level', value as ClassLevel)} defaultValue={form.getValues('level')}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un nivel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principiante">Principiante</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.level && <p className="text-sm text-destructive">{form.formState.errors.level.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="schedule">Horario</Label>
                <Input id="schedule" placeholder="Ej: Lunes y Miércoles, 18:00 - 19:00" {...form.register('schedule')} />
                {form.formState.errors.schedule && <p className="text-sm text-destructive">{form.formState.errors.schedule.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="duration">Duración (min)</Label>
                    <Input id="duration" type="number" {...form.register('duration')} />
                    {form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}
                 </div>
                 <div>
                    <Label htmlFor="max_students">Cupos máximos</Label>
                    <Input id="max_students" type="number" {...form.register('max_students')} />
                    {form.formState.errors.max_students && <p className="text-sm text-destructive">{form.formState.errors.max_students.message}</p>}
                 </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" type="button">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
