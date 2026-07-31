import {
  PlayerProfile,
  DailyQuest,
  DailyLoginReward,
  LeaderboardEntry,
  Tournament
} from '../types';
import {
  DEFAULT_PLAYER_PROFILE,
  INITIAL_DAILY_QUESTS,
  DAILY_LOGIN_REWARDS,
  INITIAL_LEADERBOARD,
  CLUBS
} from '../data/mockData';

const STORAGE_KEY_PLAYER = 'scc_str_player_profile_v1';
const STORAGE_KEY_QUESTS = 'scc_str_daily_quests_v1';
const STORAGE_KEY_REWARDS = 'scc_str_daily_rewards_v1';
const STORAGE_KEY_LEADERBOARD = 'scc_str_leaderboard_v1';
const STORAGE_KEY_TOURNAMENT = 'scc_str_tournament_v1';
const STORAGE_KEY_SAVE_LOG = 'scc_str_last_save_time_v1';

export interface SaveState {
  player: PlayerProfile;
  quests: DailyQuest[];
  loginRewards: DailyLoginReward[];
  leaderboard: LeaderboardEntry[];
  tournament: Tournament | null;
  lastSaved: string;
}

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYER);
    if (!raw) return DEFAULT_PLAYER_PROFILE;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load player profile:', e);
    return DEFAULT_PLAYER_PROFILE;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEY_SAVE_LOG, new Date().toLocaleTimeString());
    window.dispatchEvent(new CustomEvent('scc_str_data_saved', { detail: { type: 'player' } }));
  } catch (e) {
    console.error('Failed to save player profile:', e);
  }
}

export function loadDailyQuests(): DailyQuest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTS);
    if (!raw) return INITIAL_DAILY_QUESTS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DAILY_QUESTS;
  }
}

export function saveDailyQuests(quests: DailyQuest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(quests));
    localStorage.setItem(STORAGE_KEY_SAVE_LOG, new Date().toLocaleTimeString());
    window.dispatchEvent(new CustomEvent('scc_str_data_saved', { detail: { type: 'quests' } }));
  } catch (e) {
    console.error('Failed to save quests:', e);
  }
}

export function loadDailyLoginRewards(): DailyLoginReward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REWARDS);
    if (!raw) return DAILY_LOGIN_REWARDS;
    return JSON.parse(raw);
  } catch (e) {
    return DAILY_LOGIN_REWARDS;
  }
}

export function saveDailyLoginRewards(rewards: DailyLoginReward[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REWARDS, JSON.stringify(rewards));
    localStorage.setItem(STORAGE_KEY_SAVE_LOG, new Date().toLocaleTimeString());
    window.dispatchEvent(new CustomEvent('scc_str_data_saved', { detail: { type: 'rewards' } }));
  } catch (e) {
    console.error('Failed to save login rewards:', e);
  }
}

export function loadLeaderboard(player: PlayerProfile): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    let list: LeaderboardEntry[] = INITIAL_LEADERBOARD;
    if (raw) {
      list = JSON.parse(raw);
    }
    // Update player's entry in leaderboard
    const avgRating = (player.stats.matchRatingSum / Math.max(1, player.stats.matchesPlayed)).toFixed(1);
    const existingIndex = list.findIndex((x) => x.isUser || x.name === player.name);
    const userEntry: LeaderboardEntry = {
      rank: 0,
      name: player.name,
      nationality: player.nationality,
      countryCode: player.countryCode,
      club: player.currentClub,
      goals: player.stats.goals,
      rating: avgRating,
      marketValueFormatted: `${(player.marketValue / 1000000).toFixed(1)} M €`,
      isUser: true,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = userEntry;
    } else {
      list.push(userEntry);
    }

    // Sort by goals descending
    list.sort((a, b) => b.goals - a.goals);
    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(list));
    return list;
  } catch (e) {
    return INITIAL_LEADERBOARD;
  }
}

export function loadTournament(): Tournament | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOURNAMENT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveTournament(tournament: Tournament | null): void {
  try {
    if (tournament) {
      localStorage.setItem(STORAGE_KEY_TOURNAMENT, JSON.stringify(tournament));
    } else {
      localStorage.removeItem(STORAGE_KEY_TOURNAMENT);
    }
    localStorage.setItem(STORAGE_KEY_SAVE_LOG, new Date().toLocaleTimeString());
    window.dispatchEvent(new CustomEvent('scc_str_data_saved', { detail: { type: 'tournament' } }));
  } catch (e) {
    console.error('Failed to save tournament:', e);
  }
}

export function exportSaveData(): string {
  const data: SaveState = {
    player: loadPlayerProfile(),
    quests: loadDailyQuests(),
    loginRewards: loadDailyLoginRewards(),
    leaderboard: loadLeaderboard(loadPlayerProfile()),
    tournament: loadTournament(),
    lastSaved: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importSaveData(jsonString: string): boolean {
  try {
    const data: SaveState = JSON.parse(jsonString);
    if (data && data.player && data.player.name) {
      savePlayerProfile(data.player);
      if (data.quests) saveDailyQuests(data.quests);
      if (data.loginRewards) saveDailyLoginRewards(data.loginRewards);
      if (data.tournament) saveTournament(data.tournament);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to import save data:', e);
    return false;
  }
}

export function resetAllData(): PlayerProfile {
  localStorage.removeItem(STORAGE_KEY_PLAYER);
  localStorage.removeItem(STORAGE_KEY_QUESTS);
  localStorage.removeItem(STORAGE_KEY_REWARDS);
  localStorage.removeItem(STORAGE_KEY_LEADERBOARD);
  localStorage.removeItem(STORAGE_KEY_TOURNAMENT);
  const newProfile = { ...DEFAULT_PLAYER_PROFILE };
  savePlayerProfile(newProfile);
  return newProfile;
}

// Generate realistic random transfer offers based on player rating
export function generateTransferOffers(player: PlayerProfile) {
  const possibleClubs = CLUBS.filter((c) => c.name !== player.currentClub);
  const selectedClubs = possibleClubs
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return selectedClubs.map((club, idx) => {
    const wageMultiplier = Math.max(1, (player.rating - 60) / 15);
    const wage = Math.round(club.baseWage * wageMultiplier * (0.8 + Math.random() * 0.4));
    const bonus = Math.round(wage * 3 + Math.random() * 5000);
    const roles: Array<'Takım Kaptanı & Yıldız' | 'İlk 11 Oyuncusu' | 'Gelecek Vadeden Rotasyon'> = [
      'Takım Kaptanı & Yıldız',
      'İlk 11 Oyuncusu',
      'Gelecek Vadeden Rotasyon',
    ];
    const role = player.rating >= club.minRatingRequired + 5 ? roles[0] : roles[idx % roles.length];

    return {
      id: `offer_${Date.now()}_${idx}`,
      club,
      wage,
      signingBonus: bonus,
      contractYears: 2 + (idx % 3),
      role,
      status: 'pending' as const,
    };
  });
}
