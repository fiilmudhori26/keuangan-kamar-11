import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Keuangan Santri — Sistem Manajemen Keuangan Pesantren",
  description:
    "Aplikasi manajemen keuangan santri untuk pesantren. Kelola saldo, transaksi, dan data santri dengan mudah dan aman.",
  keywords: ["keuangan", "santri", "pesantren", "manajemen", "keuangan santri"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              className: "rounded-xl shadow-lg",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
