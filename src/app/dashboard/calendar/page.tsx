
"use client";

import { ClassCalendar } from "@/components/dashboard/class-calendar";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Class } from "@/lib/types";

export default function CalendarPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    const [myClasses, setMyClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('classes').select('*');
            
            if (error) {
                console.error("Error fetching classes:", error);
            } else {
                setClasses(data as Class[]);
                
                // This logic to determine "my classes" would be more complex
                // in a real app with a proper bookings table.
                if (user?.role === 'student') {
                    // Placeholder: fetch first 2 classes as "booked"
                    const { data: studentClasses } = await supabase.from('classes').select('*').limit(2);
                    setMyClasses(studentClasses as Class[]);
                } else if (user?.role === 'teacher') {
                    const teacherClasses = (data as Class[]).filter(c => c.teacherId === user.id);
                    setMyClasses(teacherClasses);
                } else {
                    setMyClasses([]);
                }
            }
            setLoading(false);
        };

        if (user) {
            fetchClasses();
        }
    }, [user]);

    // For admins or guests, show all classes. For others, highlight their own.
    const calendarClasses = user?.role === 'admin' ? classes : classes;
    const highlighted = user?.role === 'admin' ? [] : myClasses;

    return (
        <div className="w-full">
            
            <div className="px-4 sm:px-0">
                <ClassCalendar 
                    classes={calendarClasses}
                    highlightedClasses={highlighted}
                    loading={loading}
                />
            </div>
        </div>
    );
}

    