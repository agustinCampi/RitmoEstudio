
import Link from "next/link";
import { Mountain } from "lucide-react";

interface LogoProps {
    justIcon?: boolean
}

export function Logo({ justIcon = false }: LogoProps) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
      <Mountain className="h-6 w-6 text-primary" />
      {!justIcon && <span className="">RitmoEstudio</span>}
    </Link>
  );
}
