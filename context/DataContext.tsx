
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Tournament, User, Player, Bet, Round, Game, Score, UserAchievement } from '../types';

// Mock Data - In a real app, this would come from an API
export const MOCK_USERS: User[] = [
  { id: 'user-1', firstName: 'Admin', lastName: 'User', teamName: 'Inova Corp', email: 'admin@inova.com', phone: '123456789', passwordHash: 'admin123', isAdmin: true, avatarUrl: 'https://picsum.photos/seed/admin/200' },
  { id: 'user-2', firstName: 'Alice', lastName: 'Silva', teamName: 'Real Alice', email: 'alice@email.com', phone: '987654321', passwordHash: 'alice123', isAdmin: false, avatarUrl: 'https://picsum.photos/seed/alice/200' },
  { id: 'user-3', firstName: 'Bob', lastName: 'Souza', teamName: 'Atlético Bobense', email: 'bob@email.com', phone: '555555555', passwordHash: 'bob123', isAdmin: false, avatarUrl: 'https://picsum.photos/seed/bob/200' },
  { id: 'user-4', firstName: 'Ederson', lastName: 'Valadares', teamName: 'Master Admin', email: 'ederson.valadares.90@gmail.com', phone: '111222333', passwordHash: 'ederson123', isAdmin: true, avatarUrl: 'https://picsum.photos/seed/ederson/200' },
];

export const MOCK_PLAYERS: Player[] = [
    { id: 'p-1', name: 'Artilheiro 1', team: 'Time A' },
    { id: 'p-2', name: 'Atacante X', team: 'Time B' },
    { id: 'p-3', name: 'Matador Z', team: 'Time C' },
    { id: 'p-4', name: 'Goleador Y', team: 'Time D' },
];

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 't-1',
    name: 'Brasileirão 2024',
    imageUrl: 'https://picsum.photos/seed/brasileirao/400/200',
    rounds: [
      {
        id: 'r-1-1',
        name: 'Rodada 1',
        deadline: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
        games: [
          { id: 'g-1', teamA: 'Time A', teamB: 'Time B', teamALogo: 'https://picsum.photos/seed/timeA/40', teamBLogo: 'https://picsum.photos/seed/timeB/40' },
          { id: 'g-2', teamA: 'Time C', teamB: 'Time D', teamALogo: 'https://picsum.photos/seed/timeC/40', teamBLogo: 'https://picsum.photos/seed/timeD/40' },
        ],
        topScorerBets: { 'user-2': 'p-1', 'user-3': 'p-2' },
        resultsEntered: false,
        scorers: {}
      },
      {
        id: 'r-1-2',
        name: 'Rodada 2 (Encerrada)',
        deadline: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        games: [
          { id: 'g-3', teamA: 'Time A', teamB: 'Time C', teamALogo: 'https://picsum.photos/seed/timeA/40', teamBLogo: 'https://picsum.photos/seed/timeC/40', finalScoreA: 2, finalScoreB: 1 },
          { id: 'g-4', teamA: 'Time B', teamB: 'Time D', teamALogo: 'https://picsum.photos/seed/timeB/40', teamBLogo: 'https://picsum.photos/seed/timeD/40', finalScoreA: 0, finalScoreB: 0 },
        ],
        topScorerBets: { 'user-2': 'p-1', 'user-3': 'p-3' },
        resultsEntered: true,
        scorers: { 'p-1': 2, 'p-4': 0 }
      },
    ],
  },
];

const MOCK_BETS: Bet[] = [
    {userId: 'user-2', gameId: 'g-3', scoreA: 2, scoreB: 1}, // Alice: Exact
    {userId: 'user-2', gameId: 'g-4', scoreA: 1, scoreB: 0}, // Alice: Wrong
    {userId: 'user-3', gameId: 'g-3', scoreA: 1, scoreB: 0}, // Bob: Correct result
    {userId: 'user-3', gameId: 'g-4', scoreA: 0, scoreB: 0}, // Bob: Exact
];

const MOCK_ACHIEVEMENTS: UserAchievement[] = [];

interface DataContextType {
  tournaments: Tournament[];
  players: Player[];
  bets: Bet[];
  users: User[];
  achievements: UserAchievement[];
  selectedTournament: Tournament | null;
  selectTournament: (tournamentId: string | null) => void;
  addTournament: (name: string, imageUrl: string) => void;
  updateTournament: (tournamentId: string, data: { name: string; imageUrl: string }) => void;
  deleteTournament: (tournamentId: string) => void;
  addRound: (tournamentId: string, roundName: string, deadline: number) => void;
  addGameToRound: (tournamentId: string, roundId: string, game: Omit<Game, 'id'>) => void;
  submitBets: (tournamentId: string, roundId: string, userBets: Bet[], topScorerId: string, userId: string) => void;
  updateRoundResults: (tournamentId: string, roundId: string, games: Game[], scorers: { [playerId: string]: number }) => void;
  getLeaderboard: (tournamentId: string) => Score[];
  getUserBetsForRound: (userId: string, round: Round) => { bets: Bet[], topScorer: Player | undefined };
}

