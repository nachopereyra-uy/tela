import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tela",
  description: "Espacio de trabajo visual para operar negocios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
