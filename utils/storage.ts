
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
  { id: 'user-4', firstName: 'Ederson', lastName: 'Valadares', teamName: 'Master Admin', email: 'edrslv@yahoo.com', phone: '111222333', passwordHash: 'ederson123', isAdmin: true, avatarUrl: 'https://picsum.photos/seed/ederson/200' },
];

const INITIAL_PLAYERS: Player[] = [];

const INITIAL_TOURNAMENTS: Tournament[] = [];

const INITIAL_BETS: Bet[] = [];


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