export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  schedule: string;
  duration: number; // in minutes
  maxStudents: number;
  image: string;
  category: string;
  bookedStudents?: number;
  'data-ai-hint'?: string;
}

export interface Booking {
  id: string;
  classId: string;
  studentId: string;
  bookingDate: Date;
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: Date;
  status: 'presente' | 'ausente';
}

export interface StudentProfile extends User {
  joinedDate: Date;
  bookedClasses: number;
}
