import React from 'react';
import { Tournament, TournamentMatch, MatchScenario } from '../types';
import { Trophy, Play, CheckCircle2, Sparkles, Coins, Gem, Award, ShieldAlert, ArrowRight } from 'lucide-react';

interface TournamentModalProps {
  tournament: Tournament | null;
  onStartNewTournament: (type: 'national' | 'club') => void;
  onPlayTournamentMatch: (match: TournamentMatch, matchIndex: number) => void;
  onClaimTrophyReward: () => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  tournament,
  onStartNewTournament,
  onPlayTournamentMatch,
  onClaimTrophyReward,
}) => {
  if (!tournament) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight">Kupa ve Turnuva Modu</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2">
            Milli takımını veya kulübünü temsil ederek zorlu eleme maçlarına çık. Şampiyon ol ve efsanevi kupa ödüllerinin sahibi ol!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
            {/* National Cup Option */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition text-left flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                  MİLLİ TAKIM TURNUVASI
                </span>
                <h3 className="text-xl font-black text-white mt-3">Avrupa / Dünya Kupası</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ülkenin formasıyla grup ve eleme maçlarını kazanarak kupayı kaldır.
                </p>
                <div className="flex items-center gap-3 mt-4 text-xs font-bold">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    +5,000 Altın
                  </span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5" />
                    +100 Elmas
                  </span>
                </div>
              </div>

              <button
                onClick={() => onStartNewTournament('national')}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg"
              >
                Milli Kupaya Başla
              </button>
            </div>

            {/* Club Champions Cup Option */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition text-left flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  KULÜP TURNUVASI
                </span>
                <h3 className="text-xl font-black text-white mt-3">Şampiyonlar Kupası</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Avrupa'nın en büyük devlerine karşı mücadele et ve kulübünü zirveye taşı.
                </p>
                <div className="flex items-center gap-3 mt-4 text-xs font-bold">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    +6,000 Altın
                  </span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5" />
                    +120 Elmas
                  </span>
                </div>
              </div>

              <button
                onClick={() => onStartNewTournament('club')}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20"
              >
                Kulüp Kupasına Başla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Tournament Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Aktif Turnuva Macerası</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">{tournament.name}</h2>
          <p className="text-xs text-slate-400">
            Adım adım rakipleri ele, finalde büyük zaferi ve ödülleri kazan!
          </p>
        </div>

        {tournament.wonTrophy ? (
          <button
            onClick={onClaimTrophyReward}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Kupa Ödülünü Al & Yeni Turnuvaya Başla</span>
          </button>
        ) : (
          <button
            onClick={() => onStartNewTournament(tournament.type)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
          >
            Turnuvayı Sıfırla
          </button>
        )}
      </div>

      {/* Bracket / Stages list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {tournament.matches.map((match, idx) => {
          const isCurrent = idx === tournament.currentMatchIndex && !tournament.isCompleted;
          const isPassed = match.played;

          return (
            <div
              key={idx}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition relative overflow-hidden ${
                isCurrent
                  ? 'bg-gradient-to-b from-slate-900 to-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : isPassed
                  ? 'bg-slate-950 border-slate-800 opacity-80'
                  : 'bg-slate-900/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                    {match.stage}
                  </span>
                  {isPassed && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      match.won ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {match.won ? 'KAZANDI' : 'ELENDİ'}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-white">vs {match.opponent}</h4>

                {isPassed && match.ourScore !== undefined && (
                  <div className="mt-3 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-black text-sm">
                    <span className="text-emerald-400">{match.ourScore}</span>
                    <span className="text-slate-500 mx-1">-</span>
                    <span className="text-slate-400">{match.opponentScore}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800">
                {isCurrent ? (
                  <button
                    onClick={() => onPlayTournamentMatch(match, idx)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Maça Çık</span>
                  </button>
                ) : isPassed ? (
                  <span className="block text-center text-xs font-bold text-slate-500 py-1">
                    Tamamlandı
                  </span>
                ) : (
                  <span className="block text-center text-xs font-semibold text-slate-600 py-1">
                    Kilitli
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
