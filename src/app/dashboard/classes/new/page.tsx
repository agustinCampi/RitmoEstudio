import ClassForm from '@/components/class-form';
import { createClass } from '../actions';

export default function NewClassPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Añadir Nueva Clase</h1>
      <ClassForm action={createClass} />
    </div>
  );
}
