"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Settings, ShoppingBag, Zap, Globe, 
  Snowflake, Clock, Gift, X, CheckCircle 
} from 'lucide-react';
import { differenceInDays } from 'date-fns';

// --- CONFIG & DATA ---
const INITIAL_TARGET = 120; // 2 tiếng mặc định
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const COINS_PER_MINUTE = 1; // 1 phút học = 1 coin

// Danh sách vật phẩm trong Shop
const SHOP_ITEMS = [
  { 
    id: 'freeze', 
    name: 'Streak Freeze', 
    icon: <Snowflake className="text-blue-400" />, 
    price: 500, 
    desc: 'Bảo vệ chuỗi nếu bạn quên học 1 ngày.' 
  },
  { 
    id: 'reduce', 
    name: 'Time Reducer', 
    icon: <Clock className="text-yellow-400" />, 
    price: 300, 
    desc: 'Giảm 30 phút mục tiêu hôm nay.' 
  },
  { 
    id: 'wheel', 
    name: 'Lucky Wheel', 
    icon: <Gift className="text-pink-400" />, 
    price: 100, 
    desc: 'Quay để nhận quà ngẫu nhiên.' 
  }
];

// Dictionary đa ngôn ngữ
const DICTIONARY = {
  vi: {
    start: "Bắt đầu", pause: "Tạm dừng", target: "Mục tiêu", streak: "Chuỗi",
    shop: "Cửa hàng", settings: "Cài đặt", changeTarget: "Đổi mục tiêu",
    waitMsg: "Bạn cần đợi thêm", days: "ngày để đổi lại.", lang: "Ngôn ngữ",
    coins: "Xu", buy: "Mua", owned: "Đang có", use: "Dùng",
    msgSuccess: "Thành công!", msgFail: "Không đủ tiền!",
    wheelWin: "Bạn nhận được", wheelLose: "Chúc may mắn lần sau"
  },
  en: {
    start: "Start", pause: "Pause", target: "Target", streak: "Streak",
    shop: "Shop", settings: "Settings", changeTarget: "Change Target",
    waitMsg: "Please wait", days: "days to update again.", lang: "Language",
    coins: "Coins", buy: "Buy", owned: "Owned", use: "Use",
    msgSuccess: "Success!", msgFail: "Not enough coins!",
    wheelWin: "You won", wheelLose: "Better luck next time"
  }
};

