import "./globals.css";
import { Inter } from "next/font/google";

export const metadata = {
  title: "Pedidos ConectZ",
  description: "Pedidos digitais simples para lanchonetes",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}

