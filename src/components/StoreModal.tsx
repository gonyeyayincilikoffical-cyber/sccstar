import React, { useState } from 'react';
import { PlayerProfile, StoreItem } from '../types';
import { STORE_ITEMS } from '../data/mockData';
import { ShoppingBag, Coins, Gem, Check, Shield, Award, Sparkles, Shirt, Footprints, Scissors } from 'lucide-react';

interface StoreModalProps {
  player: PlayerProfile;
  onBuyItem: (item: StoreItem) => void;
  onEquipItem: (item: StoreItem) => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({ player, onBuyItem, onEquipItem }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'jersey' | 'boot' | 'hair' | 'accessory'>('all');

  const filteredItems = STORE_ITEMS.filter(
    (item) => selectedCategory === 'all' || item.type === selectedCategory
  );

  const isOwned = (item: StoreItem) => {
    if (item.type === 'jersey') return player.inventory.jerseys.includes(item.id);
    if (item.type === 'boot') return player.inventory.boots.includes(item.id);
    if (item.type === 'accessory') return player.inventory.accessories.includes(item.id);
    return false;
  };

  const isEquipped = (item: StoreItem) => {
    if (item.type === 'jersey') return player.appearance.jerseyId === item.id;
    if (item.type === 'boot') return player.appearance.bootId === item.id;
    if (item.type === 'accessory') return player.appearance.accessoryId === item.id;
    return false;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top filter categories */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Futbolcu Mağazası & Ekipmanlar</span>
          </h2>
          <p className="text-xs text-slate-400">
            Kazanılan altın ve elmaslarla yeni formalar, kramponlar ve liderlik aksesuarları al!
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'jersey', label: 'Formalar' },
            { id: 'boot', label: 'Kramponlar' },
            { id: 'hair', label: 'Saç Stilleri' },
            { id: 'accessory', label: 'Aksesuarlar' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const owned = isOwned(item);
          const equipped = isEquipped(item);
          const canAfford =
            item.currency === 'coins' ? player.coins >= item.price : player.gems >= item.price;

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition ${
                equipped
                  ? 'bg-emerald-950/20 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {item.type === 'jersey' && 'Forma'}
                    {item.type === 'boot' && 'Krampon'}
                    {item.type === 'hair' && 'Saç Stili'}
                    {item.type === 'accessory' && 'Aksesuar'}
                  </span>

                  <div
                    className="w-6 h-6 rounded-full border border-white/20 shadow"
                    style={{ backgroundColor: item.color }}
                  />
                </div>

                <h3 className="text-lg font-black text-white">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>

                {item.statBonus && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.statBonus}</span>
                  </div>
                )}
              </div>

              {/* Price & Action */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {item.currency === 'coins' ? (
                    <Coins className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Gem className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="text-base font-black text-white">
                    {item.price} {item.currency === 'coins' ? 'Altın' : 'Elmas'}
                  </span>
                </div>

                {equipped ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Kuşanıldı</span>
                  </span>
                ) : owned ? (
                  <button
                    onClick={() => onEquipItem(item)}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700"
                  >
                    Kuşan
                  </button>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => onBuyItem(item)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      canAfford
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Satın Al
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