export default function StudyApp() {
  // --- STATE ---
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const t = DICTIONARY[lang];
  
  // User Stats (Dữ liệu này sau sẽ lấy từ Supabase)
  const [coins, setCoins] = useState(1000); // Cho sẵn 1000 để test
  const [streak, setStreak] = useState(5);
  const [inventory, setInventory] = useState<Record<string, number>>({ freeze: 0, reduce: 0 });
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);

  // Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [secondsStudied, setSecondsStudied] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(INITIAL_TARGET);
  
  // Logic đổi mục tiêu
  const [lastTargetUpdate, setLastTargetUpdate] = useState<number>(Date.now() - ONE_WEEK_MS);
  const [newTargetInput, setNewTargetInput] = useState(INITIAL_TARGET);

  // Modals
  const [activeModal, setActiveModal] = useState<'settings' | 'shop' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC TIMER & COINS ---
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsStudied((prev) => {
          const newValue = prev + 1;
          // Cộng coin mỗi phút (60s)
          if (newValue % 60 === 0) {
            setCoins(c => c + COINS_PER_MINUTE);
          }
          return newValue;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  // --- LOGIC STREAK CHECK ---
  // Mỗi khi progress đạt 100%, kiểm tra streak
  const progressPercent = Math.min((secondsStudied / (targetMinutes * 60)) * 100, 100);
  
  useEffect(() => {
    if (progressPercent >= 100) {
      const today = new Date().toISOString().split('T')[0];
      if (lastCompletedDate !== today) {
        // Hoàn thành ngày mới -> Cộng streak
        setStreak(s => s + 1);
        setLastCompletedDate(today);
        alert(`🎉 Chúc mừng! Bạn đã duy trì chuỗi ${streak + 1} ngày!`);
        setIsRunning(false); // Dừng timer
      }
    }
  }, [progressPercent, lastCompletedDate, streak]);

  // --- LOGIC SHOP ---
  const handleBuy = (itemId: string, price: number) => {
    if (coins < price) {
      alert(t.msgFail);
      return;
    }

    setCoins(prev => prev - price);

    if (itemId === 'wheel') {
      playLuckyWheel();
    } else {
      setInventory(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1
      }));
      alert(t.msgSuccess);
    }
  };

  const playLuckyWheel = () => {
    // Tỉ lệ: 40% trúng 50 xu, 20% trúng thẻ Freeze, 40% trúng câu chúc
    const rand = Math.random();
    if (rand < 0.4) {
      setCoins(c => c + 50);
      alert(`${t.wheelWin} 50 Coins!`);
    } else if (rand < 0.6) {
      setInventory(prev => ({ ...prev, freeze: (prev.freeze || 0) + 1 }));
      alert(`${t.wheelWin} 1 Streak Freeze!`);
    } else {
      alert(t.wheelLose);
    }
  };

  const handleUseItem = (itemId: string) => {
    if (!inventory[itemId] || inventory[itemId] <= 0) return;

    if (itemId === 'reduce') {
      if (targetMinutes <= 30) {
        alert("Mục tiêu đã quá thấp!");
        return;
      }
      setTargetMinutes(prev => prev - 30);
      setInventory(prev => ({ ...prev, reduce: prev.reduce - 1 }));
      alert("Đã giảm 30 phút mục tiêu hôm nay!");
    }
    // 'freeze' tự động dùng khi mất chuỗi (logic backend)
  };

  // --- FORMAT TIME ---
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-primary selection:text-white pb-20">
      
      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-white/10 backdrop-blur-md sticky top-0 z-10 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center font-bold">S</div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">StudyFocus</h1>
        </div>
        
        <div className="flex gap-3">
           {/* Nút đổi ngôn ngữ */}
          <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="flex items-center gap-1 text-xs bg-white/5 px-3 py-2 rounded-full hover:bg-white/10 transition">
            <Globe size={14} /> {lang.toUpperCase()}
          </button>
          
          {/* Streak Badge */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-orange-500/20">
            <Zap size={16} fill="white" /> {streak}
          </div>

          {/* Coins Badge */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 rounded-full text-sm font-bold text-slate-900 shadow-lg shadow-yellow-500/20 cursor-pointer" onClick={() => setActiveModal('shop')}>
            <span className="font-extrabold text-lg">©</span> {coins}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-md mx-auto mt-8 p-4">
        
        {/* TIMER CIRCLE */}
        <div className="relative w-72 h-72 mx-auto mb-10 group">
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${isRunning ? 'bg-primary scale-110' : 'bg-blue-500 scale-90'}`}></div>
            
            {/* Circle UI */}
            <div className="relative w-full h-full rounded-full border-8 border-white/5 flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-xl shadow-2xl">
                <svg className="absolute w-full h-full -rotate-90 pointer-events-none">
                    <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary transition-all duration-1000 ease-linear"
                        strokeDasharray={2 * Math.PI * 130}
                        strokeDashoffset={2 * Math.PI * 130 * (1 - progressPercent / 100)}
                        strokeLinecap="round"
                    />
                </svg>

                <div className="text-5xl font-mono font-bold tracking-wider z-10 tabular-nums">
                    {formatTime(secondsStudied)}
                </div>
                <div className="text-sm text-slate-400 mt-2 z-10 flex items-center gap-2">
                    {progressPercent >= 100 ? <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14}/> Completed</span> : `${t.target}: ${targetMinutes}m`}
                </div>
            </div>
        </div>

        {/* CONTROLS */}
        <div className="flex justify-center gap-6 mb-10">
            <button 
                onClick={() => setIsRunning(!isRunning)}
                disabled={progressPercent >= 100}
                className={`p-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 
                  ${progressPercent >= 100 ? 'bg-green-500 text-white cursor-default' : 
                    isRunning ? 'bg-slate-700 text-red-400 hover:bg-slate-600' : 'bg-primary text-white hover:bg-purple-500 hover:shadow-purple-500/40'}`}
            >
                {progressPercent >= 100 ? <CheckCircle size={32} /> : isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveModal('shop')} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-primary/50 transition group flex flex-col items-center gap-2">
                <ShoppingBag className="text-accent group-hover:scale-110 transition" />
                <span className="font-semibold text-sm">{t.shop}</span>
            </button>
            <button onClick={() => setActiveModal('settings')} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-blue-500/50 transition group flex flex-col items-center gap-2">
                <Settings className="text-blue-400 group-hover:rotate-90 transition" />
                <span className="font-semibold text-sm">{t.settings}</span>
            </button>
        </div>
      </main>

      {/* --- MODAL SHOP --- */}
      {activeModal === 'shop' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag size={20} className="text-accent"/> {t.shop}</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Wallet Info */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-4 rounded-xl flex justify-between items-center mb-6">
                <span className="text-yellow-400 font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">©</span> {coins} {t.coins}
                </span>
                <span className="text-xs text-slate-400">1 min = {COINS_PER_MINUTE} coin</span>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {SHOP_ITEMS.map((item) => (
                  <div key={item.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5 hover:border-white/20 transition">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-lg">{item.icon}</div>
                      <div>
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{item.desc}</p>
                        <p className="text-xs text-accent mt-1">{t.owned}: {inventory[item.id] || 0}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleBuy(item.id, item.price)}
                        className="px-3 py-1 bg-white/10 hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        {item.price} ©
                      </button>
                      {/* Nút Sử dụng nếu đã có (chỉ cho Time Reducer) */}
                      {item.id === 'reduce' && (inventory[item.id] || 0) > 0 && (
                        <button onClick={() => handleUseItem('reduce')} className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg text-xs font-bold transition">
                          {t.use}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL SETTINGS (Giữ nguyên logic cũ) --- */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{t.settings}</h2>
                  <button onClick={() => setActiveModal(null)}><X size={20}/></button>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-2">{t.changeTarget} (min)</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={newTargetInput}
                            onChange={(e) => setNewTargetInput(Number(e.target.value))}
                            className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-primary transition"
                        />
                        <button 
                            onClick={() => {
                                const now = Date.now();
                                const diff = differenceInDays(now, lastTargetUpdate);
                                if (diff < 7) {
                                  alert(`${t.waitMsg} ${7 - diff} ${t.days}`);
                                  return;
                                }
                                setTargetMinutes(newTargetInput);
                                setLastTargetUpdate(now);
                                setActiveModal(null);
                                alert("Updated!");
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition ${differenceInDays(Date.now(), lastTargetUpdate) >= 7 ? 'bg-primary hover:bg-purple-500' : 'bg-slate-700 cursor-not-allowed text-slate-400'}`}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}