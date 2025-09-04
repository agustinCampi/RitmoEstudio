
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Class, ClassLevel, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/supabase';

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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Bell, Users, Clock, User, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const classSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción es muy corta."),
  teacherId: z.string().nonempty("Debes asignar un profesor."),
  schedule: z.string().nonempty("El horario es obligatorio."),
  duration: z.coerce.number().min(30, "La duración mínima es de 30 minutos."),
  maxStudents: z.coerce.number().min(1, "Debe haber al menos un cupo."),
  category: z.string().nonempty("La categoría es obligatoria."),
  level: z.enum(['principiante', 'intermedio', 'avanzado']),
});

type ClassFormValues = z.infer<typeof classSchema>;

const levels: (ClassLevel | 'Todos')[] = ["Todos", "principiante", "intermedio", "avanzado"];


export default function ClassManagement() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedLevel, setSelectedLevel] = useState<ClassLevel | 'Todos'>('Todos');
  const [categories, setCategories] = useState<string[]>(["Todas"]);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: classesData, error: classesError } = await supabase.from('classes').select('*');
      if (classesError) {
        toast({ title: "Error", description: "No se pudieron cargar las clases.", variant: "destructive" });
        console.error(classesError);
      } else {
        setClasses(classesData as Class[]);
        const uniqueCategories = ["Todas", ...new Set(classesData.map((c: Class) => c.category))];
        setCategories(uniqueCategories);
      }
      
      const { data: teachersData, error: teachersError } = await supabase.from('users').select('*').eq('role', 'teacher');
      if (teachersError) {
        toast({ title: "Error", description: "No se pudieron cargar los profesores.", variant: "destructive" });
        console.error(teachersError);
      } else {
        setTeachers(teachersData as User[]);
      }

      setLoading(false);
    };
    fetchData();
  }, [toast]);
  
  const handleOpenForm = (cls: Class | null = null) => {
    setEditingClass(cls);
    if (cls) {
      form.reset({
        name: cls.name,
        description: cls.description,
        teacherId: cls.teacherId,
        schedule: cls.schedule,
        duration: cls.duration,
        maxStudents: cls.maxStudents,
        category: cls.category,
        level: cls.level,
      });
    } else {
      form.reset({
        name: '', description: '', teacherId: '', schedule: '', duration: 60, maxStudents: 10, category: '', level: 'principiante'
      });
    }
    setFormOpen(true);
  };
  
  const onSubmit = async (data: ClassFormValues) => {
    const teacherName = teachers.find(t => t.id === data.teacherId)?.name || 'N/A';
    
    if (editingClass) {
      // Update class in Supabase
      const { data: updatedData, error } = await supabase
        .from('classes')
        .update({ ...data, teacherName })
        .eq('id', editingClass.id)
        .select()
        .single();
      
      if (error) {
         toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
      } else {
        setClasses(classes.map(c => c.id === editingClass.id ? updatedData as Class : c));
        toast({ title: "Clase actualizada", description: `La clase "${data.name}" ha sido modificada.` });
      }
    } else {
      // Create class in Supabase
      const newClassPayload: Omit<Database['public']['Tables']['classes']['Insert'], 'id' | 'created_at'> = {
        ...data,
        teacherName,
        image: `https://picsum.photos/600/400?random=${Date.now()}`,
        bookedStudents: 0,
      };
      const { data: newClass, error } = await supabase
        .from('classes')
        .insert(newClassPayload)
        .select()
        .single();

      if (error) {
        toast({ title: "Error al crear", description: error.message, variant: "destructive" });
      } else {
        setClasses([newClass as Class, ...classes]);
        toast({ title: "Clase creada", description: `La clase "${data.name}" ha sido añadida.` });
      }
    }
    setFormOpen(false);
  };

  const handleDelete = async (classId: string) => {
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) {
       toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } else {
      setClasses(classes.filter(c => c.id !== classId));
      toast({ title: "Clase eliminada", variant: "destructive" });
    }
  };
  
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesCategory = selectedCategory === 'Todas' || cls.category === selectedCategory;
      const matchesLevel = selectedLevel === 'Todos' || cls.level === selectedLevel;
      const matchesSearch = searchTerm === '' || 
                            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cls.level.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [searchTerm, selectedCategory, selectedLevel, classes]);


  const NotifyStudentsDialog = ({ classId }: { classId: string }) => {
    const [message, setMessage] = useState('');
    
    const handleSendNotification = () => {
      // This would be a call to a Supabase Edge Function in a real scenario
      console.log("Webhook a Make.com o Supabase Edge Function (Enviar Notificación):", { id_clase: classId, mensaje_personalizado: message });
      toast({
        title: "Notificación enviada",
        description: "Los alumnos inscritos recibirán un email con el mensaje.",
      });
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Bell className="mr-2 h-4 w-4" /> Notificar Cambios
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notificar Cambios a Alumnos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Escribe un mensaje para los alumnos inscritos en esta clase. Se les enviará por email.</p>
            <Textarea 
              placeholder="Ej: La clase de hoy se ha movido al salón B."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleSendNotification} disabled={!message.trim()}>Enviar Notificación</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  if (loading) {
    return <div className="text-center py-12">Cargando clases...</div>;
  }
  
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
            <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
                            <Badge variant="secondary" className="w-fit mb-2">{cls.category}</Badge>
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
                             <NotifyStudentsDialog classId={cls.id} />
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
                                    <AlertDialogAction onClick={() => handleDelete(cls.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Prof: {cls.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{cls.schedule}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-4 flex justify-center items-center rounded-b-lg">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-bold">{cls.bookedStudents} / {cls.maxStudents}</span>
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
                <Label htmlFor="teacherId">Profesor</Label>
                <Select onValueChange={(value) => form.setValue('teacherId', value)} defaultValue={form.getValues('teacherId')}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un profesor" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                 {form.formState.errors.teacherId && <p className="text-sm text-destructive">{form.formState.errors.teacherId.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select onValueChange={(value) => form.setValue('category', value)} defaultValue={form.getValues('category')}>
                    <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ritmos Latinos">Ritmos Latinos</SelectItem>
                      <SelectItem value="Danza Urbana">Danza Urbana</SelectItem>
                      <SelectItem value="Danza Clásica">Danza Clásica</SelectItem>
                      <SelectItem value="Baile Moderno">Baile Moderno</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
                </div>
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
                    <Label htmlFor="maxStudents">Cupos máximos</Label>
                    <Input id="maxStudents" type="number" {...form.register('maxStudents')} />
                    {form.formState.errors.maxStudents && <p className="text-sm text-destructive">{form.formState.errors.maxStudents.message}</p>}
                 </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
