import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RitmoEstudio",
  description: "Plataforma para academias de baile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {/* AuthProvider ya no es necesario, los layouts de servidor se encargan de la autenticación */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
