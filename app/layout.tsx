// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script'; // Bước 1: Import component Script của Next.js

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyFocus App",
  description: "Ứng dụng giúp bạn tập trung học tập và duy trì chuỗi thành tích.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi"> {/* Đổi sang tiếng Việt cho chuẩn */}
      <head>
        {/*
          Các thẻ Meta, Title... mặc định của Next.js
        */}

        {/* Bước 2: Dán mã AdSense của bạn vào đây */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7985740889012264" // Đây là mã của bạn
          crossOrigin="anonymous"
          strategy="afterInteractive" // Rất quan trọng: Tối ưu tốc độ tải trang
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}