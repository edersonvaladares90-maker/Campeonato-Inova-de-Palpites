
import { Tournament, User, Player, Bet, UserAchievement } from '../types';

interface AppDatabase {
    users: User[];
    tournaments: Tournament[];
    players: Player[];
    bets: Bet[];
    achievements: UserAchievement[];
}

const DB_KEY = 'inovaPalpitesDB';

const INITIAL_USERS: User[] = [
  { id: 'user-1', firstName: 'Admin', lastName: 'User', teamName: 'Inova Corp', email: 'admin@inova.com', phone: '123456789', passwordHash: 'admin123', isAdmin: true, avatarUrl: 'https://picsum.photos/seed/admin/200' },
  { id: 'user-2', firstName: 'Alice', lastName: 'Silva', teamName: 'Real Alice', email: 'alice@email.com', phone: '987654321', passwordHash: 'alice123', isAdmin: false, avatarUrl: 'https://picsum.photos/seed/alice/200' },
  { id: 'user-3', firstName: 'Bob', lastName: 'Souza', teamName: 'Atlético Bobense', email: 'bob@email.com', phone: '555555555', passwordHash: 'bob123', isAdmin: false, avatarUrl: 'https://picsum.photos/seed/bob/200' },
  { id: 'user-4', firstName: 'Ederson', lastName: 'Valadares', teamName: 'Master Admin', email: 'edrslv@yahoo.com', phone: '111222333', passwordHash: 'ederson123', isAdmin: true, avatarUrl: 'https://picsum.photos/seed/ederson/200' },
];

const INITIAL_PLAYERS: Player[] = [
    { id: 'p-1', name: 'Artilheiro 1', team: 'Time A' },
    { id: 'p-2', name: 'Atacante X', team: 'Time B' },
    { id: 'p-3', name: 'Matador Z', team: 'Time C' },
    { id: 'p-4', name: 'Goleador Y', team: 'Time D' },
];

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 't-1',
    name: 'Brasileirão 2024',
    imageUrl: 'https://picsum.photos/seed/brasileirao/400/200',
    rounds: [
      {
        id: 'r-1-1',
        name: 'Rodada 1',
        deadline: Date.now() + 3 * 24 * 60 * 60 * 1000,
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
        deadline: Date.now() - 1 * 24 * 60 * 60 * 1000,
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

const INITIAL_BETS: Bet[] = [
    {userId: 'user-2', gameId: 'g-3', scoreA: 2, scoreB: 1},
    {userId: 'user-2', gameId: 'g-4', scoreA: 1, scoreB: 0},
    {userId: 'user-3', gameId: 'g-3', scoreA: 1, scoreB: 0},
    {userId: 'user-3', gameId: 'g-4', scoreA: 0, scoreB: 0},
];


const getInitialData = (): AppDatabase => ({
    users: INITIAL_USERS,
    players: INITIAL_PLAYERS,
    tournaments: INITIAL_TOURNAMENTS,
    bets: INITIAL_BETS,
    achievements: [],
});

export const loadDB = (): AppDatabase => {
    try {
        const serializedDB = localStorage.getItem(DB_KEY);
        if (serializedDB === null) {
            const initialData = getInitialData();
            saveDB(initialData);
            return initialData;
        }
        return JSON.parse(serializedDB);
    } catch (error) {
        console.error("Could not load database from localStorage", error);
        const initialData = getInitialData();
        saveDB(initialData);
        return initialData;
    }
};

export const saveDB = (db: AppDatabase): void => {
    try {
        const serializedDB = JSON.stringify(db);
        localStorage.setItem(DB_KEY, serializedDB);
    } catch (error) {
        console.error("Could not save database to localStorage", error);
    }
};
