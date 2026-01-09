
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { ChevronDownIcon, ChevronUpIcon } from '../components/icons';
import { TrophyIcon, StarIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon } from '../components/icons';

const BetHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const { tournaments, bets, players } = useData();
    const [openTournament, setOpenTournament] = React.useState<string | null>(null);

    if (!user) {
        return <div>Faça login para ver seu histórico.</div>;
    }

    const getBetResult = (betScoreA: number, betScoreB: number, finalScoreA?: number, finalScoreB?: number) => {
        if (finalScoreA === undefined || finalScoreB === undefined) {
            return { points: 0, label: 'Aguardando', icon: <MinusCircleIcon className="text-gray-400" /> };
        }
        if (betScoreA === finalScoreA && betScoreB === finalScoreB) {
            return { points: 3, label: 'Placar Exato', icon: <CheckCircleIcon className="text-green-500" /> };
        }
        const betResult = betScoreA > betScoreB ? 'A' : betScoreA < betScoreB ? 'B' : 'D';
        const finalResult = finalScoreA > finalScoreB ? 'A' : finalScoreA < finalScoreB ? 'B' : 'D';
        if (betResult === finalResult) {
            return { points: 1, label: 'Resultado Correto', icon: <CheckCircleIcon className="text-yellow-500" /> };
        }
        return { points: 0, label: 'Incorreto', icon: <XCircleIcon className="text-red-500" /> };
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Histórico de Palpites</h1>
            <div className="space-y-4">
                {tournaments.map(tournament => (
                    <div key={tournament.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <button
                            onClick={() => setOpenTournament(openTournament === tournament.id ? null : tournament.id)}
                            className="w-full text-left p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <h2 className="text-xl font-semibold flex items-center"><TrophyIcon className="w-6 h-6 mr-2 text-blue-500" /> {tournament.name}</h2>
                            {openTournament === tournament.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </button>
                        {openTournament === tournament.id && (
                            <div className="p-4 space-y-4">
                                {tournament.rounds.map(round => {
                                    const userBetsForRound = bets.filter(b => b.userId === user.id && round.games.some(g => g.id === b.gameId));
                                    const userTopScorerId = round.topScorerBets[user.id];
                                    const topScorer = players.find(p => p.id === userTopScorerId);
                                    // FIX: Corrected typo from topScorerId to userTopScorerId
                                    const goalsScored = userTopScorerId ? round.scorers[userTopScorerId] || 0 : 0;
                                    
                                    if(userBetsForRound.length === 0 && !topScorer) return null;

                                    return (
                                        <div key={round.id} className="p-4 border dark:border-gray-700 rounded-lg">
                                            <h3 className="text-lg font-bold mb-2">{round.name}</h3>
                                            {topScorer && (
                                                <div className="flex items-center space-x-2 text-sm mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-md">
                                                    <StarIcon className="text-yellow-500" />
                                                    <span>Artilheiro escolhido: <strong>{topScorer.name}</strong></span>
                                                    {round.resultsEntered && <span>(Gols: {goalsScored} - Pontos: {goalsScored * 3})</span>}
                                                </div>
                                            )}
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-gray-500 dark:text-gray-400">
                                                        <th className="p-2">Jogo</th>
                                                        <th className="p-2 text-center">Seu Palpite</th>
                                                        <th className="p-2 text-center">Resultado Final</th>
                                                        <th className="p-2 text-center">Pontos</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {round.games.map(game => {
                                                    const bet = userBetsForRound.find(b => b.gameId === game.id);
                                                    if(!bet) return null;

                                                    const result = getBetResult(bet.scoreA, bet.scoreB, game.finalScoreA, game.finalScoreB);

                                                    return (
                                                        <tr key={game.id} className="border-t dark:border-gray-700">
                                                            <td className="p-2">{game.teamA} vs {game.teamB}</td>
                                                            <td className="p-2 text-center font-semibold">{bet.scoreA} x {bet.scoreB}</td>
                                                            <td className="p-2 text-center">{game.finalScoreA !== undefined ? `${game.finalScoreA} x ${game.finalScoreB}` : '-'}</td>
                                                            <td className="p-2 text-center flex items-center justify-center space-x-2">
                                                                <span className="font-bold">{result.points}</span>
                                                                {result.icon}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BetHistoryPage;
