export type Position = 'ST' | 'LW' | 'RW' | 'CAM' | 'CM';

export interface PlayerAppearance {
  skinTone: string;
  hairStyle: 'short' | 'spiky' | 'curly' | 'afro' | 'buzz' | 'mohawk';
  hairColor: string;
  bootColor: string;
  jerseyId: string;
  bootId: string;
  accessoryId: string;
  number: number;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  matchesPlayed: number;
  trophies: number;
  nationalCaps: number;
  nationalGoals: number;
  matchRatingSum: number;
  manOfTheMatchCount: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  nationality: string;
  countryCode: string; // e.g., 'TR', 'BR', 'AR', 'DE', 'FR', 'GB'
  position: Position;
  age: number;
  rating: number;
  marketValue: number; // in Euros
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  currentClub: string;
  currentLeague: string;
  wage: number;
  contractYearsRemaining: number;
  stats: PlayerStats;
  appearance: PlayerAppearance;
  inventory: {
    jerseys: string[];
    boots: string[];
    accessories: string[];
  };
  unlockedNationalTeam: boolean;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  league: string;
  country: string;
  logoColor: string;
  accentColor: string;
  prestige: number; // 1 to 5 stars
  baseWage: number;
  minRatingRequired: number;
}

export interface TransferOffer {
  id: string;
  club: Club;
  wage: number; // Weekly salary in €
  signingBonus: number; // One-time coin bonus
  contractYears: number;
  role: 'Takım Kaptanı & Yıldız' | 'İlk 11 Oyuncusu' | 'Gelecek Vadeden Rotasyon';
  status: 'pending' | 'accepted' | 'rejected';
}

export type ScenarioType =
  | 'freekick'
  | 'penalty'
  | 'through_pass'
  | 'curved_shot'
  | 'one_on_one'
  | 'pass_and_shoot'
  | 'corner_header';

export interface MatchScenario {
  id: string;
  title: string;
  type: 'league' | 'national' | 'cup' | 'tournament';
  opponent: string;
  minute: number;
  scoreBefore: { us: number; opponent: number };
  scenarioType: ScenarioType;
  difficulty: 1 | 2 | 3;
  description: string;
  ballStart: { x: number; y: number };
  goalTarget: { xMin: number; xMax: number; y: number };
  goalkeeper: { x: number; y: number; agility: number };
  defenders: Array<{ x: number; y: number; radius: number }>;
  teammateTarget?: { x: number; y: number; name?: string }; // For through pass / assist
  secondStage?: {
    ballStart: { x: number; y: number };
    prompt: string;
  };
}

export interface StoreItem {
  id: string;
  type: 'jersey' | 'boot' | 'hair' | 'accessory';
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'gems';
  color: string;
  statBonus?: string;
  icon: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardGems: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyLoginReward {
  day: number;
  coins: number;
  gems: number;
  label: string;
  claimed: boolean;
  isCurrent: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  nationality: string;
  countryCode: string;
  club: string;
  goals: number;
  rating: string;
  marketValueFormatted: string;
  isUser?: boolean;
}

export interface TournamentMatch {
  stage: 'Grup 1. Maç' | 'Grup 2. Maç' | 'Çeyrek Final' | 'Yarı Final' | 'FİNAL';
  opponent: string;
  played: boolean;
  ourScore?: number;
  opponentScore?: number;
  won?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'national' | 'club';
  trophyRewardCoins: number;
  trophyRewardGems: number;
  currentMatchIndex: number;
  matches: TournamentMatch[];
  isCompleted: boolean;
  wonTrophy: boolean;
}

export interface AICommentaryReport {
  headline: string;
  coachComment: string;
  pressBody: string;
  fanSentiment: 'COŞKULU' | 'MEMNUN' | 'ELEŞTİREL';
}
