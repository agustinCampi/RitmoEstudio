import StudentForm from '@/components/student-form';
import { createStudent } from '../actions';

export default function NewStudentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Añadir Nuevo Alumno</h1>
      <StudentForm action={createStudent} />
    </div>
  );
}
