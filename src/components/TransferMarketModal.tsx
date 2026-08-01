import React, { useState, useEffect } from 'react';
import { PlayerProfile, TransferOffer } from '../types';
import { generateTransferOffers } from '../services/storageService';
import { ArrowLeftRight, Check, Shield, Award, Coins, TrendingUp, AlertCircle, Sparkles, Building2 } from 'lucide-react';

interface TransferMarketModalProps {
  player: PlayerProfile;
  onAcceptTransfer: (offer: TransferOffer) => void;
}

export const TransferMarketModal: React.FC<TransferMarketModalProps> = ({ player, onAcceptTransfer }) => {
  const [offers, setOffers] = useState<TransferOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<TransferOffer | null>(null);
  const [negotiating, setNegotiating] = useState(false);

  useEffect(() => {
    // Generate fresh offers based on current rating
    setOffers(generateTransferOffers(player));
  }, [player.currentClub, player.rating]);

  const handleSignContract = (offer: TransferOffer) => {
    onAcceptTransfer(offer);
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Current Club & Contract Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Mevcut Kulüp Sözleşmesi</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">{player.currentClub}</h2>
            <p className="text-sm text-slate-400 font-medium">Lig: {player.currentLeague}</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
              <span className="block text-[11px] text-slate-400 uppercase font-bold">Haftalık Maaş</span>
              <span className="text-base font-black text-amber-400">{player.wage.toLocaleString()} € / hafta</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
              <span className="block text-[11px] text-slate-400 uppercase font-bold">Piyasa Değeri</span>
              <span className="text-base font-black text-emerald-400">{(player.marketValue / 1000000).toFixed(1)} M €</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
              <span className="block text-[11px] text-slate-400 uppercase font-bold">Kalan Sözleşme</span>
              <span className="text-base font-black text-white">{player.contractYearsRemaining} Yıl</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Market Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
            <span>Kulüplerden Gelen Resmi Transfer Teklifleri</span>
          </h3>
          <p className="text-xs text-slate-400">
            Avrupa ve Türkiye'den dev kulüpler performansını takip ediyor. Sözleşme imzalayarak yeni macerana başla!
          </p>
        </div>

        <button
          onClick={() => setOffers(generateTransferOffers(player))}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-bold border border-slate-700"
        >
          Pazarı Güncelle
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {offers.map((offer) => {
          const isEligible = player.rating >= offer.club.minRatingRequired;
          const isSelected = selectedOffer?.id === offer.id;

          return (
            <div
              key={offer.id}
              className={`rounded-3xl border p-5 transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Club top bar */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md border border-white/20"
                    style={{ backgroundColor: offer.club.logoColor }}
                  >
                    {offer.club.name.slice(0, 3).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {offer.club.league}
                  </span>
                </div>

                <h4 className="text-lg font-black text-white">{offer.club.name}</h4>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">{offer.role}</p>

                {/* Offer details */}
                <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Haftalık Maaş:</span>
                    <span className="font-bold text-amber-400">{offer.wage.toLocaleString()} €</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">İmza Bonusu (Peşin):</span>
                    <span className="font-bold text-emerald-400">+{offer.signingBonus.toLocaleString()} €</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sözleşme Süresi:</span>
                    <span className="font-bold text-white">{offer.contractYears} Yıl</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Min. Reyting Şartı:</span>
                    <span className={`font-bold ${isEligible ? 'text-emerald-400' : 'text-red-400'}`}>
                      {offer.club.minRatingRequired} OVR
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                {!isEligible ? (
                  <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-400 bg-red-950/30 rounded-xl border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    <span>Reyting Yetersiz ({player.rating}/{offer.club.minRatingRequired})</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSignContract(offer)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Sözleşmeyi İmzala & Transfer Ol</span>
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
