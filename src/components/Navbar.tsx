import React from 'react';
import { PlayerProfile } from '../types';
import { 
  Coins, 
  Gem, 
  Zap, 
  Trophy, 
  Database, 
  UserCog, 
  ShoppingBag, 
  ArrowLeftRight, 
  Gift, 
  Award, 
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { NATIONAL_TEAMS } from '../data/mockData';

interface NavbarProps {
  player: PlayerProfile;
  activeTab: 'career' | 'store' | 'transfers' | 'quests' | 'leaderboard' | 'social' | 'tournament';
  onSelectTab: (tab: 'career' | 'store' | 'transfers' | 'quests' | 'leaderboard' | 'social' | 'tournament') => void;
  onOpenCustomizer: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  player,
  activeTab,
  onSelectTab,
  onOpenCustomizer,
  onResetData,
}) => {
  const nationalTeam = NATIONAL_TEAMS.find((t) => t.code === player.countryCode) || NATIONAL_TEAMS[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top tier status & resources */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Player Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                SCC STR <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">HERO STAR</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">{player.name}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>{nationalTeam.flag}</span>
                <span>{player.nationality}</span>
              </span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{player.currentClub}</span>
            </div>
          </div>
        </div>

        {/* Resources & Save Status */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Energy */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-full border border-slate-700 text-xs font-bold text-amber-400 shadow-inner">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{player.energy} / {player.maxEnergy} Enerji</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/40 rounded-full border border-amber-500/30 text-xs font-extrabold text-amber-400 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{player.coins.toLocaleString()} €</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/40 rounded-full border border-cyan-500/30 text-xs font-extrabold text-cyan-400 shadow-inner">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span>{player.gems}</span>
          </div>

          {/* Real-time DB indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/50 rounded-full border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anlık Kayıt Aktif</span>
          </div>

          {/* Customize player button */}
          <button
            onClick={onOpenCustomizer}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
            title="Oyuncuyu Özelleştir & Ülke Seç"
          >
            <UserCog className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Oyuncuyu Düzenle</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-2 flex items-center justify-between overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectTab('career')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'career'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Kariyer Sahası</span>
            </button>

            <button
              onClick={() => onSelectTab('transfers')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'transfers'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transfer Pazarı</span>
            </button>

            <button
              onClick={() => onSelectTab('store')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'store'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Mağaza & Forma</span>
            </button>

            <button
              onClick={() => onSelectTab('quests')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'quests'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Günlük Görev & Ödül</span>
            </button>

            <button
              onClick={() => onSelectTab('tournament')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'tournament'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Kupa Turnuvası</span>
            </button>

            <button
              onClick={() => onSelectTab('leaderboard')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Skor Tablosu</span>
            </button>

            <button
              onClick={() => onSelectTab('social')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'social'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Topluluk & Davet</span>
            </button>
          </div>

          {/* Reset Save Data */}
          <button
            onClick={onResetData}
            className="text-[11px] text-slate-500 hover:text-red-400 transition flex items-center gap-1 px-2 py-1"
            title="Sıfırdan Yeni Kariyer Başlat"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden lg:inline">Yeni Kariyer</span>
          </button>
        </div>
      </div>
    </header>
  );
};
