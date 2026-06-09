import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavMenu from "@/components/NavMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Med Escolha — Teste de Compatibilidade com Especialidades Médicas",
  description: "Descubra quais especialidades médicas combinam com o seu perfil. 95 questões, 55 especialidades, dados do DMB 2025.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="bg-blue-900 text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-xl">🩺</span>
              <span className="font-extrabold text-white text-sm tracking-tight group-hover:text-blue-200 transition">
                Med Escolha
              </span>
              <span className="hidden sm:inline text-blue-400 text-xs font-medium ml-1">por Amo Medicina</span>
            </a>
            <NavMenu />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
