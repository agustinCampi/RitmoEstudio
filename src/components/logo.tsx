
import Link from "next/link";
import { Mountain } from "lucide-react";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
      <Mountain className="h-6 w-6" />
      <span className="">RitmoEstudio</span>
    </Link>
  );
}