// FIX: Export DataContext to be available for use in hooks.
export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS);
  const [achievements, setAchievements] = useState<UserAchievement[]>(MOCK_ACHIEVEMENTS);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  const selectTournament = (tournamentId: string | null) => {
    if (!tournamentId) {
        setSelectedTournament(null);
        return;
    }
    const tournament = tournaments.find(t => t.id === tournamentId) || null;
    setSelectedTournament(tournament);
  };

  const addTournament = (name: string, imageUrl: string) => {
    const newTournament: Tournament = {
        id: `t-${Date.now()}`,
        name,
        imageUrl,
        rounds: [],
    };
    setTournaments(prev => [...prev, newTournament]);
  };

  const updateTournament = (tournamentId: string, data: { name: string; imageUrl: string }) => {
      setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, ...data } : t));
  }

  const deleteTournament = (tournamentId: string) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    if (selectedTournament?.id === tournamentId) {
        setSelectedTournament(null);
    }
  };

  const addRound = (tournamentId: string, roundName: string, deadline: number) => {
    const newRound: Round = {
        id: `r-${tournamentId}-${Date.now()}`,
        name: roundName,
        deadline,
        games: [],
        topScorerBets: {},
        resultsEntered: false,
        scorers: {}
    };
    setTournaments(prev => prev.map(t => t.id === tournamentId ? {...t, rounds: [...t.rounds, newRound]} : t));
  };

  const addGameToRound = (tournamentId: string, roundId: string, gameData: Omit<Game, 'id'>) => {
      const newGame: Game = { ...gameData, id: `g-${Date.now()}`};
      setTournaments(prev => prev.map(t => {
          if (t.id === tournamentId) {
              const newRounds = t.rounds.map(r => {
                  if (r.id === roundId) {
                      return { ...r, games: [...r.games, newGame] };
                  }
                  return r;
              });
              return { ...t, rounds: newRounds };
          }
          return t;
      }));
  };
  
  const submitBets = (tournamentId: string, roundId: string, userBets: Bet[], topScorerId: string, userId: string) => {
    // Remove old bets for this user in this round
    const roundGameIds = tournaments.find(t=> t.id === tournamentId)?.rounds.find(r=>r.id===roundId)?.games.map(g=>g.id) || [];
    const filteredBets = bets.filter(b => !(b.userId === userId && roundGameIds.includes(b.gameId)));
    
    setBets([...filteredBets, ...userBets]);

    setTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        const newRounds = t.rounds.map(r => {
          if (r.id === roundId) {
            const newTopScorerBets = { ...r.topScorerBets, [userId]: topScorerId };
            return { ...r, topScorerBets: newTopScorerBets };
          }
          return r;
        });
        return { ...t, rounds: newRounds };
      }
      return t;
    }));

    // Achievement: First Bet
    if (!achievements.some(a => a.userId === userId && a.achievement === "Primeiro Palpite")) {
        setAchievements(prev => [...prev, { userId, achievement: "Primeiro Palpite", date: Date.now() }]);
    }
  };

  const updateRoundResults = (tournamentId: string, roundId: string, updatedGames: Game[], scorers: { [playerId: string]: number }) => {
    setTournaments(prev => prev.map(t => {
        if (t.id === tournamentId) {
            const newRounds = t.rounds.map(r => {
                if (r.id === roundId) {
                    return { ...r, games: updatedGames, scorers, resultsEntered: true };
                }
                return r;
            });
            return { ...t, rounds: newRounds };
        }
        return t;
    }));
  };
  
  const getUserBetsForRound = (userId: string, round: Round) => {
    const roundBets = bets.filter(bet => bet.userId === userId && round.games.some(g => g.id === bet.gameId));
    const topScorerId = round.topScorerBets[userId];
    const topScorer = players.find(p => p.id === topScorerId);
    return { bets: roundBets, topScorer };
  };

  const getLeaderboard = (tournamentId: string): Score[] => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return [];

    const scores: { [userId: string]: Score } = {};

    MOCK_USERS.filter(u => !u.isAdmin).forEach(user => {
      scores[user.id] = { 
          userId: user.id, 
          displayName: `${user.teamName} (${user.firstName})`, 
          userAvatar: user.avatarUrl,
          totalPoints: 0, 
          exactScores: 0, 
          topScorerGoals: 0 
      };
    });

    tournament.rounds.forEach(round => {
      if (round.resultsEntered) {
        round.games.forEach(game => {
          const gameBets = bets.filter(b => b.gameId === game.id);
          gameBets.forEach(bet => {
            if (scores[bet.userId] && game.finalScoreA !== undefined && game.finalScoreB !== undefined) {
              const isExactScore = bet.scoreA === game.finalScoreA && bet.scoreB === game.finalScoreB;
              const betResult = bet.scoreA > bet.scoreB ? 'A' : bet.scoreA < bet.scoreB ? 'B' : 'D';
              const gameResult = game.finalScoreA > game.finalScoreB ? 'A' : game.finalScoreA < game.finalScoreB ? 'B' : 'D';
              const isCorrectResult = betResult === gameResult;

              if (isExactScore) {
                scores[bet.userId].totalPoints += 3;
                scores[bet.userId].exactScores += 1;
              } else if (isCorrectResult) {
                scores[bet.userId].totalPoints += 1;
              }
            }
          });
        });

        Object.keys(round.topScorerBets).forEach(userId => {
            if (scores[userId]) {
                const betPlayerId = round.topScorerBets[userId];
                const goals = round.scorers[betPlayerId] || 0;
                if (goals > 0) {
                    scores[userId].totalPoints += goals * 3;
                    scores[userId].topScorerGoals += goals;
                }
            }
        });
      }
    });

    return Object.values(scores).sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
        return b.topScorerGoals - a.topScorerGoals;
    });
  };


  return (
    <DataContext.Provider value={{ tournaments, players, bets, users: MOCK_USERS, achievements, selectedTournament, selectTournament, addTournament, updateTournament, deleteTournament, addRound, addGameToRound, submitBets, updateRoundResults, getLeaderboard, getUserBetsForRound }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
