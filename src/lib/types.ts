
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export type ClassLevel = 'principiante' | 'intermedio' | 'avanzado';

export interface Class {
  id: string;
  name: string;
  description: string;
  teacher_id: string; 
  schedule: string;
  duration: number; 
  max_students: number;
  image: string;
  level: ClassLevel;
  teacher_name?: string; 
  booked_students?: number;
  'data-ai-hint'?: string;
}

export interface Booking {
  id: string;
  class_id: string;
  student_id: string;
  booking_date: Date;
}

export interface Attendance {
  id: string;
  class_id: string;
  student_id: string;
  date: Date;
  status: 'presente' | 'ausente';
}

export interface StudentProfile extends User {
  joined_date: Date;
  booked_classes: number;
}
