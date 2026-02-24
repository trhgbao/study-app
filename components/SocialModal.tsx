"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Users, Search, UserPlus, Crown, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export default function SocialModal({ isOpen, onClose, currentUser }: SocialModalProps) {
  const [activeTab, setActiveTab] = useState<'rank' | 'friends'>('rank');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Load dữ liệu khi mở Modal
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      fetchFriends();
    }
  }, [isOpen, activeTab]);

  // 1. Lấy Bảng xếp hạng (Top 10 Coin cao nhất)
  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('users')
      .select('username, avatar_url, coins, current_streak')
      .order('coins', { ascending: false })
      .limit(10);
    if (data) setLeaderboard(data);
  };

  // 2. Lấy danh sách bạn bè
  const fetchFriends = async () => {
    // Lấy những người mình đã follow
    const { data } = await supabase
      .from('friendships')
      .select('friend:users!friend_id(username, avatar_url, coins, current_streak, friend_code)')
      .eq('user_id', currentUser.id);
      
    if (data) setFriends(data.map((f: any) => f.friend));
  };

  // 3. Kết bạn bằng mã Code
  const handleAddFriend = async () => {
    if (!searchCode) return;
    setLoading(true);
    
    try {
        // Tìm user theo code
        const { data: foundUser } = await supabase
            .from('users')
            .select('id')
            .eq('friend_code', searchCode.toUpperCase())
            .single();

        if (!foundUser) {
            alert("Không tìm thấy mã này!");
            return;
        }

        if (foundUser.id === currentUser.id) {
            alert("Không thể kết bạn với chính mình!");
            return;
        }

        // Thêm vào bảng friendships
        const { error } = await supabase.from('friendships').insert({
            user_id: currentUser.id,
            friend_id: foundUser.id
        });

        if (error) throw error;
        
        alert("Đã thêm bạn thành công!");
        setSearchCode('');
        fetchFriends(); // Refresh list

    } catch (err) {
        alert("Bạn đã thêm người này rồi!");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl h-[600px] flex flex-col"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
           <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('rank')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'rank' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'text-slate-400 hover:text-white'}`}
              >
                <Trophy size={16}/> BXH
              </button>
              <button 
                onClick={() => setActiveTab('friends')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'friends' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'text-slate-400 hover:text-white'}`}
              >
                <Users size={16}/> Bạn bè
              </button>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            
            {/* TAB: LEADERBOARD */}
            {activeTab === 'rank' && (
                <div className="space-y-4">
                    {leaderboard.map((user, index) => (
                        <motion.div 
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-4 rounded-2xl border ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/10 border-yellow-500/50' : 
                                index === 1 ? 'bg-slate-800/80 border-slate-600' :
                                index === 2 ? 'bg-slate-800/80 border-orange-700/50' :
                                'bg-slate-900 border-white/5'
                            }`}
                        >
                            {/* RANK NUMBER */}
                            <div className={`font-black text-xl w-8 text-center ${
                                index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-slate-500'
                            }`}>
                                {index + 1}
                            </div>

                            {/* AVATAR */}
                            <div className="relative">
                                <img src={user.avatar_url} className="w-12 h-12 rounded-full bg-slate-800 object-cover" />
                                {index === 0 && <Crown size={20} className="absolute -top-3 -right-2 text-yellow-400 fill-yellow-400 animate-bounce" />}
                            </div>

                            {/* INFO */}
                            <div className="flex-1">
                                <h3 className="font-bold text-sm truncate max-w-[120px]">{user.username}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Zap size={12} className="text-orange-500"/> {user.current_streak} ngày
                                </div>
                            </div>

                            {/* SCORE */}
                            <div className="font-mono font-bold text-yellow-400">
                                {user.coins} ©
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* TAB: FRIENDS */}
            {activeTab === 'friends' && (
                <div>
                    {/* SEARCH BOX */}
                    <div className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-slate-500" size={18}/>
                            <input 
                                type="text"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                placeholder="Nhập mã (VD: 8X92A1)..." 
                                className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 transition uppercase"
                            />
                        </div>
                        <button 
                            onClick={handleAddFriend}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition"
                        >
                            <UserPlus size={20}/>
                        </button>
                    </div>

                    {/* MY CODE */}
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-center mb-6">
                        <p className="text-xs text-blue-300 mb-1">Mã kết bạn của tôi</p>
                        <p className="text-2xl font-mono font-bold tracking-widest text-blue-400 select-all cursor-pointer">
                            {currentUser.friend_code || "LOADING..."}
                        </p>
                    </div>

                    {/* FRIEND LIST */}
                    <div className="space-y-3">
                        {friends.length === 0 ? (
                            <div className="text-center text-slate-500 py-10">Chưa có bạn bè nào.<br/>Hãy thêm mã của bạn bè!</div>
                        ) : (
                            friends.map((friend, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={friend.avatar_url} className="w-10 h-10 rounded-full bg-slate-800" />
                                            {/* Giả lập trạng thái Online (xanh lá) */}
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{friend.username}</h4>
                                            <span className="text-xs text-slate-400">Chuỗi: {friend.current_streak} 🔥</span>
                                        </div>
                                    </div>
                                    <span className="text-yellow-400 font-bold text-sm">{friend.coins} ©</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}