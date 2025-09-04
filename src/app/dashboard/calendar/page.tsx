"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { ClassCalendar } from "@/components/dashboard/class-calendar";
import { MOCK_CLASSES } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";

export default function CalendarPage() {
    const { user } = useAuth();
    
    // In a real scenario, you might filter classes based on the user
    // For now, we show all classes to give a full view.
    const classesToShow = MOCK_CLASSES;

    return (
        <div className="w-full">
            <DashboardHeader title="Calendario de Clases" />
            <div className="px-4 sm:px-0">
                <ClassCalendar classes={classesToShow} />
            </div>
        </div>
    );
}
