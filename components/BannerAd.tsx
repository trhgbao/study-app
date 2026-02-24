"use client";
import React from 'react';

export default function BannerAd() {
  return (
    <div className="w-full bg-slate-900 border-b border-white/5 flex items-center justify-center p-2">
      <div className="w-full max-w-[728px] h-[60px] md:h-[90px] bg-slate-800/50 border border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 overflow-hidden relative">
        <span className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Advertisement</span>
        {/* Sau này bạn sẽ dán Script của Google AdSense vào vị trí này */}
        <span className="text-sm">Vị trí Banner Quảng Cáo (Sponsor)</span>
        
        {/* Hiệu ứng lấp lánh nhẹ để biết là khu vực ads */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
      </div>
    </div>
  );
}