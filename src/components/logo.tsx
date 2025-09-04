import { Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, justIcon = false }: { className?: string, justIcon?: boolean }) {
  if (justIcon) {
    return (
        <div className={cn("bg-primary p-1 rounded-md", className)}>
            <Wind className="h-full w-full text-primary-foreground" />
        </div>
    )
  }
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary p-2 rounded-lg">
        <Wind className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="text-2xl font-bold font-headline">
        RitmoEstudio
      </span>
    </div>
  );
}
