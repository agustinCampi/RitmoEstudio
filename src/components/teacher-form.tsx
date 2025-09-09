'use client';

import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/lib/types';

// El "action" del servidor se pasará como prop.
type TeacherFormProps = {
  action: (prevState: any, formData: FormData) => Promise<any>;
  teacher?: User | null; // El profesor es opcional (para la creación).
};

export default function TeacherForm({ action, teacher }: TeacherFormProps) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(action, initialState);

  return (
    <form action={dispatch} className="space-y-6 max-w-lg">
      {/* Campo oculto para el ID del profesor durante la edición */}
      {teacher && <input type="hidden" name="id" value={teacher.id} />}

      <div>
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          name="name"
          // Nos aseguramos de que el valor por defecto sea una cadena vacía si no hay nombre.
          defaultValue={teacher?.name || ''}
          required
          aria-describedby="name-error"
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          // Nos aseguramos de que el valor por defecto sea una cadena vacía si no hay email.
          defaultValue={teacher?.email || ''}
          required
          aria-describedby="email-error"
        />
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {state.errors?.email &&
            state.errors.email.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div>
        <Label htmlFor="password">
          Contraseña ({teacher ? 'Dejar en blanco para no cambiar' : 'Requerida'})
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          aria-describedby="password-error"
        />
        <div id="password-error" aria-live="polite" aria-atomic="true">
          {state.errors?.password &&
            state.errors.password.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      {state.message && (
        <div aria-live="polite" className="text-sm text-red-500">
          <p>{state.message}</p>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="submit">{teacher ? 'Actualizar Profesor' : 'Crear Profesor'}</Button>
      </div>
    </form>
  );
}
