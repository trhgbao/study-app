// components/BannerAd.tsx

"use client";
import React, { useEffect } from 'react';

export default function BannerAd() {
  useEffect(() => {
    // Đoạn code này giúp kích hoạt quảng cáo trong khung chờ
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  return (
    <div className="w-full text-center" style={{ minHeight: '90px' }}>
      {/* 
        Đây là một "khung chờ" quảng cáo (Ad unit placeholder).
        Google Auto Ads sẽ quét thấy thẻ <ins> này và tự động đặt
        một quảng cáo hiển thị (Display Ad) phù hợp vào đây.
      */}
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7985740889012264" // ID Nhà xuất bản của bạn
        data-ad-slot="7840677867"      // Quan trọng: Mã Slot
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}