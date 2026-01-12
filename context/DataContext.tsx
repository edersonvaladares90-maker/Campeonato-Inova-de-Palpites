
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Tournament, User, Player, Bet, Round, Game, Score, UserAchievement } from '../types';
import { apiFetchData, apiAddTournament, apiUpdateTournament, apiDeleteTournament, apiAddRound, apiAddGameToRound, apiSubmitBets, apiUpdateRoundResults } from '../utils/api';

interface DataContextType {
  tournaments: Tournament[];
  players: Player[];
  bets: Bet[];
  users: User[];
  achievements: UserAchievement[];
  selectedTournament: Tournament | null;
  loading: boolean;
  selectTournament: (tournamentId: string | null) => void;
  addTournament: (name: string, imageUrl: string) => Promise<void>;
  updateTournament: (tournamentId: string, data: { name: string; imageUrl: string }) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  addRound: (tournamentId: string, roundName: string, deadline: number) => Promise<void>;
  addGameToRound: (tournamentId: string, roundId: string, game: Omit<Game, 'id'>) => Promise<void>;
  submitBets: (tournamentId: string, roundId: string, userBets: Bet[], topScorerId: string, userId: string) => Promise<void>;
  updateRoundResults: (tournamentId: string, roundId: string, games: Game[], scorers: { [playerId: string]: number }) => Promise<void>;
  getLeaderboard: (tournamentId: string) => Score[];
  getUserBetsForRound: (userId: string, round: Round) => { bets: Bet[], topScorer: Player | undefined };
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState({ users: [], tournaments: [], players: [], bets: [], achievements: [] });
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  useEffect(() => {
      const fetchData = async () => {
          const data = await apiFetchData();
          setDb(data);
          setLoading(false);
      };
      fetchData();
  }, []);

  const refreshData = async () => {
      const data = await apiFetchData();
      setDb(data);
  }

  const { users, tournaments, players, bets, achievements } = db;

  const selectTournament = (tournamentId: string | null) => {
    if (!tournamentId) {
        setSelectedTournament(null);
        return;
    }
    const tournament = db.tournaments.find(t => t.id === tournamentId) || null;
    setSelectedTournament(tournament);
  };

  const addTournament = async (name: string, imageUrl: string) => {
    await apiAddTournament(name, imageUrl);
    await refreshData();
  };

  const updateTournament = async (tournamentId: string, data: { name: string; imageUrl: string }) => {
      await apiUpdateTournament(tournamentId, data);
      await refreshData();
  }

  const deleteTournament = async (tournamentId: string) => {
    await apiDeleteTournament(tournamentId);
    if (selectedTournament?.id === tournamentId) {
        setSelectedTournament(null);
    }
    await refreshData();
  };

  const addRound = async (tournamentId: string, roundName: string, deadline: number) => {
    await apiAddRound(tournamentId, roundName, deadline);
    await refreshData();
  };

  const addGameToRound = async (tournamentId: string, roundId: string, gameData: Omit<Game, 'id'>) => {
      await apiAddGameToRound(tournamentId, roundId, gameData);
      await refreshData();
  };
  
  const submitBets = async (tournamentId: string, roundId: string, userBets: Bet[], topScorerId: string, userId: string) => {
    await apiSubmitBets(tournamentId, roundId, userBets, topScorerId, userId);
    await refreshData();
  };

  const updateRoundResults = async (tournamentId: string, roundId: string, updatedGames: Game[], scorers: { [playerId: string]: number }) => {
    await apiUpdateRoundResults(tournamentId, roundId, updatedGames, scorers);
    await refreshData();
  };
  
  const getUserBetsForRound = (userId: string, round: Round) => {
    const roundBets = db.bets.filter(bet => bet.userId === userId && round.games.some(g => g.id === bet.gameId));
    const topScorerId = round.topScorerBets[userId];
    const topScorer = db.players.find(p => p.id === topScorerId);
    return { bets: roundBets, topScorer };
  };

  const getLeaderboard = (tournamentId: string): Score[] => {
    const tournament = db.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return [];

    const scores: { [userId: string]: Score } = {};

    db.users.filter(u => !u.isAdmin).forEach(user => {
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
          const gameBets = db.bets.filter(b => b.gameId === game.id);
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
    <DataContext.Provider value={{ tournaments, players, bets, users, achievements, selectedTournament, loading, selectTournament, addTournament, updateTournament, deleteTournament, addRound, addGameToRound, submitBets, updateRoundResults, getLeaderboard, getUserBetsForRound }}>
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
