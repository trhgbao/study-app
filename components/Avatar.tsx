"use client";
import React from 'react';
import { motion } from 'framer-motion';

// Cấu hình các loại Mũ và Áo (SVG Path)
export const SKINS_CONFIG = {
  hats: {
    none: null,
    cap: <path d="M40 50 C40 20 160 20 160 50 L160 60 L40 60 Z M160 60 L190 60 L190 50 L160 50" fill="#ef4444" />, // Mũ lưỡi trai đỏ
    crown: <path d="M50 60 L50 20 L80 50 L100 10 L120 50 L150 20 L150 60 Z" fill="#eab308" />, // Vương miện vàng
    headphones: <path d="M30 100 C30 20 170 20 170 100" stroke="#3b82f6" strokeWidth="15" fill="none" />, // Tai nghe
  },
  shirts: {
    none: null,
    tie: <path d="M95 140 L105 140 L105 200 L95 200 Z M90 140 L110 140 L100 150 Z" fill="#ef4444" />, // Cà vạt
    scarf: <path d="M60 140 Q100 160 140 140 L140 160 Q100 180 60 160 Z" fill="#10b981" />, // Khăn quàng
  }
};

interface AvatarProps {
  color: string;
  hat: string;
  shirt: string;
  size?: number;
}

export default function Avatar({ color = "#8b5cf6", hat = "none", shirt = "none", size = 150 }: AvatarProps) {
  return (
    <motion.div 
      className="relative flex items-center justify-center drop-shadow-2xl"
      initial={{ scale: 0.9 }} animate={{ scale: 1 }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* 1. Đôi chân */}
        <path d="M70 180 L70 200 L90 200 L90 180 Z" fill={color} filter="brightness(0.8)" />
        <path d="M110 180 L110 200 L130 200 L130 180 Z" fill={color} filter="brightness(0.8)" />

        {/* 2. Cơ thể (Study Buddy - Dạng hạt đậu) */}
        <ellipse cx="100" cy="120" rx="60" ry="70" fill={color} />
        
        {/* 3. Khuôn mặt (Màn hình kính) */}
        <rect x="60" y="90" width="80" height="50" rx="20" fill="#1e293b" />
        {/* Mắt chớp chớp */}
        <circle cx="85" cy="115" r="5" fill="#0ea5e9">
            <animate attributeName="opacity" values="1;0;1" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="115" cy="115" r="5" fill="#0ea5e9">
             <animate attributeName="opacity" values="1;0;1" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* 4. Trang phục (Layers) */}
        {shirt !== 'none' && SKINS_CONFIG.shirts[shirt as keyof typeof SKINS_CONFIG.shirts]}
        {hat !== 'none' && SKINS_CONFIG.hats[hat as keyof typeof SKINS_CONFIG.hats]}

      </svg>
    </motion.div>
  );
}