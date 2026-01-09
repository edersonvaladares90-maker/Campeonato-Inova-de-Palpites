
import React from 'react';
import { useData } from '../hooks/useData';
import { TrophyIcon, ChevronRightIcon } from '../components/icons';

interface DashboardPageProps {
    navigate: (page: 'tournament') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
    const { tournaments, selectTournament } = useData();

    const handleTournamentSelect = (id: string) => {
        selectTournament(id);
        navigate('tournament');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Torneios Disponíveis</h1>
            {tournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map(tournament => (
                        <div key={tournament.id} onClick={() => handleTournamentSelect(tournament.id)}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className='flex items-center space-x-4'>
                                        <TrophyIcon className="w-8 h-8 text-blue-500" />
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{tournament.name}</h2>
                                    </div>
                                    <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tournament.rounds.length} rodadas</p>
                            </div>
                            <div className="bg-blue-600 h-2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                     <TrophyIcon className="w-16 h-16 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Nenhum torneio encontrado</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">O administrador ainda não criou nenhum torneio. Volte em breve!</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
