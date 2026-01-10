
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Tournament, User, Player, Bet, Round, Game, Score, UserAchievement } from '../types';
import { loadDB, saveDB } from '../utils/storage';

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

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState(loadDB());
  const { users, tournaments, players, bets, achievements } = db;
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    saveDB(db);
  }, [db]);

  const selectTournament = (tournamentId: string | null) => {
    if (!tournamentId) {
        setSelectedTournament(null);
        return;
    }
    const tournament = db.tournaments.find(t => t.id === tournamentId) || null;
    setSelectedTournament(tournament);
  };

  const addTournament = (name: string, imageUrl: string) => {
    const newTournament: Tournament = {
        id: `t-${Date.now()}`,
        name,
        imageUrl,
        rounds: [],
    };
    setDb(prevDb => ({ ...prevDb, tournaments: [...prevDb.tournaments, newTournament] }));
  };

  const updateTournament = (tournamentId: string, data: { name: string; imageUrl: string }) => {
      setDb(prevDb => ({
          ...prevDb,
          tournaments: prevDb.tournaments.map(t => t.id === tournamentId ? { ...t, ...data } : t)
      }));
  }

  const deleteTournament = (tournamentId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        tournaments: prevDb.tournaments.filter(t => t.id !== tournamentId)
    }));
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
    setDb(prevDb => ({
        ...prevDb,
        tournaments: prevDb.tournaments.map(t => t.id === tournamentId ? {...t, rounds: [...t.rounds, newRound]} : t)
    }));
  };

  const addGameToRound = (tournamentId: string, roundId: string, gameData: Omit<Game, 'id'>) => {
      const newGame: Game = { ...gameData, id: `g-${Date.now()}`};
      setDb(prevDb => ({
          ...prevDb,
          tournaments: prevDb.tournaments.map(t => {
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
          })
      }));
  };
  
  const submitBets = (tournamentId: string, roundId: string, userBets: Bet[], topScorerId: string, userId: string) => {
    const roundGameIds = db.tournaments.find(t=> t.id === tournamentId)?.rounds.find(r=>r.id===roundId)?.games.map(g=>g.id) || [];
    const filteredBets = db.bets.filter(b => !(b.userId === userId && roundGameIds.includes(b.gameId)));
    
    const newBets = [...filteredBets, ...userBets];

    const newTournaments = db.tournaments.map(t => {
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
    });

    const newAchievements = !db.achievements.some(a => a.userId === userId && a.achievement === "Primeiro Palpite")
        ? [...db.achievements, { userId, achievement: "Primeiro Palpite", date: Date.now() }]
        : db.achievements;
    
    setDb(prevDb => ({
        ...prevDb,
        bets: newBets,
        tournaments: newTournaments,
        achievements: newAchievements,
    }));
  };

  const updateRoundResults = (tournamentId: string, roundId: string, updatedGames: Game[], scorers: { [playerId: string]: number }) => {
    setDb(prevDb => ({
        ...prevDb,
        tournaments: prevDb.tournaments.map(t => {
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
        })
    }));
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
    <DataContext.Provider value={{ tournaments, players, bets, users, achievements, selectedTournament, selectTournament, addTournament, updateTournament, deleteTournament, addRound, addGameToRound, submitBets, updateRoundResults, getLeaderboard, getUserBetsForRound }}>
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
