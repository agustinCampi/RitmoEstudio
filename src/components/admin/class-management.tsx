"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MOCK_CLASSES, MOCK_USERS } from '@/lib/mock-data';
import type { Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { PlusCircle, MoreHorizontal, Trash2, Edit, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const classSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción es muy corta."),
  teacherId: z.string().nonempty("Debes asignar un profesor."),
  schedule: z.string().nonempty("El horario es obligatorio."),
  duration: z.coerce.number().min(30, "La duración mínima es de 30 minutos."),
  maxStudents: z.coerce.number().min(1, "Debe haber al menos un cupo."),
  category: z.string().nonempty("La categoría es obligatoria."),
});

type ClassFormValues = z.infer<typeof classSchema>;

const teachers = MOCK_USERS.filter(u => u.role === 'teacher');

export default function ClassManagement() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
  });
  
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
      });
    } else {
      form.reset({
        name: '', description: '', teacherId: '', schedule: '', duration: 60, maxStudents: 10, category: ''
      });
    }
    setFormOpen(true);
  };
  
  const onSubmit = (data: ClassFormValues) => {
    const teacherName = teachers.find(t => t.id === data.teacherId)?.name || 'N/A';
    if (editingClass) {
      // Update class
      console.log('Webhook a Make.com (Editar Clase):', { id: editingClass.id, ...data });
      setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...data, teacherName } : c));
      toast({ title: "Clase actualizada", description: `La clase "${data.name}" ha sido modificada.` });
    } else {
      // Create class
      const newClass: Class = {
        id: `cls_${Date.now()}`,
        ...data,
        teacherName,
        image: `https://picsum.photos/600/400?random=${Date.now()}`,
        bookedStudents: 0,
      };
      console.log('Webhook a Make.com (Crear Clase):', newClass);
      setClasses([newClass, ...classes]);
      toast({ title: "Clase creada", description: `La clase "${data.name}" ha sido añadida.` });
    }
    setFormOpen(false);
  };

  const handleDelete = (classId: string) => {
    console.log('Webhook a Make.com (Eliminar Clase):', { id: classId });
    setClasses(classes.filter(c => c.id !== classId));
    toast({ title: "Clase eliminada", variant: "destructive" });
  };

  const NotifyStudentsDialog = ({ classId }: { classId: string }) => {
    const [message, setMessage] = useState('');
    
    const handleSendNotification = () => {
      console.log("Webhook a Make.com (Enviar Notificación):", { id_clase: classId, mensaje_personalizado: message });
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
  
  return (
    <Card>
       <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Lista de Clases</CardTitle>
            <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Clase
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clase</TableHead>
              <TableHead>Profesor</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Cupos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell>
                  <div className="font-medium">{cls.name}</div>
                  <div className="text-sm text-muted-foreground">{cls.category}</div>
                </TableCell>
                <TableCell>{cls.teacherName}</TableCell>
                <TableCell>{cls.schedule}</TableCell>
                <TableCell>
                  <Badge variant={cls.bookedStudents === cls.maxStudents ? "destructive" : "secondary"}>
                    {cls.bookedStudents} / {cls.maxStudents}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
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
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
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
                              <AlertDialogAction onClick={() => handleDelete(cls.id)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Editar Clase' : 'Crear Nueva Clase'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Nombre de la Clase</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" {...form.register('description')} />
                {form.formState.errors.description && <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>}
              </div>
              <div>
                <Label htmlFor="teacherId">Profesor</Label>
                <Select onValueChange={(value) => form.setValue('teacherId', value)} defaultValue={form.getValues('teacherId')}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un profesor" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                 {form.formState.errors.teacherId && <p className="text-sm text-red-600">{form.formState.errors.teacherId.message}</p>}
              </div>
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
                 {form.formState.errors.category && <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="schedule">Horario</Label>
                <Input id="schedule" placeholder="Ej: Lunes y Miércoles, 18:00 - 19:00" {...form.register('schedule')} />
                {form.formState.errors.schedule && <p className="text-sm text-red-600">{form.formState.errors.schedule.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="duration">Duración (min)</Label>
                    <Input id="duration" type="number" {...form.register('duration')} />
                    {form.formState.errors.duration && <p className="text-sm text-red-600">{form.formState.errors.duration.message}</p>}
                 </div>
                 <div>
                    <Label htmlFor="maxStudents">Cupos máximos</Label>
                    <Input id="maxStudents" type="number" {...form.register('maxStudents')} />
                    {form.formState.errors.maxStudents && <p className="text-sm text-red-600">{form.formState.errors.maxStudents.message}</p>}
                 </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
