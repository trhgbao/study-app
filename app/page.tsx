"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ShoppingBag, Settings, LogOut, User, Gift, X } from 'lucide-react';
import NeonTimer from '@/components/NeonTimer';
import LuckyWheel from '@/components/LuckyWheel';
import AuthModal from '@/components/AuthModal'; // Import mới
import { supabase } from '@/lib/supabaseClient'; // Import supabase
import SocialModal from '@/components/SocialModal';
import { Users } from 'lucide-react';
import Avatar from '@/components/Avatar';
import ShopInventory from '@/components/ShopInventory';
import FireStreak from '@/components/FireStreak';
import { motion } from "framer-motion";
import BannerAd from '@/components/BannerAd';
import RewardedAd from '@/components/RewardedAd';
import { PlaySquare } from 'lucide-react'; 

// --- CONFIG ---
const INITIAL_TARGET = 120; 

export default function StudyApp() {
  // --- USER STATE ---
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>({ coins: 0, avatar_url: '', username: 'Guest' });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSocial, setShowSocial] = useState(false); 
  const [targetMinutes, setTargetMinutes] = useState(120);
  const [showSettings, setShowSettings] = useState(false); 
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  // --- APP STATE ---
  const [isRunning, setIsRunning] = useState(false);
  const [secondsStudied, setSecondsStudied] = useState(0);
  const [showWheel, setShowWheel] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [tempTarget, setTempTarget] = useState(120);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadTodayProgress = async () => {
      const todayStr = new Date().toISOString().split('T')[0]; // Lấy ngày dạng YYYY-MM-DD
      
      const { data } = await supabase
        .from('study_sessions')
        .select('total_seconds')
        .eq('user_id', user.id)
        .eq('study_date', todayStr)
        .single();

      if (data) {
        setSecondsStudied(data.total_seconds); // Khôi phục thời gian đã học
      } else {
        setSecondsStudied(0); // Ngày mới chưa học gì
      }
    };

    loadTodayProgress();
  }, [user]);

  // --- 2. HÀM LƯU THỜI GIAN (TỰ ĐỘNG LƯU) ---
  // Sửa lại useEffect của Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSecondsStudied((prev) => {
          const newValue = prev + 1;

          // Logic tự động lưu mỗi 10 giây (Giữ nguyên logic cũ của bạn)
          if (newValue % 10 === 0 && user) {
             const todayStr = new Date().toISOString().split('T')[0];
             supabase.from('study_sessions').upsert({
                user_id: user.id,
                study_date: todayStr,
                total_seconds: newValue
             }, { onConflict: 'user_id, study_date' }).then(({ error }) => {
                if (error) console.error("Lỗi lưu giờ:", error);
             });
          }
          return newValue;
        });
      }, 1000);
    }

    // Hàm dọn dẹp: Chạy khi component unmount hoặc isRunning đổi trạng thái
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, user]);

  // 1. Kiểm tra đăng nhập khi vào web
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setShowAuthModal(true); // Chưa đăng nhập thì hiện Modal luôn
      }
    };
    checkSession();

    // Lắng nghe sự kiện đăng nhập/đăng xuất
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
        setShowAuthModal(false);
      } else {
        setUser(null);
        setUserData({ coins: 0, avatar_url: '', username: 'Guest' });
        setShowAuthModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

// --- LOGIC TỰ ĐỘNG CỘNG STREAK (Ngay khi đủ giờ & Chỉ 1 lần/ngày) ---
  useEffect(() => {
      // Hàm xử lý
      const checkAndAddStreak = async () => {
          if (!user || !userData) return;
          
          const totalTargetSeconds = targetMinutes * 60;
          const todayStr = new Date().toISOString().split('T')[0];

          // NẾU: Đã học đủ giờ VÀ Ngày cập nhật Streak cuối cùng KHÁC hôm nay
          if (secondsStudied >= totalTargetSeconds && userData.last_completed_date !== todayStr) {
              
              const newStreak = (userData.current_streak || 0) + 1;

              // 1. Cập nhật hiển thị (UI) ngay lập tức
              setUserData((prev: any) => ({ 
                  ...prev, 
                  current_streak: newStreak, 
                  last_completed_date: todayStr 
              }));

              // Bắn pháo giấy chúc mừng (Nếu bạn đã cài canvas-confetti)
              alert(`🎉 TUYỆT VỜI! Đã đạt mục tiêu. Streak của bạn là ${newStreak} ngày!`);

              // 2. Cập nhật Database (Supabase)
              await supabase.from('users').update({
                  current_streak: newStreak,
                  last_completed_date: todayStr
              }).eq('id', user.id);
          }
      };

      checkAndAddStreak();
  }, [secondsStudied, targetMinutes, user, userData]); // Chạy kiểm tra mỗi khi số giây thay đổi

  // 2. Hàm lấy dữ liệu game (Coins, Avatar...)
const fetchUserData = async (userId: string) => {
    // Lấy thông tin User & Cài đặt
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userData) {
        setUserData(userData);
        
        if (userData.daily_target_minutes) {
            setTargetMinutes(userData.daily_target_minutes); 
        }
        // -----------------------------------
    }

    // Lấy thời gian đã học hôm nay
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: sessionData } = await supabase
        .from('study_sessions')
        .select('total_seconds')
        .eq('user_id', userId)
        .eq('study_date', todayStr)
        .single();
        
    if (sessionData) {
        setSecondsStudied(sessionData.total_seconds);
    }
  };

