// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script'; // 1. IMPORT SCRIPT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyFocus App",
  description: "Ứng dụng giúp bạn tập trung học tập",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/*
          Đây là mã xác minh của AdSense. 
          Google sẽ quét thấy nó trong thẻ <head> này.
        */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7985740889012264"
          crossOrigin="anonymous"
          strategy="beforeInteractive" // Chỉ tải script quảng cáo sau khi trang đã tương tác được
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}