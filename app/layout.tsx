import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import NavBarCondicional from "@/components/NavBarCondicional";
import ForcarTrocaSenha from "@/components/ForcarTrocaSenha";
import PostHogIdentify from "@/components/PostHogIdentify";

const hankFont = localFont({
  src: [
    { path: '../fonts/Hank Font/HankRnd-Light.ttf',   weight: '300', style: 'normal' },
    { path: '../fonts/Hank Font/HankRnd-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Hank Font/HankRnd-Bold.ttf',    weight: '700', style: 'normal' },
    { path: '../fonts/Hank Font/HankRnd-Black.ttf',   weight: '900', style: 'normal' },
  ],
  variable: '--font-hank',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Med Escolha — Teste de Compatibilidade com Especialidades Médicas",
  description: "Descubra quais especialidades médicas combinam com o seu perfil. 95 questões, 55 especialidades, dados do DMB 2025.",
  verification: {
    google: "A21jS3GfGAecYFL7cPysCBvjCLWP-DLjVBcUkDHj8G0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={`${hankFont.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-hank), Arial, sans-serif' }}>
          <ForcarTrocaSenha />
          <PostHogIdentify />
          <NavBarCondicional />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
