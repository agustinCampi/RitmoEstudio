export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string; // Corresponds to auth.users.id
  email: string;
  name: string | null;
  role: UserRole;
  // any other profile data
}

// Definición centralizada para una clase de baile
export interface DanceClass {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  name: string; // text
  description: string; // text
  teacher_id: string | null; // uuid, foreign key to users
  // Horarios almacenados como un array de strings. Ej: ["Lunes 10:00-11:00", "Miércoles 10:00-11:00"]
  schedule: string[];
  // Podríamos añadir campos opcionales si queremos hacer joins
  teacher_name?: string;
}
