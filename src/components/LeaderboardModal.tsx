import React from 'react';
import { LeaderboardEntry } from '../types';
import { Award, Trophy, Star, TrendingUp, Flag } from 'lucide-react';

interface LeaderboardModalProps {
  leaderboard: LeaderboardEntry[];
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ leaderboard }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Küresel Skor Tablosu & Reyting Sıralaması</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Avrupa & Süper Lig Yıldızları Liderlik Tablosu</h2>
          <p className="text-xs text-slate-400">
            Gol krallığı, reyting ortalaması ve piyasa değerine göre en iyi oyuncuların anlık sıralaması.
          </p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-extrabold uppercase text-slate-400 bg-slate-950/60">
                <th className="py-4 px-6">Sıra</th>
                <th className="py-4 px-6">Futbolcu & Milli Takım</th>
                <th className="py-4 px-6">Kulüp</th>
                <th className="py-4 px-6 text-center">Toplam Gol</th>
                <th className="py-4 px-6 text-center">Maç Reytingi</th>
                <th className="py-4 px-6 text-right">Piyasa Değeri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {leaderboard.map((entry) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <tr
                    key={entry.rank}
                    className={`transition hover:bg-slate-800/50 ${
                      entry.isUser ? 'bg-emerald-950/30 font-bold border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                          entry.rank === 1
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : entry.rank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : entry.rank === 3
                            ? 'bg-amber-700 text-amber-100'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {entry.rank}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white">{entry.name}</span>
                            {entry.isUser && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                SEN
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-semibold uppercase">
                            {entry.nationality}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-300">{entry.club}</span>
                    </td>

                    <td className="py-4 px-6 text-center font-black text-amber-400 text-base">
                      {entry.goals}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-extrabold text-xs">
                        {entry.rating} / 10
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-black text-white">
                      {entry.marketValueFormatted}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
