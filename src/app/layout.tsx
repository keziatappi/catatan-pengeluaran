import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DompetKu - Catatan Keuangan Pribadi",
  description: "Aplikasi pencatatan pengeluaran dan pemasukan harian untuk mengelola keuangan pribadi Anda dengan mudah.",
  keywords: ["catatan pengeluaran", "keuangan", "pemasukan", "pengeluaran", "dompet"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
