import TeacherForm from '@/components/teacher-form';
import { createTeacher } from '../actions';

export default function NewTeacherPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Añadir Nuevo Profesor</h1>
      <TeacherForm action={createTeacher} />
    </div>
  );
}
