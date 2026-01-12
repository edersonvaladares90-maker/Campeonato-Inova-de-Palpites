import { User, Tournament, Game, Bet, Round, Achievement } from '../types';
import { loadDB, saveDB } from './storage';

const API_LATENCY = 150; // ms

// Simula uma chamada de rede
function simulateRequest<T>(data: T): Promise<T> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, API_LATENCY);
    });
}

// --- Auth API ---

export const apiLogin = async (email: string, passwordHash: string): Promise<User | null> => {
    const db = loadDB();
    const user = db.users.find(u => u.email === email && u.passwordHash === passwordHash) || null;
    return simulateRequest(user);
};

export const apiRegister = async (userData: Omit<User, 'id' | 'isAdmin'>): Promise<User | null> => {
    const db = loadDB();
    if (db.users.some(u => u.email === userData.email)) {
        return simulateRequest(null); // User exists
    }
    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        isAdmin: false,
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`
    };
    db.users.push(newUser);
    saveDB(db);
    return simulateRequest(newUser);
};

export const apiUpdateUser = async (updatedUser: User): Promise<User | null> => {
    const db = loadDB();
    const userIndex = db.users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
        const originalUser = db.users[userIndex];
        const finalUser = { ...updatedUser, isAdmin: originalUser.isAdmin, email: originalUser.email };
        db.users[userIndex] = finalUser;
        saveDB(db);
        return simulateRequest(finalUser);
    }
    return simulateRequest(null);
};


// --- Data API ---

export const apiFetchData = async () => {
    const db = loadDB();
    return simulateRequest(db);
};

export const apiAddTournament = async (name: string, imageUrl: string): Promise<Tournament> => {
    const db = loadDB();
    const newTournament: Tournament = {
        id: `t-${Date.now()}`,
        name,
        imageUrl,
        rounds: [],
    };
    db.tournaments.push(newTournament);
    saveDB(db);
    return simulateRequest(newTournament);
};

export const apiUpdateTournament = async (tournamentId: string, data: { name: string; imageUrl: string }): Promise<Tournament | null> => {
    const db = loadDB();
    const tournamentIndex = db.tournaments.findIndex(t => t.id === tournamentId);
    if(tournamentIndex > -1) {
        db.tournaments[tournamentIndex] = { ...db.tournaments[tournamentIndex], ...data };
        saveDB(db);
        return simulateRequest(db.tournaments[tournamentIndex]);
    }
    return simulateRequest(null);
}

export const apiDeleteTournament = async (tournamentId: string): Promise<boolean> => {
    const db = loadDB();
    const initialLength = db.tournaments.length;
    db.tournaments = db.tournaments.filter(t => t.id !== tournamentId);
    saveDB(db);
    return simulateRequest(db.tournaments.length < initialLength);
};

export const apiAddRound = async (tournamentId: string, roundName: string, deadline: number): Promise<Round> => {
    const db = loadDB();
    const newRound: Round = {
        id: `r-${tournamentId}-${Date.now()}`,
        name: roundName,
        deadline,
        games: [],
        topScorerBets: {},
        resultsEntered: false,
        scorers: {}
    };
    const tournament = db.tournaments.find(t => t.id === tournamentId);
    if (tournament) {
        tournament.rounds.push(newRound);
        saveDB(db);
    }
    return simulateRequest(newRound);
}

export const apiAddGameToRound = async (tournamentId: string, roundId: string, gameData: Omit<Game, 'id'>): Promise<Game> => {
    const db = loadDB();
    const newGame: Game = { ...gameData, id: `g-${Date.now()}`};
    const tournament = db.tournaments.find(t => t.id === tournamentId);
    const round = tournament?.rounds.find(r => r.id === roundId);
    if(round) {
        round.games.push(newGame);
        saveDB(db);
    }
    return simulateRequest(newGame);
}

export const apiSubmitBets = async (tournamentId: string, roundId: string, userBets: Bet[], topScorerId: string, userId: string): Promise<boolean> => {
    const db = loadDB();
    const tournament = db.tournaments.find(t => t.id === tournamentId);
    const round = tournament?.rounds.find(r => r.id === roundId);
    if (!round) return simulateRequest(false);

    const roundGameIds = round.games.map(g => g.id);
    db.bets = db.bets.filter(b => !(b.userId === userId && roundGameIds.includes(b.gameId)));
    db.bets.push(...userBets);

    round.topScorerBets[userId] = topScorerId;

    // Fix: Use Achievement enum for type safety instead of a magic string.
    if (!db.achievements.some(a => a.userId === userId && a.achievement === Achievement.FirstBet)) {
        db.achievements.push({ userId, achievement: Achievement.FirstBet, date: Date.now() });
    }

    saveDB(db);
    return simulateRequest(true);
}

export const apiUpdateRoundResults = async (tournamentId: string, roundId: string, updatedGames: Game[], scorers: { [playerId: string]: number }): Promise<boolean> => {
    const db = loadDB();
    const tournament = db.tournaments.find(t => t.id === tournamentId);
    const round = tournament?.rounds.find(r => r.id === roundId);
    if(round) {
        round.games = updatedGames;
        round.scorers = scorers;
        round.resultsEntered = true;
        saveDB(db);
        return simulateRequest(true);
    }
    return simulateRequest(false);
}