"use client";
import React, { useState, useEffect } from 'react';
import { X, PlayCircle, Loader2 } from 'lucide-react';

interface RewardedAdProps {
  onClose: () => void;
  onRewardEarned: () => void;
}

export default function RewardedAd({ onClose, onRewardEarned }: RewardedAdProps) {
  const [timeLeft, setTimeLeft] = useState(5); // Test nhanh: 5 giây (Thực tế nên set 15 hoặc 30)
  const [isRewarded, setIsRewarded] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsRewarded(true);
      onRewardEarned(); // Gọi hàm cộng tiền khi hết giờ
    }
  }, [timeLeft]);

  const handleClose = () => {
    if (!isRewarded) {
      const confirmClose = window.confirm("Bạn sẽ không nhận được phần thưởng nếu đóng quảng cáo bây giờ. Vẫn đóng?");
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="relative w-full max-w-3xl aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center shadow-2xl">
        
        {/* Nút Tắt Quảng Cáo */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition"
        >
          {isRewarded ? <X size={24} /> : <span className="text-xs font-bold">{timeLeft}s</span>}
        </button>

        {/* Nội dung Video Quảng cáo Giả lập */}
        {isRewarded ? (
          <div className="flex flex-col items-center text-green-400 animate-in zoom-in">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
               <span className="text-4xl">💰</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Phần thưởng đã được cộng!</h2>
            <p className="text-slate-400 mb-6">Bạn có thể đóng cửa sổ này.</p>
            <button onClick={onClose} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200">
              Đóng Quảng Cáo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <Loader2 size={48} className="animate-spin mb-4 text-purple-500" />
            <h2 className="text-xl font-bold text-white mb-2">Đang phát quảng cáo của Nhà tài trợ...</h2>
            <p>Vui lòng không đóng cửa sổ để nhận 100 Xu</p>
            {/* Chỗ này sau này bạn sẽ nhúng thẻ <iframe> hoặc code của Mạng quảng cáo vào */}
          </div>
        )}
        
        {/* Thanh tiến trình bên dưới */}
        {!isRewarded && (
            <div className="absolute bottom-0 left-0 h-1 bg-purple-600 transition-all duration-1000 ease-linear" style={{ width: `${((5 - timeLeft) / 5) * 100}%` }} />
        )}
      </div>
    </div>
  );
}