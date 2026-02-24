"use client";
import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Gift, Clock, Snowflake, Coins } from 'lucide-react';

// Cập nhật phần thưởng
const SEGMENTS = [
  { id: 'coin_50', label: '50 Xu', color: '#3b82f6', probability: 0.4, icon: <Coins size={14}/> },
  { id: 'freeze', label: 'Thẻ Freeze', color: '#8b5cf6', probability: 0.2, icon: <Snowflake size={14}/> },
  { id: 'reduce_30', label: '-30 Phút', color: '#ec4899', probability: 0.2, icon: <Clock size={14}/> }, // MỚI
  { id: 'wish', label: 'Lời chúc', color: '#f59e0b', probability: 0.2, icon: <Gift size={14}/> },
];

interface LuckyWheelProps {
  onClose: () => void;
  onWin: (reward: any) => void;
  canSpin: boolean;
  onSpinStart: () => void;
}

export default function LuckyWheel({ onClose, onWin, canSpin, onSpinStart }: LuckyWheelProps) {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;
    
    setIsSpinning(true);
    onSpinStart();

    // 1. Tính toán kết quả dựa trên xác suất (Logic Backend giả lập)
    const random = Math.random();
    let accumulatedProbability = 0;
    let selectedIndex = 0;

    for (let i = 0; i < SEGMENTS.length; i++) {
      accumulatedProbability += SEGMENTS[i].probability;
      if (random <= accumulatedProbability) {
        selectedIndex = i;
        break;
      }
    }

    // 2. Tính toán góc quay
    // Mỗi ô chiếm (360 / 4) = 90 độ. 
    // Muốn kim chỉ vào giữa ô, cần cộng thêm offset.
    // Quay ít nhất 5 vòng (360 * 5) + góc của ô trúng.
    const segmentAngle = 360 / SEGMENTS.length;
    // Để kim (ở trên cùng - 0 độ) chỉ vào ô, ta cần xoay ngược chiều kim đồng hồ
    const stopAngle = 360 * 5 + (360 - (selectedIndex * segmentAngle) - (segmentAngle / 2));

    // 3. Thực hiện Animation xoay
    await controls.start({
      rotate: stopAngle,
      transition: { duration: 4, ease: "circOut" } // Hiệu ứng xoay nhanh rồi chậm dần
    });

    // 4. Kết thúc
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999
    });
    
    setIsSpinning(false);
    onWin(SEGMENTS[selectedIndex]);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full flex flex-col items-center shadow-2xl">
        {/* Nút tắt */}
        <button onClick={onClose} disabled={isSpinning} className="absolute top-4 right-4 text-slate-400 hover:text-white transition disabled:opacity-50">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
          <Gift /> Vòng Quay May Mắn
        </h2>

        {/* VÒNG QUAY */}
        <div className="relative w-64 h-64 mb-8">
          {/* Kim chỉ định (Mũi tên) */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 text-white filter drop-shadow-lg">
            ▼
          </div>

          {/* Đĩa quay */}
          <motion.div
            className="w-full h-full rounded-full border-4 border-slate-700 overflow-hidden relative shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            animate={controls}
            style={{ transformOrigin: "center" }}
          >
            {SEGMENTS.map((seg, index) => {
              const rotate = (360 / SEGMENTS.length) * index;
              return (
                <div
                  key={seg.id}
                  className="absolute w-full h-full top-0 left-0 flex justify-center pt-4 font-bold text-xs uppercase text-white shadow-sm"
                  style={{
                    backgroundColor: seg.color,
                    transform: `rotate(${rotate}deg)`,
                    clipPath: "polygon(50% 50%, 0 0, 100% 0)", // Cắt hình rẻ quạt (cho 4 ô)
                    // Lưu ý: clipPath này chỉnh cho 4 ô. Nếu đổi số lượng ô phải tính lại.
                  }}
                >
                  <span style={{ transform: "translateY(10px)" }}>{seg.label}</span>
                </div>
              );
            })}
          </motion.div>
          
          {/* Trục giữa */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg z-10" />
        </div>

        {/* Nút Quay */}
        <button
          onClick={handleSpin}
          disabled={!canSpin || isSpinning}
          className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
            canSpin && !isSpinning
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSpinning ? "Đang quay..." : `QUAY (Giá: 100 Xu)`}
        </button>
      </div>
    </div>
  );
}