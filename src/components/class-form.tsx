'use client';

import { useFormState } from 'react-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DanceClass } from '@/app/dashboard/classes/page';

// Definimos un tipo para los profesores que pasaremos como props.
type Teacher = {
  id: string;
  name: string | null;
};

// El formulario ahora necesita una lista de profesores.
type ClassFormProps = {
  action: (prevState: any, formData: FormData) => Promise<any>;
  danceClass?: DanceClass | null;
  teachers: Teacher[];
};

const levels = ['principiante', 'intermedio', 'avanzado'];

export default function ClassForm({ action, danceClass, teachers }: ClassFormProps) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(action, initialState);

  const [scheduleFields, setScheduleFields] = useState<string[]>(
    danceClass?.schedule && danceClass.schedule.length > 0 ? danceClass.schedule : ['']
  );

  const addScheduleField = () => setScheduleFields([...scheduleFields, '']);
  const removeScheduleField = (index: number) => {
    if (scheduleFields.length > 1) {
      setScheduleFields(scheduleFields.filter((_, i) => i !== index));
    }
  };

  return (
    <form action={dispatch} className="space-y-8 max-w-2xl">
      {danceClass && <input type="hidden" name="id" value={danceClass.id} />}
      
      {/* --- Detalles Básicos de la Clase --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nombre de la Clase</Label>
          <Input id="name" name="name" defaultValue={danceClass?.name} required />
          <div aria-live="polite">{state.errors?.name?.map((e:string) => <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>)}</div>
        </div>
        <div>
          <Label htmlFor="teacher_id">Profesor</Label>
          <Select name="teacher_id" defaultValue={danceClass?.teacher_id}>
            <SelectTrigger><SelectValue placeholder="Selecciona un profesor" /></SelectTrigger>
            <SelectContent>
              {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div aria-live="polite">{state.errors?.teacher_id?.map((e:string) => <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>)}</div>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" defaultValue={danceClass?.description} />
        <div aria-live="polite">{state.errors?.description?.map((e:string) => <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>)}</div>
      </div>

      {/* --- Detalles Numéricos y de Nivel --- */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="level">Nivel</Label>
          <Select name="level" defaultValue={danceClass?.level}>
            <SelectTrigger><SelectValue placeholder="Selecciona un nivel" /></SelectTrigger>
            <SelectContent>
              {levels.map(l => <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
          <div aria-live="polite">{state.errors?.level?.map((e:string) => <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>)}</div>
        </div>
        <div>
          <Label htmlFor="duration">Duración (minutos)</Label>
          <Input id="duration" name="duration" type="number" defaultValue={danceClass?.duration} required />
          <div aria-live="polite">{state.errors?.duration?.map((e:string) => <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>)}</div>
        </div>
        <div>
          <Label htmlFor="max_students">Cupos Máximos</Label>
          <Input id="max_students" name="max_students" type="number" defaultValue={danceClass?.max_students} required />
          <div aria-live="polite">{state.errors?.max_students?.map((e:string) => <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>)}</div>
        </div>
      </div>

      {/* --- Sección de Horarios Dinámicos --- */}
      <div className="space-y-4 rounded-lg border p-4">
        <div>
            <Label>Horarios</Label>
            <p className="text-sm text-muted-foreground">Añade uno o más horarios para la clase.</p>
        </div>
        {scheduleFields.map((schedule, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input type="time" name="schedule" defaultValue={schedule} required className="w-full" />
            <Button type="button" variant="outline" size="icon" onClick={() => removeScheduleField(index)} disabled={scheduleFields.length === 1}>&times;</Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addScheduleField} className="w-full">+ Añadir Horario</Button>
        <div aria-live="polite">{state.errors?.schedule?.map((e:string) => <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>)}</div>
      </div>

      {state.message && !state.errors && <p className="text-sm text-red-500">{state.message}</p>}

      <div className="flex justify-end">
        <Button type="submit">{danceClass ? 'Actualizar Clase' : 'Crear Clase'}</Button>
      </div>
    </form>
  );
}
