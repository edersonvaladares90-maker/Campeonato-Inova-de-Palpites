
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  teamName: string;
  email: string;
  phone: string;
  passwordHash: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export interface Player {
  id: string;
  name: string;
  team: string;
}

export interface Game {
  id: string;
  teamA: string;
  teamB: string;
  teamALogo?: string;
  teamBLogo?: string;
  finalScoreA?: number;
  finalScoreB?: number;
}

export interface Bet {
  userId: string;
  gameId: string;
  scoreA: number;
  scoreB: number;
}

export interface Round {
  id: string;
  name: string;
  games: Game[];
  deadline: number; // timestamp
  topScorerBets: { [userId: string]: string }; // userId -> playerId
  resultsEntered: boolean;
  scorers: { [playerId: string]: number }; // playerId -> goals scored
}

export interface Tournament {
  id: string;
  name: string;
  imageUrl?: string;
  rounds: Round[];
}

export interface Score {
  userId: string;
  displayName: string;
  userAvatar?: string;
  totalPoints: number;
  exactScores: number;
  topScorerGoals: number; // Total goals from correct top scorer picks
}

export enum Achievement {
  FirstBet = "Primeiro Palpite",
  PerfectRound = "Rodada Perfeita",
  TopScorerGenius = "Gênio do Artilheiro",
  HatTrick = "Placar Exato Triplo",
  PodiumFinish = "Pódio",
}

export interface UserAchievement {
  userId: string;
  achievement: Achievement;
  date: number; // timestamp
}
