"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function FireStreak({ days }: { days: number }) {
  return (
    <div className="relative w-32 h-40 flex flex-col items-center justify-end">
      {/* 1. Ngọn lửa phía sau (Animation) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         {/* Lớp lửa đỏ */}
         <motion.div 
            animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 w-24 h-24 bg-red-600 rounded-full blur-xl opacity-80"
         />
         {/* Lớp lửa cam */}
         <motion.div 
            animate={{ scale: [1, 1.2, 1], y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            className="absolute bottom-2 w-16 h-20 bg-orange-500 rounded-full blur-lg opacity-90"
         />
         {/* Lớp lửa vàng */}
         <motion.div 
            animate={{ scale: [1, 1.3, 0.9], y: [0, -8, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute bottom-4 w-10 h-14 bg-yellow-400 rounded-full blur-md"
         />
      </div>

      {/* 2. Icon và Số ngày */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
        >
            <Zap size={48} className="text-yellow-100 fill-yellow-200 drop-shadow-[0_0_10px_rgba(255,200,0,0.8)]" />
        </motion.div>
        
        <div className="mt-2 text-center">
            <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-t from-yellow-500 to-white drop-shadow-sm font-mono">
                {days}
            </span>
            <span className="text-xs font-bold text-orange-200 uppercase tracking-widest">Ngày Streak</span>
        </div>
      </div>
    </div>
  );
}