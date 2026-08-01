import React from 'react';
import { PlayerProfile } from '../types';
import { NATIONAL_TEAMS, CLUBS } from '../data/mockData';
import { Trophy, Star, Shield, Share2, Award, Zap, Flag } from 'lucide-react';

interface PlayerCardProps {
  player: PlayerProfile;
  onShareCard?: () => void;
  size?: 'normal' | 'large';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onShareCard, size = 'normal' }) => {
  const nationalTeam = NATIONAL_TEAMS.find((t) => t.code === player.countryCode) || NATIONAL_TEAMS[0];
  const club = CLUBS.find((c) => c.name === player.currentClub) || CLUBS[0];

  // Derive card background style by rating
  const isLegendary = player.rating >= 85;
  const isElite = player.rating >= 78 && player.rating < 85;
  
  const cardGradient = isLegendary
    ? 'from-amber-400 via-yellow-500 to-amber-700 text-slate-950 border-amber-300 shadow-amber-500/30'
    : isElite
    ? 'from-slate-100 via-slate-300 to-slate-400 text-slate-900 border-slate-200 shadow-slate-400/20'
    : 'from-amber-800 via-amber-900 to-stone-900 text-amber-100 border-amber-700 shadow-amber-900/40';

  const avgRating = (player.stats.matchRatingSum / Math.max(1, player.stats.matchesPlayed)).toFixed(1);

  return (
    <div
      className={`relative rounded-3xl p-5 bg-gradient-to-b ${cardGradient} border-2 shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
        size === 'large' ? 'max-w-md w-full' : 'max-w-xs w-full'
      }`}
    >
      {/* Decorative top pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

      {/* Top row: Rating, Position, Nationality */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col items-center">
          <span className="text-4xl font-black tracking-tighter leading-none">{player.rating}</span>
          <span className="text-sm font-extrabold tracking-wider uppercase opacity-90 mt-0.5">
            {player.position}
          </span>
          <div className="w-8 h-0.5 bg-current opacity-40 my-1" />
          <div className="flex items-center gap-1 text-lg" title={nationalTeam.name}>
            <span>{nationalTeam.flag}</span>
          </div>
          <span className="text-[10px] font-bold tracking-tight uppercase opacity-80 mt-0.5">
            {nationalTeam.code}
          </span>
        </div>

        {/* Player Avatar Silhouette with customized colors */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-2">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* Jersey Body */}
            <div
              className="absolute bottom-0 w-20 h-16 rounded-t-2xl shadow-lg border border-black/20 flex items-center justify-center text-white font-black text-xl"
              style={{ backgroundColor: player.appearance.jerseyId.includes('gold') ? '#D97706' : '#E30A17' }}
            >
              <span>{player.appearance.number}</span>
            </div>

            {/* Head / Skin tone */}
            <div
              className="absolute bottom-12 w-14 h-14 rounded-full shadow-md border-2 border-black/10"
              style={{ backgroundColor: player.appearance.skinTone }}
            />

            {/* Hair style visual */}
            <div
              className="absolute bottom-20 w-14 h-6 rounded-t-full shadow-sm"
              style={{ backgroundColor: player.appearance.hairColor }}
            />

            {/* Boots icon indicator */}
            <div className="absolute bottom-1 right-2 w-6 h-6 rounded-full bg-slate-900/80 text-amber-400 flex items-center justify-center text-xs shadow">
              ⚽
            </div>
          </div>
        </div>

        {/* Club Emblem */}
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg border border-white/20"
            style={{ backgroundColor: club.logoColor }}
          >
            {club.name.slice(0, 3).toUpperCase()}
          </div>
          <span className="text-[10px] font-bold mt-1 text-center max-w-[60px] truncate opacity-90">
            {club.name}
          </span>
        </div>
      </div>

      {/* Name Band */}
      <div className="mt-3 text-center border-t border-b border-current/20 py-2 relative z-10">
        <h3 className="text-xl font-black uppercase tracking-wide truncate">{player.name}</h3>
        <p className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">
          {nationalTeam.name} Milli Oyuncusu
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-center relative z-10">
        <div className="bg-black/10 rounded-xl p-2 backdrop-blur-sm">
          <span className="block text-[11px] uppercase font-bold opacity-75">Gol</span>
          <span className="text-lg font-black">{player.stats.goals}</span>
        </div>
        <div className="bg-black/10 rounded-xl p-2 backdrop-blur-sm">
          <span className="block text-[11px] uppercase font-bold opacity-75">Asist</span>
          <span className="text-lg font-black">{player.stats.assists}</span>
        </div>
        <div className="bg-black/10 rounded-xl p-2 backdrop-blur-sm">
          <span className="block text-[11px] uppercase font-bold opacity-75">Puan</span>
          <span className="text-lg font-black">{avgRating}</span>
        </div>
      </div>

      {/* Market Value & Share Footer */}
      <div className="mt-3 pt-3 border-t border-current/20 flex items-center justify-between text-xs font-bold relative z-10">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span>Değer: {(player.marketValue / 1000000).toFixed(1)}M €</span>
        </div>

        {onShareCard && (
          <button
            onClick={onShareCard}
            className="px-3 py-1 rounded-lg bg-black/20 hover:bg-black/30 transition flex items-center gap-1 text-[11px]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Paylaş</span>
          </button>
        )}
      </div>
    </div>
  );
};
