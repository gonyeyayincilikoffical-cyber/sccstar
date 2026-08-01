import React, { useState, useEffect } from 'react';
import {
  PlayerProfile,
  MatchScenario,
  StoreItem,
  DailyQuest,
  DailyLoginReward,
  LeaderboardEntry,
  TransferOffer,
  Tournament,
  TournamentMatch
} from './types';
import {
  loadPlayerProfile,
  savePlayerProfile,
  loadDailyQuests,
  saveDailyQuests,
  loadDailyLoginRewards,
  saveDailyLoginRewards,
  loadLeaderboard,
  loadTournament,
  saveTournament,
  resetAllData
} from './services/storageService';
import { MATCH_SCENARIOS, NATIONAL_TEAMS, CLUBS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { PlayerCard } from './components/PlayerCard';
import { PlayerCustomizerModal } from './components/PlayerCustomizerModal';
import { MatchCanvasModal } from './components/MatchCanvasModal';
import { TransferMarketModal } from './components/TransferMarketModal';
import { StoreModal } from './components/StoreModal';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SocialAndChatModal } from './components/SocialAndChatModal';
import { TournamentModal } from './components/TournamentModal';
import {
  Trophy,
  Play,
  Sparkles,
  Zap,
  Award,
  Globe,
  Coins,
  Gem,
  Newspaper,
  ChevronRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // State initialization from local storage
  const [player, setPlayer] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [quests, setQuests] = useState<DailyQuest[]>(() => loadDailyQuests());
  const [loginRewards, setLoginRewards] = useState<DailyLoginReward[]>(() => loadDailyLoginRewards());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadLeaderboard(player));
  const [tournament, setTournament] = useState<Tournament | null>(() => loadTournament());

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'career' | 'store' | 'transfers' | 'quests' | 'leaderboard' | 'social' | 'tournament'
  >('career');

  // Modals & scenario
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<MatchScenario | null>(null);
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Sync to storage on updates
  useEffect(() => {
    savePlayerProfile(player);
    setLeaderboard(loadLeaderboard(player));
  }, [player]);

  useEffect(() => {
    saveDailyQuests(quests);
  }, [quests]);

  useEffect(() => {
    saveDailyLoginRewards(loginRewards);
  }, [loginRewards]);

  useEffect(() => {
    saveTournament(tournament);
  }, [tournament]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle Player Customizer Save
  const handleSavePlayerProfile = (updated: PlayerProfile) => {
    setPlayer(updated);
    showToast(`Oyuncu bilgileri ve ${updated.nationality} Milli Takımı seçimi kaydedildi!`);
  };

  // Handle Transfer Market contract sign
  const handleAcceptTransfer = (offer: TransferOffer) => {
    setPlayer((prev) => ({
      ...prev,
      currentClub: offer.club.name,
      currentLeague: offer.club.league,
      wage: offer.wage,
      coins: prev.coins + offer.signingBonus,
      contractYearsRemaining: offer.contractYears,
    }));
    confetti({ particleCount: 100, spread: 70 });
    showToast(`TEBRİKLER! ${offer.club.name} kulübüne transfer oldun! +${offer.signingBonus.toLocaleString()} € İmza Bonusu`);
  };

  // Handle Store Buy
  const handleBuyItem = (item: StoreItem) => {
    if (item.currency === 'coins' && player.coins < item.price) {
      showToast('Yetersiz altın! Daha fazla kariyer maçı yap veya görevleri tamamla.', 'info');
      return;
    }
    if (item.currency === 'gems' && player.gems < item.price) {
      showToast('Yetersiz elmas! Günlük ödüllerden veya turnuvalardan kazanabilirsin.', 'info');
      return;
    }

    setPlayer((prev) => {
      const next = { ...prev };
      if (item.currency === 'coins') next.coins -= item.price;
      if (item.currency === 'gems') next.gems -= item.price;

      if (item.type === 'jersey') next.inventory.jerseys = [...next.inventory.jerseys, item.id];
      if (item.type === 'boot') next.inventory.boots = [...next.inventory.boots, item.id];
      if (item.type === 'accessory') next.inventory.accessories = [...next.inventory.accessories, item.id];

      return next;
    });

    showToast(`${item.name} satın alındı ve envantere eklendi!`);
  };

  // Handle Store Equip
  const handleEquipItem = (item: StoreItem) => {
    setPlayer((prev) => {
      const next = { ...prev, appearance: { ...prev.appearance } };
      if (item.type === 'jersey') next.appearance.jerseyId = item.id;
      if (item.type === 'boot') next.appearance.bootId = item.id;
      if (item.type === 'accessory') next.appearance.accessoryId = item.id;
      return next;
    });
    showToast(`${item.name} kuşanıldı!`);
  };

  // Handle Daily Quest Claim
  const handleClaimQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && q.completed && !q.claimed) {
          setPlayer((p) => ({
            ...p,
            coins: p.coins + q.rewardCoins,
            gems: p.gems + q.rewardGems,
          }));
          showToast(`Görev Ödülü Alındı: +${q.rewardCoins} Altın, +${q.rewardGems} Elmas!`);
          return { ...q, claimed: true };
        }
        return q;
      })
    );
  };

  // Handle Daily Login Reward Claim
  const handleClaimLoginReward = (day: number) => {
    setLoginRewards((prev) =>
      prev.map((item) => {
        if (item.day === day && item.isCurrent && !item.claimed) {
          setPlayer((p) => ({
            ...p,
            coins: p.coins + item.coins,
            gems: p.gems + item.gems,
          }));
          showToast(`Günlük Giriş Bonusu: +${item.coins} Altın, +${item.gems} Elmas Alındı!`);
          confetti({ particleCount: 70, spread: 60 });
          return { ...item, claimed: true, isCurrent: false };
        }
        return item;
      })
    );
  };

  // Handle Launch Scenario Match
  const handleLaunchScenario = (scen: MatchScenario) => {
    if (player.energy <= 0) {
      showToast('Enerjin bitti! Enerji dolmasını bekle veya mağazadan takviye al.', 'info');
      return;
    }

    // Deduct 1 energy
    setPlayer((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - 1),
    }));

    setSelectedScenario(scen);
    setIsMatchOpen(true);
  };

  // Handle Goal Scored inside Match Canvas
  const handleGoalScored = (
    scenario: MatchScenario,
    goalsAdded: number,
    assistsAdded: number,
    matchRating: number
  ) => {
    setPlayer((prev) => {
      const updated = {
        ...prev,
        coins: prev.coins + 250,
        gems: prev.gems + 5,
        stats: {
          ...prev.stats,
          goals: prev.stats.goals + goalsAdded,
          assists: prev.stats.assists + assistsAdded,
          matchesPlayed: prev.stats.matchesPlayed + 1,
          matchRatingSum: prev.stats.matchRatingSum + matchRating,
          nationalGoals: scenario.type === 'national' ? prev.stats.nationalGoals + goalsAdded : prev.stats.nationalGoals,
          nationalCaps: scenario.type === 'national' ? prev.stats.nationalCaps + 1 : prev.stats.nationalCaps,
        },
      };

      // Boost overall rating slightly after matches
      if (updated.stats.matchesPlayed % 3 === 0 && updated.rating < 99) {
        updated.rating += 1;
        updated.marketValue = Math.round(updated.marketValue * 1.15);
      }

      return updated;
    });

    // Update Daily Quests progress
    setQuests((prev) =>
      prev.map((q) => {
        let added = 0;
        if (q.id === 'quest_1') added = goalsAdded;
        if (q.id === 'quest_2') added = goalsAdded;
        if (q.id === 'quest_3' && scenario.type === 'national') added = 1;

        const nextVal = Math.min(q.target, q.current + added);
        return {
          ...q,
          current: nextVal,
          completed: nextVal >= q.target,
        };
      })
    );

    // If it was a tournament match, progress tournament
    if (tournament && scenario.type === 'tournament') {
      handleTournamentMatchWin(2, 1);
    }
  };

  // Tournament Logic
  const handleStartNewTournament = (type: 'national' | 'club') => {
    const isNational = type === 'national';
    const newTour: Tournament = {
      id: `tour_${Date.now()}`,
      name: isNational ? `${player.nationality} ile Avrupa Kupası 2025` : `${player.currentClub} Şampiyonlar Kupası`,
      type,
      trophyRewardCoins: isNational ? 5000 : 6000,
      trophyRewardGems: isNational ? 100 : 120,
      currentMatchIndex: 0,
      isCompleted: false,
      wonTrophy: false,
      matches: [
        { stage: 'Grup 1. Maç', opponent: isNational ? 'Almanya' : 'Bayern München', played: false },
        { stage: 'Grup 2. Maç', opponent: isNational ? 'Hollanda' : 'Inter Milano', played: false },
        { stage: 'Çeyrek Final', opponent: isNational ? 'İspanya' : 'Real Madrid', played: false },
        { stage: 'Yarı Final', opponent: isNational ? 'Brezilya' : 'FC Barcelona', played: false },
        { stage: 'FİNAL', opponent: isNational ? 'Fransa' : 'Manchester City', played: false },
      ],
    };
    setTournament(newTour);
    setActiveTab('tournament');
    showToast(`${newTour.name} başladı! Yolun açık olsun şampiyon!`);
  };

  const handlePlayTournamentMatch = (match: TournamentMatch, index: number) => {
    const scen: MatchScenario = {
      id: `tour_scen_${index}`,
      title: `${match.stage} - Kritik Vuruş`,
      type: 'tournament',
      opponent: match.opponent,
      minute: 88,
      scoreBefore: { us: 1, opponent: 1 },
      scenarioType: 'freekick',
      difficulty: (index >= 3 ? 3 : index >= 1 ? 2 : 1) as 1 | 2 | 3,
      description: `${match.stage} mücadelesinde maçın sonları! Golü at ve turu geç.`,
      ballStart: { x: 48, y: 76 },
      goalTarget: { xMin: 32, xMax: 68, y: 12 },
      goalkeeper: { x: 50, y: 15, agility: 0.8 },
      defenders: [
        { x: 42, y: 38, radius: 6 },
        { x: 48, y: 36, radius: 6 },
        { x: 54, y: 38, radius: 6 },
      ],
    };
    setSelectedScenario(scen);
    setIsMatchOpen(true);
  };

  const handleTournamentMatchWin = (us: number, opp: number) => {
    setTournament((prev) => {
      if (!prev) return null;
      const matches = [...prev.matches];
      const curIdx = prev.currentMatchIndex;

      matches[curIdx] = {
        ...matches[curIdx],
        played: true,
        ourScore: us,
        opponentScore: opp,
        won: us > opp,
      };

      const nextIdx = curIdx + 1;
      const wonTrophy = nextIdx >= matches.length && us > opp;

      return {
        ...prev,
        matches,
        currentMatchIndex: nextIdx,
        isCompleted: nextIdx >= matches.length,
        wonTrophy,
      };
    });
  };

  const handleClaimTrophyReward = () => {
    if (!tournament || !tournament.wonTrophy) return;
    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins + tournament.trophyRewardCoins,
      gems: prev.gems + tournament.trophyRewardGems,
      stats: {
        ...prev.stats,
        trophies: prev.stats.trophies + 1,
      },
    }));
    confetti({ particleCount: 150, spread: 90 });
    showToast(`ŞAMPİYON! +${tournament.trophyRewardCoins} Altın & +${tournament.trophyRewardGems} Elmas kazandın!`);
    setTournament(null);
  };

  const handleResetData = () => {
    if (window.confirm('Tüm kariyer verilerini sıfırlamak istediğine emin misin?')) {
      const fresh = resetAllData();
      setPlayer(fresh);
      setTournament(null);
      showToast('Kariyer verileri sıfırlandı ve yeni sayfa açıldı.', 'info');
    }
  };

  const handleInviteFriend = () => {
    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins + 1000,
      gems: prev.gems + 25,
    }));
    confetti({ particleCount: 80, spread: 60 });
    showToast('Arkadaş davet linki paylaşıldı! +1,000 Altın & +25 Elmas ödülü yüklendi.');
  };

  const nationalTeam = NATIONAL_TEAMS.find((t) => t.code === player.countryCode) || NATIONAL_TEAMS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-extrabold ${
              notification.type === 'success'
                ? 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
                : 'bg-slate-900 border-amber-500 text-amber-400 shadow-amber-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Sticky Top Navigation */}
      <Navbar
        player={player}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {activeTab === 'career' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            {/* Left Column: Player Card & National Team status */}
            <div className="space-y-6 lg:col-span-1">
              <div className="flex flex-col items-center">
                <PlayerCard
                  player={player}
                  size="large"
                  onShareCard={() => showToast('Oyuncu kartın kopyalandı ve paylaşıma hazır!')}
                />
              </div>

              {/* National Team & Career Milestone Badge */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    <span>Milli Takım Temsili</span>
                  </span>
                  <span className="text-sm font-black text-white">{nationalTeam.flag} {nationalTeam.name}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Ülkenin formasıyla <strong className="text-white">{player.stats.nationalCaps} maça</strong> çıktın ve{' '}
                  <strong className="text-emerald-400">{player.stats.nationalGoals} gol</strong> kaydettin.
                </p>

                <button
                  onClick={() => setIsCustomizerOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition text-xs font-bold border border-slate-700"
                >
                  Ülke / Milli Takım Seçimini Değiştir
                </button>
              </div>

              {/* Transfer Rumor / Scout Report Quick Banner */}
              <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                  <Newspaper className="w-4 h-4" />
                  <span>TRANSFER DEDİKODULARI</span>
                </div>
                <h4 className="text-sm font-black text-white">
                  "{player.name} İçin Avrupa Devleri Sırada!"
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mevcut piyasa değerin <strong className="text-emerald-400">{(player.marketValue / 1000000).toFixed(1)}M €</strong>. Transfer pazarından resmi teklifleri incele!
                </p>
              </div>
            </div>

            {/* Right 2 Columns: Match Scenarios & Score Hero Gameplay Grid */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Trophy className="w-4 h-4" />
                    <span>Score! Hero & Superstar Soccer Modu</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">Kariyer Maçları & Frikik Senaryoları</h2>
                  <p className="text-xs text-slate-400">
                    Sezgisel dokunmatik kontrollerle mermiyi 90'a gönder, gazete manşetlerine çık ve reytingini yükselt!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('tournament')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Kupa Turnuvası</span>
                  </button>
                </div>
              </div>

              {/* Match Scenarios Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MATCH_SCENARIOS.map((scen) => (
                  <div
                    key={scen.id}
                    className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Top labels */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {scen.type === 'national' ? '🇹🇷 Milli Takım' : '🏆 Lig Derbisi'}
                        </span>
                        <span className="text-xs font-bold text-amber-400">{scen.minute}'. Dk</span>
                      </div>

                      <h3 className="text-lg font-black text-white">{scen.title}</h3>
                      <p className="text-xs font-semibold text-emerald-400 mt-0.5">vs {scen.opponent}</p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{scen.description}</p>
                    </div>

                    {/* Footer / Play button */}
                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-amber-400">+250 Altın</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400">+10 Reyting</span>
                      </div>

                      <button
                        onClick={() => handleLaunchScenario(scen)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Oyna</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transfers' && (
          <TransferMarketModal
            player={player}
            onAcceptTransfer={handleAcceptTransfer}
          />
        )}

        {activeTab === 'store' && (
          <StoreModal
            player={player}
            onBuyItem={handleBuyItem}
            onEquipItem={handleEquipItem}
          />
        )}

        {activeTab === 'quests' && (
          <DailyRewardsModal
            quests={quests}
            loginRewards={loginRewards}
            onClaimQuest={handleClaimQuest}
            onClaimLoginReward={handleClaimLoginReward}
          />
        )}

        {activeTab === 'tournament' && (
          <TournamentModal
            tournament={tournament}
            onStartNewTournament={handleStartNewTournament}
            onPlayTournamentMatch={handlePlayTournamentMatch}
            onClaimTrophyReward={handleClaimTrophyReward}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardModal leaderboard={leaderboard} />
        )}

        {activeTab === 'social' && (
          <SocialAndChatModal
            player={player}
            onInviteFriend={handleInviteFriend}
          />
        )}
      </main>

      {/* Character Customizer Modal */}
      <PlayerCustomizerModal
        player={player}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onSave={handleSavePlayerProfile}
      />

      {/* Touch/Mouse Curved Soccer Match Canvas Modal */}
      <MatchCanvasModal
        scenario={selectedScenario}
        player={player}
        isOpen={isMatchOpen}
        onClose={() => setIsMatchOpen(false)}
        onGoalScored={handleGoalScored}
      />
    </div>
  );
}
