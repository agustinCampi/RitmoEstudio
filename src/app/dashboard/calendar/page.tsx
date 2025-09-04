"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { ClassCalendar } from "@/components/dashboard/class-calendar";
import { MOCK_CLASSES } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";

export default function CalendarPage() {
    const { user } = useAuth();
    
    // For students and teachers, we want to show all classes but highlight their own
    const myClasses = MOCK_CLASSES.filter(c => {
        if (user?.role === 'student') return ["cls_salsa_1", "cls_hiphop_1"].includes(c.id);
        if (user?.role === 'teacher') return c.teacherId === user.id;
        return false;
    });

    return (
        <div className="w-full">
            <DashboardHeader title="Calendario de Clases" />
            <div className="px-4 sm:px-0">
                <ClassCalendar 
                    classes={MOCK_CLASSES}
                    highlightedClasses={myClasses}
                />
            </div>
        </div>
    );
}