// Hàm này tự động chạy khi video quảng cáo xem xong
  const handleRewardEarned = async () => {
    if (!user) return;
    
    // 1. Cộng hiển thị ngay
    setUserData((prev: any) => ({ ...prev, coins: (prev.coins || 0) + 100 }));
    
    // 2. Gọi Supabase lưu tiền (Dùng hàm RPC cũ đã viết)
    await supabase.rpc('increment_coins', { 
        amount: 100, 
        user_id: user.id 
    });
  };

  const saveProgress = async (seconds: number) => {
      if (!user) return;
      const todayStr = new Date().toISOString().split('T')[0];
      
      await supabase.from('study_sessions').upsert({
        user_id: user.id,
        study_date: todayStr,
        total_seconds: seconds
      }, { onConflict: 'user_id, study_date' });
  };

  // --- LOGIC TIMER CHUẨN (Fix lỗi 2s) ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setSecondsStudied((prev) => {
          const newValue = prev + 1;
          
          // Tự động lưu mỗi 5 giây
          if (newValue % 2 === 0 && user) {
             const todayStr = new Date().toISOString().split('T')[0];
             // Gọi hàm update không cần await để tránh lag UI
             supabase.from('study_sessions').upsert({
                user_id: user.id,
                study_date: todayStr,
                total_seconds: newValue
             }, { onConflict: 'user_id, study_date' }).then();
          }

          if (newValue % 60 === 0 && user) {
             // 1. Cộng hiển thị ngay cho vui mắt
             setUserData((u: any) => ({ ...u, coins: (u.coins || 0) + 1 }));
             
             // 2. Gọi Supabase cộng thật vào DB (Dùng hàm RPC đã tạo)
             supabase.rpc('increment_coins', { 
                amount: 1, 
                user_id: user.id 
             }).then(({ error }) => {
                if (error) console.error("Lỗi cộng xu:", error);
             });
          }
          
          return newValue;
        });
      }, 1000);
    }

    // DỌN DẸP (BẮT BUỘC)
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, user]);

  const handleAddStudyTime = async (addedSeconds: number) => {
      // 1. Cộng vào state hiện tại
      const newTotal = secondsStudied + addedSeconds;
      setSecondsStudied(newTotal);

      // 2. Lưu ngay vào Database
      if (user) {
        const todayStr = new Date().toISOString().split('T')[0];
        await supabase.from('study_sessions').upsert({
            user_id: user.id,
            study_date: todayStr,
            total_seconds: newTotal
        }, { onConflict: 'user_id, study_date' });
      }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setUserData({ coins: 0, current_streak: 0 }); // Xóa data trên màn hình
      setIsRunning(false); // Dừng đồng hồ
      alert("Đã đăng xuất thành công!");
    }
  };

  const handleSpinStart = async () => {
    // 1. Check tiền (Local)
    if (userData.coins < 100) {
        alert("Không đủ tiền!");
        return;
    }

    // 2. Trừ hiển thị ngay cho mượt (Optimistic UI)
    setUserData((prev: any) => ({ ...prev, coins: prev.coins - 100 }));

    // 3. GỌI SUPABASE (QUAN TRỌNG)
    const { error } = await supabase.rpc('increment_coins', { 
        amount: -100,      // Khớp với tên tham số SQL
        user_id: user.id   // Khớp với tên tham số SQL
    });

    if (error) {
        console.error("Lỗi Supabase:", error); 
        alert("Lỗi kết nối! " + error.message);
        // Hoàn tiền nếu lỗi
        setUserData((prev: any) => ({ ...prev, coins: prev.coins + 100 }));
    } else {
        console.log("Đã trừ 100 xu trên Database thành công!");
    }
  };


  const handleWheelWin = async (reward: any) => {
    // Chờ 0.5s cho cảm giác mượt
    setTimeout(async () => {
        alert(`🎉 Bạn nhận được: ${reward.label}`);
        
        // --- TRƯỜNG HỢP 1: TRÚNG 50 XU ---
      if (reward.id === 'coin_50') {
          // Cộng hiển thị
          setUserData((prev: any) => ({ ...prev, coins: prev.coins + 50 }));
          
          // Cộng Database
          await supabase.rpc('increment_coins', { 
              amount: 50, 
              user_id: user.id 
          });
      }
        
        // --- TRƯỜNG HỢP 2: TRÚNG VẬT PHẨM ---
        else if (reward.id === 'freeze' || reward.id === 'reduce_30') {
            // Lấy số lượng cũ
            const currentQty = userData.inventory?.[reward.id] || 0;
            const newInventory = { ...userData.inventory, [reward.id]: currentQty + 1 };

            // Cập nhật hiển thị
            setUserData((prev: any) => ({ ...prev, inventory: newInventory }));

            // Cập nhật Database
            await supabase
                .from('users')
                .update({ inventory: newInventory })
                .eq('id', user.id);
        }
        
    }, 500);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500 overflow-hidden relative flex flex-col">
      
      {/* 1. BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* --- BANNER QUẢNG CÁO TRÊN CÙNG --- */}
      <div className="relative z-10">
          <BannerAd />
      </div>

      {/* 2. HEADER (Giữ nguyên) */}
      <header className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20">S</div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">StudyFocus</h1>
        </div>
        
        <div className="flex gap-4 items-center">
            {/* Coin Badge */}
            <div className="bg-slate-900/80 border border-yellow-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition" onClick={() => setShowWheel(true)}>
                <span className="text-yellow-400 font-bold text-lg">©</span>
                <span className="font-mono font-bold">{userData.coins || 0}</span>
            </div>
            
            {/* Avatar & User */}
            {user ? (
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 rounded-full backdrop-blur-md">
                    {/* Hiển thị Avatar vector */}
                    <div className="w-8 h-8 rounded-full border border-purple-500/50 overflow-hidden bg-slate-800 flex-shrink-0">
                        <Avatar size={32} color={userData.equipped_skin?.color} hat={userData.equipped_skin?.hat} shirt={userData.equipped_skin?.shirt} />
                    </div>
                    {/* Tên User */}
                    <span className="text-sm font-semibold max-w-[80px] truncate hidden sm:block text-slate-200">
                        {userData.username}
                    </span>
                    {/* NÚT ĐĂNG XUẤT (ĐÃ THÊM LẠI) */}
                    <button 
                        onClick={handleLogout} 
                        className="ml-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="Đăng xuất"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setShowAuthModal(true)} 
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-purple-500/20"
                >
                    Đăng nhập
                </button>
            )}
        </div>
      </header>

{/* 3. MAIN CONTENT (LAYOUT 3 CỘT) */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto flex items-center justify-center px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 w-full items-center gap-8">
            
            {/* CỘT TRÁI: NHÂN VẬT NHẢY MÚA */}
            <div className="flex flex-col items-center justify-center order-2 md:order-1">
                {user ? (
                    <div className="relative">
                        {/* Hiệu ứng sàn nhảy */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-black/40 blur-xl rounded-full"></div>
                        
                        {/* Nhân vật nhảy (Framer Motion) */}
                        <motion.div
                            animate={{ 
                                y: [0, -15, 0], // Nhảy lên xuống
                                rotate: [0, -5, 5, 0], // Lắc lư trái phải
                                scale: [1, 1.05, 1] // Phập phồng
                            }}
                            transition={{ 
                                duration: 2, // Nhịp điệu (2 giây 1 nhịp)
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                        >
                            <Avatar 
                                size={220} // Size to lên
                                color={userData.equipped_skin?.color} 
                                hat={userData.equipped_skin?.hat} 
                                shirt={userData.equipped_skin?.shirt} 
                            />
                        </motion.div>
                        
                        <div className="mt-6 bg-white/10 px-4 py-1 rounded-full text-sm font-bold border border-white/10 backdrop-blur-md text-center">
                            {userData.username}
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm">Đăng nhập để xem Avatar</div>
                )}
            </div>

{/* CỘT GIỮA: ĐỒNG HỒ & NÚT (CENTER) */}
            <div className="flex flex-col items-center justify-center order-1 md:order-2 w-full relative">
                
                {/* 1. ĐỒNG HỒ */}
                <div className="relative z-10">
                    <NeonTimer 
                        seconds={secondsStudied} 
                        targetMinutes={targetMinutes} 
                        isRunning={isRunning} 
                    />
                </div>

                {/* 2. KHU VỰC CÁC NÚT ĐIỀU KHIỂN (Đã căn chỉnh lại khoảng cách) */}
                <div className="flex flex-col items-center gap-6 mt-2 relative z-20">
                    
                    {/* Nút Play/Pause (Đã phóng to lên w-24 h-24 để cân xứng với Timer) */}
                    <button 
                        onClick={() => {
                            if (!user) { setShowAuthModal(true); return; }
                            const newStatus = !isRunning;
                            setIsRunning(newStatus);
                            if (!newStatus) saveProgress(secondsStudied);
                        }}
                        className={`group relative flex items-center justify-center w-24 h-24 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                            isRunning 
                            ? 'bg-slate-800 ring-4 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                            : 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-[0_0_40px_rgba(168,85,247,0.5)]'
                        }`}
                    >
                        {isRunning ? (
                            <Pause size={40} className="text-red-400 fill-current" />
                        ) : (
                            <Play size={40} className="text-white fill-current ml-2" />
                        )}
                    </button>

                    {/* Nút Vòng Quay */}
                    <button 
                        onClick={() => setShowWheel(true)}
                        className="flex items-center gap-3 bg-slate-800/80 border border-white/10 px-8 py-3.5 rounded-2xl hover:bg-slate-700 hover:border-pink-500/50 transition duration-300 group backdrop-blur-md shadow-xl"
                    >
                        <div className="p-2 rounded-full bg-slate-900 text-pink-400 group-hover:text-white group-hover:bg-pink-500 transition shadow-inner">
                            <Gift size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-sm tracking-wide text-white">Vòng quay</span>
                            <span className="block text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Thử vận may</span>
                        </div>
                    </button>

                    {/* NÚT KIẾM TIỀN (XEM QUẢNG CÁO) */}
                    {user && (
                        <button 
                            onClick={() => setShowRewardedAd(true)}
                            className="flex items-center gap-2 text-xs font-bold text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 px-4 py-2 rounded-full border border-yellow-400/20 transition mt-2"
                        >
                            <PlaySquare size={14} />
                            Hết Xu? Xem QC nhận +100©
                        </button>
                    )}

                </div>
            </div>

            {/* CỘT PHẢI: STREAK LỬA */}
            <div className="flex flex-col items-center justify-center order-3 md:order-3">
                 <FireStreak days={userData.current_streak || 0} />
            </div>

        </div>
      </main>

      {/* 4. BOTTOM MENU (Thanh điều hướng dưới cùng) */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md border-t border-white/5 p-4 pb-6">
        <div className="flex justify-around items-center max-w-md mx-auto">
            
            {/* Nút Shop */}
            <button onClick={() => setShowShop(true)} className="flex flex-col items-center gap-1 text-slate-400 hover:text-purple-400 transition group">
                <ShoppingBag size={24} className="group-hover:-translate-y-1 transition"/>
                <span className="text-[10px] font-bold uppercase tracking-wide">Cửa hàng</span>
            </button>

            {/* Nút Xếp hạng */}
            <button onClick={() => setShowSocial(true)} className="flex flex-col items-center gap-1 text-slate-400 hover:text-yellow-400 transition group">
                <div className="relative">
                    <Users size={24} className="group-hover:-translate-y-1 transition"/>
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Xếp hạng</span>
            </button>

            {/* Nút Cài đặt (Đã sửa onClick) */}
            <button onClick={() => { setTempTarget(targetMinutes);  setShowSettings(true);}} className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition group">
                <Settings size={24} className="group-hover:rotate-90 transition"/>
                <span className="text-[10px] font-bold uppercase tracking-wide">Cài đặt</span>
            </button>
        </div>
      </div>

      {/* --- KHU VỰC MODAL (POPUP) --- */}
      
      {/* 1. Modal Shop (Code cũ của bạn) */}
      {showShop && user && (
        <ShopInventory
          user={user}
          userData={userData}
          onClose={() => setShowShop(false)}
          onUpdateData={() => fetchUserData(user.id)}
          targetMinutes={targetMinutes}
          setTargetMinutes={setTargetMinutes}
          onAddStudyTime={handleAddStudyTime}
        />
      )}

      {/* 2. Modal Vòng quay (Lucky Wheel) */}
      {showWheel && (
        <LuckyWheel
          onClose={() => setShowWheel(false)}
          canSpin={userData.coins >= 100} 
          onSpinStart={handleSpinStart}
          onWin={handleWheelWin}
        />
      )}

        {/* Modal Xem Quảng Cáo */}
      {showRewardedAd && (
          <RewardedAd 
              onClose={() => setShowRewardedAd(false)}
              onRewardEarned={handleRewardEarned}
          />
      )}

      {/* 3. Modal Xã hội (Social) */}
      {showSocial && user && (
        <SocialModal 
            isOpen={showSocial} 
            onClose={() => setShowSocial(false)} 
            currentUser={{ ...userData, id: user.id }}
        />
      )}

{/* 4. Modal Cài đặt */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative">
                
                {/* Header Modal */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="text-blue-400" size={20}/> Cài đặt mục tiêu
                    </h3>
                    <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>

                {/* Nội dung chính */}
                <div className="mb-6">
                    <label className="text-sm text-slate-400 mb-2 block font-semibold">
                        Mục tiêu hôm nay (Phút):
                    </label>
                    
                    <div className="flex gap-2 items-center">
                        <input 
                            type="number" 
                            value={tempTarget} // DÙNG BIẾN NHÁP
                            min={60}
                            onChange={(e) => setTempTarget(Number(e.target.value))} // SỬA BIẾN NHÁP
                            className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 w-full text-lg font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                        <span className="text-slate-500 font-bold">MIN</span>
                    </div>
                    
                    {/* Gợi ý nhanh */}
                    <div className="flex gap-2 mt-3">
                        {[60, 90, 120, 180].map(m => (
                            <button 
                                key={m}
                                onClick={() => setTempTarget(m)} // SỬA BIẾN NHÁP
                                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${tempTarget === m ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 hover:bg-white/5 text-slate-400 bg-slate-800/50'}`}
                            >
                                {m}p
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nút Action */}
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowSettings(false)} 
                        className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-semibold text-slate-300"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={async () => {
                            // 1. Check Min 60
                            if (tempTarget < 60) {
                                alert("Mục tiêu tối thiểu là 60 phút!");
                                return;
                            }
                            
                            // 2. CHECK LOGIC 7 NGÀY
                            if (userData.last_target_updated_at) {
                                const lastUpdate = new Date(userData.last_target_updated_at).getTime();
                                const now = Date.now();
                                const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
                                
                                if (daysSinceUpdate < 7) {
                                    const daysLeft = Math.ceil(7 - daysSinceUpdate);
                                    alert(`⛔ Bạn chỉ được đổi mục tiêu 1 lần mỗi tuần.\nVui lòng đợi thêm ${daysLeft} ngày nữa.`);
                                    return; // Bị chặn -> Không lưu, không đổi giao diện ngoài
                                }
                            }

                            // 3. Nếu qua ải thì cho phép LƯU
                            if (user) {
                                const todayIso = new Date().toISOString(); 
                                
                                const { error } = await supabase
                                    .from('users')
                                    .update({ 
                                        daily_target_minutes: tempTarget, // LƯU BIẾN NHÁP VÀO DB
                                        last_target_updated_at: todayIso 
                                    })
                                    .eq('id', user.id);
                                
                                if (!error) {
                                    // THÀNH CÔNG RỒI MỚI CẬP NHẬT GIAO DIỆN Ở NGOÀI
                                    setTargetMinutes(tempTarget); 
                                    setUserData((prev: any) => ({ ...prev, last_target_updated_at: todayIso }));
                                    
                                    alert("✅ Đã lưu cài đặt! Nhớ rằng tuần sau bạn mới được đổi lại nhé.");
                                    setShowSettings(false);
                                } else {
                                    alert("Lỗi DB: " + error.message);
                                }
                            }
                        }} 
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition font-bold text-white shadow-lg shadow-blue-500/20"
                    >
                        Lưu Thay Đổi
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 5. Modal Đăng nhập */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => user && setShowAuthModal(false)}
        onSuccess={(u) => setUser(u)}
      />
    </div>
  );
}