"use client";

import React, { useState } from 'react';
import { ShoppingBag, Briefcase, X, Clock, Snowflake, Check, Lock } from 'lucide-react';
import Avatar, { SKINS_CONFIG } from './Avatar';
import { supabase } from '@/lib/supabaseClient';

// Danh sách vật phẩm Shop
const ITEMS_SHOP = [
  { id: 'freeze', name: 'Streak Freeze', price: 500, icon: <Snowflake className="text-blue-400" />, desc: 'Bảo lưu chuỗi khi quên học.' },
  { id: 'reduce_30', name: 'Time Reducer', price: 300, icon: <Clock className="text-pink-400" />, desc: 'Giảm 30 phút mục tiêu hôm nay.' },
];

// Danh sách Skin Shop
const SKINS_SHOP = [
  { id: 'cap', type: 'hat', name: 'Mũ lưỡi trai', price: 1000 },
  { id: 'crown', type: 'hat', name: 'Vương miện', price: 5000 },
  { id: 'tie', type: 'shirt', name: 'Cà vạt đỏ', price: 800 },
  { id: 'scarf', type: 'shirt', name: 'Khăn len', price: 1200 },
];

interface Props {
  user: any;
  userData: any; // Chứa coins, inventory, equipped_skin, owned_skins
  onClose: () => void;
  onUpdateData: () => void; // Refresh lại data sau khi mua/dùng
  targetMinutes: number;                 // <-- Phải có dòng này
  setTargetMinutes: (m: number) => void;
  onAddStudyTime: (seconds: number) => void; 
}

