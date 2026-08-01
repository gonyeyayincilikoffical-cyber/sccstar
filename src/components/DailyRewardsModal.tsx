import React from 'react';
import { DailyQuest, DailyLoginReward } from '../types';
import { Gift, CheckCircle2, Circle, Coins, Gem, Calendar, Sparkles, Award } from 'lucide-react';

interface DailyRewardsModalProps {
  quests: DailyQuest[];
  loginRewards: DailyLoginReward[];
  onClaimQuest: (questId: string) => void;
  onClaimLoginReward: (day: number) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  quests,
  loginRewards,
  onClaimQuest,
  onClaimLoginReward,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Daily Login Rewards Calendar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Günlük Giriş Bonusu Sistemi</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">7 Günlük Giriş Takvimi & Sadakat Ödülleri</h2>
            <p className="text-xs text-slate-400">
              Her gün uygulamaya girerek artan ödüller kazan. 7. günde efsanevi bonus seni bekliyor!
            </p>
          </div>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          {loginRewards.map((item) => {
            return (
              <div
                key={item.day}
                className={`rounded-2xl p-4 border flex flex-col items-center justify-between text-center transition relative overflow-hidden ${
                  item.claimed
                    ? 'bg-slate-950 border-slate-800 opacity-60'
                    : item.isCurrent
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-900/30 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-800/50 border-slate-700/80'
                }`}
              >
                <span className="text-[11px] font-extrabold uppercase text-slate-300">
                  {item.day}. GÜN
                </span>

                <div className="my-3 space-y-1">
                  <div className="flex items-center justify-center gap-1 font-black text-amber-400 text-sm">
                    <Coins className="w-4 h-4" />
                    <span>+{item.coins}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 font-bold text-cyan-400 text-xs">
                    <Gem className="w-3.5 h-3.5" />
                    <span>+{item.gems}</span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-400 block mb-2">
                  {item.label}
                </span>

                {item.claimed ? (
                  <span className="w-full py-1.5 rounded-lg bg-slate-800 text-slate-500 text-[11px] font-bold">
                    Alındı
                  </span>
                ) : item.isCurrent ? (
                  <button
                    onClick={() => onClaimLoginReward(item.day)}
                    className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold shadow-lg transition"
                  >
                    Ödülü Al
                  </button>
                ) : (
                  <span className="w-full py-1.5 rounded-lg bg-slate-800/80 text-slate-500 text-[11px] font-bold">
                    Kilitli
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Daily Quests List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4" />
            <span>Günlük Saha Görevleri</span>
          </div>
          <h3 className="text-xl font-black text-white mt-1">İlerlemeyi Teşvik Eden Görevler</h3>
          <p className="text-xs text-slate-400">
            Kariyer ve kupa maçlarında gol atarak görevleri tamamla, anında ödülleri topla.
          </p>
        </div>

        <div className="space-y-4">
          {quests.map((quest) => {
            const progressPercent = Math.min(100, Math.round((quest.current / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-white">{quest.title}</h4>
                    {quest.completed && !quest.claimed && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Tamamlandı!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{quest.description}</p>

                  {/* Progress bar */}
                  <div className="mt-3 max-w-sm">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-semibold">
                      <span>İlerleme:</span>
                      <span>
                        {quest.current} / {quest.target} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reward & Claim */}
                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  <div className="flex items-center gap-3 text-xs font-extrabold">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Coins className="w-4 h-4" />
                      +{quest.rewardCoins}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Gem className="w-3.5 h-3.5" />
                      +{quest.rewardGems}
                    </span>
                  </div>

                  {quest.claimed ? (
                    <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Alındı</span>
                    </span>
                  ) : quest.completed ? (
                    <button
                      onClick={() => onClaimQuest(quest.id)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
                    >
                      Ödülü Al
                    </button>
                  ) : (
                    <span className="px-4 py-2 rounded-xl bg-slate-800/80 text-slate-500 text-xs font-semibold">
                      Devam Ediyor
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
