"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface NeonTimerProps {
  seconds: number;
  targetMinutes: number; // ĐÂY PHẢI LÀ TỔNG MỤC TIÊU BAN ĐẦU (vd: 120), KHÔNG PHẢI SỐ CÒN LẠI
  isRunning: boolean;
}

export default function NeonTimer({ seconds, targetMinutes, isRunning }: NeonTimerProps) {
  // 1. Logic tính phần trăm tiến trình chuẩn xác
  const totalSeconds = targetMinutes * 60;
  const progress = Math.min((seconds / totalSeconds) * 100, 100); // Tối đa 100%
  
  // 2. Kích thước vòng tròn (Đã tăng từ 240 lên 320)
  const radius = 160; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Format giờ đang chạy
  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    // Bỏ số 0 vô nghĩa ở đầu giờ để chữ ngắn hơn
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Tính số phút còn lại
  const minutesLeft = Math.max(0, targetMinutes - Math.floor(seconds / 60));

  return (
    <div className="relative flex items-center justify-center w-[400px] h-[400px] mx-auto my-4 scale-90 sm:scale-100">
      {/* Hiệu ứng nền Glow */}
      <motion.div 
        animate={{ scale: isRunning ? [1, 1.05, 1] : 1, opacity: isRunning ? 0.6 : 0.2 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-purple-600 rounded-full blur-[80px]"
      />

      {/* SVG Vòng tròn (Đã làm to ra) */}
      <svg className="w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 360 360">
        <circle cx="180" cy="180" r={radius} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="16" fill="transparent" />
        
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" /> {/* Tím */}
            <stop offset="100%" stopColor="#f43f5e" /> {/* Đỏ hồng */}
          </linearGradient>
        </defs>

        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "linear" }}
          cx="180" cy="180" r={radius}
          stroke="url(#neonGradient)"
          strokeWidth="16"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className="filter drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]"
        />
      </svg>

      {/* Chữ số ở giữa */}
      <div className="absolute flex flex-col items-center justify-center w-full">
        <span className="text-6xl sm:text-7xl font-mono font-black text-white tracking-widest drop-shadow-lg z-10 tabular-nums">
          {formatTime(seconds)}
        </span>
        <span className={`mt-4 text-sm font-bold tracking-[0.2em] z-10 ${progress >= 100 ? 'text-green-400' : 'text-slate-400'}`}>
          {progress >= 100 ? '🎉 HOÀN THÀNH' : `CÒN LẠI: ${minutesLeft}M`}
        </span>
      </div>
    </div>
  );
}