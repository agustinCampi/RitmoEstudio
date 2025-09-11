'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { type DanceClass } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type EnrollSelfClientPageProps = {
  classId: string;
  danceClass: Pick<DanceClass, 'name' | 'description' | 'schedule'>;
  isEnrolled: boolean;
  enrollAction: (classId: string) => Promise<any>;
  unenrollAction: (classId: string) => Promise<any>;
};

export default function EnrollSelfClientPage({
  classId,
  danceClass,
  isEnrolled,
  enrollAction,
  unenrollAction,
}: EnrollSelfClientPageProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = () => {
    startTransition(async () => {
      const action = isEnrolled ? unenrollAction : enrollAction;
      const result = await action(classId);
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: isEnrolled ? 'Te has dado de baja de la clase.' : '¡Inscripción confirmada!',
        });
        // La revalidación de la ruta en la server action refrescará el estado
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Ocurrió un error inesperado.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{danceClass.name}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{danceClass.description}</p>
      
      <div className="mb-6 space-y-2">
        <h3 className="font-semibold text-lg">Horarios:</h3>
        {danceClass.schedule && danceClass.schedule.length > 0 ? (
            danceClass.schedule.map((slot, index) => (
              <div key={index} className="text-gray-700 dark:text-gray-300">{slot}</div>
            ))
        ) : (
            <p className="text-gray-500">No hay horarios definidos.</p>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={isPending} className="w-full text-lg py-6">
        {isPending ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...</>
        ) : isEnrolled ? (
          'Confirmar Baja'
        ) : (
          'Confirmar Inscripción'
        )}
      </Button>
      {isEnrolled && (
        <p className="text-center text-sm text-green-600 dark:text-green-400 mt-4">Ya estás inscrito en esta clase.</p>
      )}
    </div>
  );
}
