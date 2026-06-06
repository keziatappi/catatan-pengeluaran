import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "DompetKu - Catatan Keuangan Pribadi",
  description: "Aplikasi pencatatan pengeluaran dan pemasukan harian untuk mengelola keuangan pribadi Anda dengan mudah.",
  keywords: ["catatan pengeluaran", "keuangan", "pemasukan", "pengeluaran", "dompet"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DompetKu",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
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
