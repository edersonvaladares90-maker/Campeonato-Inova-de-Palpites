
import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Game, Bet, Round, Player } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, LockIcon, MedalIcon, StarIcon, TrophyIcon, UsersIcon } from '../components/icons';


const Leaderboard = ({ tournamentId }: { tournamentId: string }) => {
    const { getLeaderboard } = useData();
    const leaderboard = getLeaderboard(tournamentId);

    const getMedal = (index: number) => {
        if (index === 0) return <MedalIcon className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <MedalIcon className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <MedalIcon className="w-6 h-6 text-yellow-700" />;
        return <span className="w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4 flex items-center"><TrophyIcon className="w-6 h-6 mr-2 text-blue-500" /> Tabela de Classificação</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 font-semibold">Pos.</th>
                            <th className="p-3 font-semibold">Time</th>
                            <th className="p-3 font-semibold text-center">Pontos</th>
                            <th className="p-3 font-semibold text-center" title="Placares Exatos">PE</th>
                            <th className="p-3 font-semibold text-center" title="Gols do Artilheiro">GA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((score, index) => (
                            <tr key={score.userId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3 font-bold flex items-center">{getMedal(index)}</td>
                                <td className="p-3 flex items-center">
                                    <img src={score.userAvatar} alt={score.displayName} className="w-8 h-8 rounded-full mr-3" />
                                    {score.displayName}
                                </td>
                                <td className="p-3 font-bold text-center text-blue-600 dark:text-blue-400">{score.totalPoints}</td>
                                <td className="p-3 text-center">{score.exactScores}</td>
                                <td className="p-3 text-center">{score.topScorerGoals}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const AllBetsModal = ({ round, onClose }: { round: Round, onClose: () => void }) => {
    const { users, bets, players } = useData();
    const participantUsers = users.filter(u => !u.isAdmin);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
                    <h2 className="text-2xl font-bold">Palpites da {round.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
                </div>
                <div className="p-6">
                    {participantUsers.map(user => {
                        const userBets = bets.filter(b => b.userId === user.id && round.games.some(g => g.id === b.gameId));
                        const topScorerId = round.topScorerBets[user.id];
                        const topScorer = players.find(p => p.id === topScorerId);
                        
                        return (
                            <div key={user.id} className="mb-6 last:mb-0 p-4 border dark:border-gray-700 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="w-10 h-10 rounded-full mr-3" />
                                    <h3 className="text-lg font-semibold">{`${user.firstName} ${user.lastName}`}</h3>
                                </div>
                                {topScorer && (
                                    <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded flex items-center">
                                        <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                                        <span className="font-semibold">Artilheiro da Rodada:</span>
                                        <span className="ml-2">{topScorer.name}</span>
                                    </div>
                                )}
                                <ul className="space-y-2">
                                    {round.games.map(game => {
                                        const bet = userBets.find(b => b.gameId === game.id);
                                        return (
                                            <li key={game.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                <span>{game.teamA} vs {game.teamB}</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{bet ? `${bet.scoreA} x ${bet.scoreB}` : 'N/A'}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

// FIX: Changed component to be of type React.FC to resolve the 'key' prop assignment error.
const RoundComponent: React.FC<{ round: Round, tournamentId: string }> = ({ round, tournamentId }) => {
    const { user } = useAuth();
    const { players, submitBets, getUserBetsForRound } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [isBetting, setIsBetting] = useState(false);
    const [bets, setBets] = useState<{ [gameId: string]: { scoreA: string, scoreB: string } }>({});
    const [topScorer, setTopScorer] = useState('');
    const [isLocked, setIsLocked] = useState(round.deadline < Date.now());
    const [viewAllBets, setViewAllBets] = useState(false);

    useEffect(() => {
        if(user) {
            const { bets: userBets, topScorer: userTopScorer } = getUserBetsForRound(user.id, round);
            const initialBets: { [gameId: string]: { scoreA: string, scoreB: string } } = {};
            userBets.forEach(b => {
                initialBets[b.gameId] = { scoreA: String(b.scoreA), scoreB: String(b.scoreB) };
            });
            setBets(initialBets);
            if(userTopScorer) setTopScorer(userTopScorer.id);
        }
    }, [round, user, getUserBetsForRound]);
    
    const handleScoreChange = (gameId: string, team: 'A' | 'B', value: string) => {
        const score = value.replace(/[^0-9]/g, '');
        setBets(prev => ({
            ...prev,
            [gameId]: {
                ...prev[gameId],
                [team === 'A' ? 'scoreA' : 'scoreB']: score
            }
        }));
    };

    const handleSaveBets = () => {
        if (!user || !topScorer) return;
        const finalBets: Bet[] = round.games
            .map(game => {
                const bet = bets[game.id];
                if (bet && bet.scoreA !== '' && bet.scoreB !== '') {
                    return {
                        userId: user.id,
                        gameId: game.id,
                        scoreA: parseInt(bet.scoreA, 10),
                        scoreB: parseInt(bet.scoreB, 10)
                    };
                }
                return null;
            })
            .filter((b): b is Bet => b !== null);
        
        submitBets(tournamentId, round.id, finalBets, topScorer, user.id);
        setIsBetting(false);
        setIsOpen(false);
    };

    const handleTimerEnd = () => {
        setIsLocked(true);
        setIsBetting(false);
    };

    const toggleBetting = () => {
        if(isLocked) return;
        setIsBetting(!isBetting);
        setIsOpen(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
            <div className="p-4 cursor-pointer flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
                <h4 className="text-lg font-semibold">{round.name}</h4>
                <div className="flex items-center space-x-4">
                    {isLocked && <span className="text-sm font-medium text-red-500">Encerrada</span>}
                    {isOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                </div>
            </div>
            {isOpen && (
                <div className="p-4 border-t dark:border-gray-700">
                    <CountdownTimer deadline={round.deadline} onEnd={handleTimerEnd} />
                    
                    {round.resultsEntered && (
                         <div className="mt-4">
                            <h5 className="font-semibold mb-2">Resultados Finais:</h5>
                            {round.games.map(game => (
                                <div key={game.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded mb-1">
                                    <span>{game.teamA} vs {game.teamB}</span>
                                    <span className="font-bold">{game.finalScoreA} x {game.finalScoreB}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex space-x-2">
                        <button 
                            onClick={toggleBetting} 
                            disabled={isLocked && !isBetting}
                            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-colors ${isLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {isLocked ? <LockIcon className="w-4 h-4 mr-2"/> : isBetting ? <ChevronUpIcon className="w-4 h-4 mr-2"/> : <TrophyIcon className="w-4 h-4 mr-2"/>}
                            {isBetting ? 'Fechar Palpites' : 'Fazer/Editar Palpites'}
                        </button>
                        {isLocked && (
                             <button 
                                onClick={() => setViewAllBets(true)} 
                                className="px-4 py-2 text-sm font-medium rounded-md flex items-center bg-green-600 hover:bg-green-700 text-white transition-colors"
                            >
                                <EyeIcon className="w-4 h-4 mr-2"/>
                                Ver Palpites
                            </button>
                        )}
                    </div>

                    {isBetting && !isLocked && (
                         <div className="mt-6 space-y-4">
                            {round.games.map(game => (
                                <div key={game.id} className="grid grid-cols-5 items-center gap-2">
                                    <div className="col-span-2 text-right flex items-center justify-end">
                                        <span className='mr-2'>{game.teamA}</span>
                                        <img src={game.teamALogo} className='w-6 h-6 rounded-full' />
                                    </div>
                                    <div className="flex items-center justify-center space-x-1">
                                        <input
                                            type="text"
                                            value={bets[game.id]?.scoreA || ''}
                                            onChange={(e) => handleScoreChange(game.id, 'A', e.target.value)}
                                            className="w-10 text-center font-bold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                                        />
                                        <span>x</span>
                                         <input
                                            type="text"
                                            value={bets[game.id]?.scoreB || ''}
                                            onChange={(e) => handleScoreChange(game.id, 'B', e.target.value)}
                                            className="w-10 text-center font-bold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <img src={game.teamBLogo} className='w-6 h-6 rounded-full mr-2' />
                                        <span>{game.teamB}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-6">
                                <label className="block text-sm font-medium mb-2"><StarIcon className="w-4 h-4 inline mr-1" /> Artilheiro da Rodada</label>
                                <select value={topScorer} onChange={(e) => setTopScorer(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    <option value="">Selecione um jogador</option>
                                    {players.map(player => (
                                        <option key={player.id} value={player.id}>{player.name} ({player.team})</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={handleSaveBets} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                Salvar Palpites
                            </button>
                         </div>
                    )}
                </div>
            )}
             {viewAllBets && <AllBetsModal round={round} onClose={() => setViewAllBets(false)} />}
        </div>
    );
};


const TournamentPage: React.FC<{ navigate: Function }> = ({ navigate }) => {
    const { selectedTournament, selectTournament: deselect } = useData();

    if (!selectedTournament) {
        return <div>Carregando...</div>;
    }

    const handleBack = () => {
        deselect(null);
        navigate('dashboard');
    }

    return (
        <div>
            <button onClick={handleBack} className="mb-6 text-blue-600 hover:underline">&larr; Voltar para Torneios</button>
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">{selectedTournament.name}</h1>
            <p className="mb-8 text-gray-500 dark:text-gray-400">Acompanhe as rodadas e a sua classificação.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold mb-4 flex items-center"><UsersIcon className="w-6 h-6 mr-2 text-blue-500" /> Rodadas</h3>
                    {selectedTournament.rounds.map(round => (
                        <RoundComponent key={round.id} round={round} tournamentId={selectedTournament.id} />
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <Leaderboard tournamentId={selectedTournament.id} />
                </div>
            </div>
        </div>
    );
};

export default TournamentPage;