export default function ShopInventory({ user, userData, onClose, onUpdateData, targetMinutes, setTargetMinutes, onAddStudyTime }: Props) {
  const [activeTab, setActiveTab] = useState<'items' | 'skins' | 'inventory'>('items');
  const [loading, setLoading] = useState(false);

  // --- LOGIC MUA SKIN ---
  const handleBuySkin = async (skinId: string, price: number) => {
    if (userData.coins < price) { alert("Không đủ tiền!"); return; }
    setLoading(true);

    // Update DB: Trừ tiền, Thêm skin vào mảng owned_skins
    const newOwned = [...(userData.owned_skins || []), skinId];
    
    const { error } = await supabase.from('users').update({
      coins: userData.coins - price,
      owned_skins: newOwned
    }).eq('id', user.id);

    if (!error) {
      alert("Mua thành công!");
      onUpdateData();
    }
    setLoading(false);
  };

  // --- LOGIC MẶC SKIN (EQUIP) ---
  const handleEquip = async (type: 'hat' | 'shirt', value: string) => {
    const newSkin = { ...userData.equipped_skin, [type]: value };
    await supabase.from('users').update({ equipped_skin: newSkin }).eq('id', user.id);
    onUpdateData();
  };

  // --- LOGIC DÙNG VẬT PHẨM ---
  const handleUseItem = async (itemId: string) => {
    if ((userData.inventory?.[itemId] || 0) <= 0) return;

    if (itemId === 'reduce_30') {
      // Logic cũ: setTargetMinutes(targetMinutes - 30); -> BỎ CÁI NÀY ĐI HOẶC GIỮ NẾU MUỐN GIẢM CẢ TARGET

      // LOGIC MỚI: Cộng 30 phút (1800 giây) vào thời gian đã học
      onAddStudyTime(1800);
      
      // Update Server (Trừ 1 thẻ)
      const newInv = { ...userData.inventory, [itemId]: userData.inventory[itemId] - 1 };
      await supabase.from('users').update({ inventory: newInv }).eq('id', user.id);
      
      alert("Đã dùng thẻ! Thời gian học được cộng thêm 30 phút!");
      onUpdateData();
    }  else if (itemId === 'freeze') {
      alert("Thẻ Freeze sẽ tự động kích hoạt khi bạn lỡ quên học 1 ngày. Không cần bấm dùng!");
    }
  };

  // --- LOGIC MUA ITEM ---
  const handleBuyItem = async (itemId: string, price: number) => {
    if (userData.coins < price) { alert("Không đủ tiền!"); return; }
    
    const currentQty = userData.inventory?.[itemId] || 0;
    const newInv = { ...userData.inventory, [itemId]: currentQty + 1 };

    const { error } = await supabase.from('users').update({
      coins: userData.coins - price,
      inventory: newInv
    }).eq('id', user.id);

    if (!error) { alert("Mua thành công!"); onUpdateData(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl h-[700px] flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('items')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'items' ? 'bg-purple-500 text-white' : 'text-slate-400 bg-white/5'}`}>Vật phẩm</button>
            <button onClick={() => setActiveTab('skins')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'skins' ? 'bg-pink-500 text-white' : 'text-slate-400 bg-white/5'}`}>Trang phục</button>
            <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'inventory' ? 'bg-green-500 text-white' : 'text-slate-400 bg-white/5'}`}>Túi đồ</button>
          </div>
          <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-white"/></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
          
          {/* TAB 1: MUA ITEM */}
          {activeTab === 'items' && (
            <div className="grid grid-cols-1 gap-4">
              {ITEMS_SHOP.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-lg">{item.icon}</div>
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => handleBuyItem(item.id, item.price)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold text-sm">
                    {item.price} ©
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MUA & MẶC SKIN */}
          {activeTab === 'skins' && (
            <div>
              {/* Preview Nhân vật */}
              <div className="flex justify-center mb-8 bg-gradient-to-b from-purple-900/20 to-slate-900 rounded-2xl py-6 border border-white/5">
                 <Avatar 
                    color={userData.equipped_skin?.color || "#8b5cf6"} 
                    hat={userData.equipped_skin?.hat || "none"} 
                    shirt={userData.equipped_skin?.shirt || "none"} 
                    size={180}
                 />
              </div>

              <h3 className="text-slate-400 text-sm font-bold mb-4 uppercase">Đang bán</h3>
              <div className="grid grid-cols-2 gap-4">
                {SKINS_SHOP.map(skin => {
                  const isOwned = (userData.owned_skins || []).includes(skin.id);
                  const isEquipped = userData.equipped_skin?.[skin.type] === skin.id;

                  return (
                    <div key={skin.id} className="bg-slate-800 p-4 rounded-xl border border-white/5 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 relative">
                        {/* Render thử skin nhỏ */}
                        <Avatar color="#555" hat={skin.type === 'hat' ? skin.id : 'none'} shirt={skin.type === 'shirt' ? skin.id : 'none'} size={64}/>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm">{skin.name}</div>
                        
                        {isOwned ? (
                          <button 
                            onClick={() => handleEquip(skin.type as any, isEquipped ? 'none' : skin.id)}
                            className={`mt-2 w-full py-1 rounded text-xs font-bold ${isEquipped ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'}`}
                          >
                            {isEquipped ? <span className="flex items-center justify-center gap-1"><Check size={12}/> Đang mặc</span> : "Mặc"}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleBuySkin(skin.id, skin.price)}
                            disabled={loading}
                            className="mt-2 w-full bg-yellow-600 hover:bg-yellow-500 text-white py-1 rounded text-xs font-bold flex items-center justify-center gap-1"
                          >
                            {skin.price} ©
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TÚI ĐỒ (INVENTORY) */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Snowflake className="text-blue-400"/>
                    <div>
                        <h4 className="font-bold">Streak Freeze</h4>
                        <p className="text-xs text-slate-400">Số lượng: {userData.inventory?.freeze || 0}</p>
                    </div>
                 </div>
                 <button onClick={() => handleUseItem('freeze')} className="bg-slate-700 text-slate-400 px-4 py-2 rounded-lg text-xs font-bold">
                    Tự động
                 </button>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Clock className="text-pink-400"/>
                    <div>
                        <h4 className="font-bold">Time Reducer (-30p)</h4>
                        <p className="text-xs text-slate-400">Số lượng: {userData.inventory?.reduce_30 || 0}</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => handleUseItem('reduce_30')}
                    className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-xs font-bold"
                 >
                    Dùng ngay
                 </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}