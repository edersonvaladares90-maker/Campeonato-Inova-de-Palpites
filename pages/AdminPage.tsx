import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Tournament, Game, Round, Player } from '../types';
import { PlusIcon, TrashIcon, EditIcon, SaveIcon, ChevronDownIcon, ChevronUpIcon } from '../components/icons';

const AdminPage: React.FC<{ navigate: Function }> = () => {
    const { user } = useAuth();
    const { tournaments, addTournament, deleteTournament, addRound, addGameToRound, updateRoundResults, players } = useData();
    const [newTournamentName, setNewTournamentName] = useState('');
    const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

    const handleAddTournament = () => {
        if (newTournamentName.trim()) {
            addTournament(newTournamentName.trim());
            setNewTournamentName('');
        }
    };

    if (!user?.isAdmin) {
        return <div className="text-center text-red-500">Acesso negado. Apenas administradores.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Painel do Administrador</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-bold mb-4">Gerenciar Torneios</h2>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newTournamentName}
                        onChange={(e) => setNewTournamentName(e.target.value)}
                        placeholder="Nome do novo torneio"
                        className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                    />
                    <button onClick={handleAddTournament} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-1" /> Adicionar
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {tournaments.map(t => (
                    <TournamentEditor 
                        key={t.id} 
                        tournament={t} 
                        onDelete={deleteTournament} 
                        onAddRound={addRound}
                        onAddGame={addGameToRound}
                        onUpdateResults={updateRoundResults}
                        players={players}
                    />
                ))}
            </div>
        </div>
    );
};

interface TournamentEditorProps {
    tournament: Tournament;
    onDelete: (id: string) => void;
    onAddRound: (tournamentId: string, name: string, deadline: number) => void;
    onAddGame: (tournamentId: string, roundId: string, game: Omit<Game, 'id'>) => void;
    onUpdateResults: (tournamentId: string, roundId: string, games: Game[], scorers: { [playerId: string]: number }) => void;
    players: Player[];
}

const TournamentEditor: React.FC<TournamentEditorProps> = ({ tournament, onDelete, onAddRound, onAddGame, onUpdateResults, players }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newRoundName, setNewRoundName] = useState('');
    const [newRoundDeadline, setNewRoundDeadline] = useState('');

    const handleAddRound = () => {
        if(newRoundName.trim() && newRoundDeadline) {
            const deadlineTimestamp = new Date(newRoundDeadline).getTime();
            onAddRound(tournament.id, newRoundName, deadlineTimestamp);
            setNewRoundName('');
            setNewRoundDeadline('');
        }
    }

    return (
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <h3 className="text-xl font-semibold">{tournament.name}</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm(`Tem certeza que deseja excluir o torneio ${tournament.name}?`)) onDelete(tournament.id); }} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5"/></button>
                    {isOpen ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                </div>
            </div>
            {isOpen && (
                <div className="p-4 border-t dark:border-gray-700">
                    <div className="mb-4 p-4 border dark:border-gray-600 rounded-md">
                        <h4 className="font-bold mb-2">Adicionar Nova Rodada</h4>
                        <div className="grid md:grid-cols-3 gap-2">
                           <input type="text" value={newRoundName} onChange={e => setNewRoundName(e.target.value)} placeholder="Nome da Rodada" className="p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"/>
                           <input type="datetime-local" value={newRoundDeadline} onChange={e => setNewRoundDeadline(e.target.value)} className="p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"/>
                           <button onClick={handleAddRound} className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"><PlusIcon className="w-5 h-5 mr-1" /> Adicionar Rodada</button>
                        </div>
                    </div>
                    {tournament.rounds.map(round => (
                        <RoundEditor key={round.id} round={round} tournamentId={tournament.id} onAddGame={onAddGame} onUpdateResults={onUpdateResults} players={players}/>
                    ))}
                </div>
            )}
        </div>
    )
};


interface RoundEditorProps {
    round: Round;
    tournamentId: string;
    onAddGame: (tournamentId: string, roundId: string, game: Omit<Game, 'id'>) => void;
    onUpdateResults: (tournamentId: string, roundId: string, games: Game[], scorers: { [playerId: string]: number }) => void;
    players: Player[];
}

const RoundEditor: React.FC<RoundEditorProps> = ({ round, tournamentId, onAddGame, onUpdateResults, players }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [teamA, setTeamA] = useState('');
    const [teamB, setTeamB] = useState('');
    const [editingResults, setEditingResults] = useState<{ [gameId: string]: { scoreA: string, scoreB: string } }>({});
    const [scorers, setScorers] = useState<{ [playerId: string]: string }>({});

    const handleAddGame = () => {
        if(teamA.trim() && teamB.trim()) {
            onAddGame(tournamentId, round.id, { 
                teamA: teamA.trim(), 
                teamB: teamB.trim(), 
                // FIX: Explicitly cast to string to resolve a type inference issue where the argument was being treated as 'unknown'.
                teamALogo: `https://picsum.photos/seed/${encodeURIComponent(String(teamA.trim()))}/40`,
                // FIX: Explicitly cast to string to resolve a type inference issue where the argument was being treated as 'unknown'.
                teamBLogo: `https://picsum.photos/seed/${encodeURIComponent(String(teamB.trim()))}/40`
            });
            setTeamA('');
            setTeamB('');
        }
    };
    
    const handleResultChange = (gameId: string, team: 'A' | 'B', value: string) => {
        setEditingResults(prev => ({ ...prev, [gameId]: { ...prev[gameId], [team === 'A' ? 'scoreA' : 'scoreB']: value.replace(/[^0-9]/g, '') } }));
    };

    const handleScorerChange = (playerId: string, value: string) => {
        setScorers(prev => ({ ...prev, [playerId]: value.replace(/[^0-9]/g, '') }));
    };

    const handleSaveResults = () => {
        const updatedGames = round.games.map(game => {
            const result = editingResults[game.id];
            if(result && result.scoreA !== '' && result.scoreB !== '') {
                return { ...game, finalScoreA: parseInt(result.scoreA), finalScoreB: parseInt(result.scoreB) };
            }
            return game;
        });
        const finalScorers: { [playerId: string]: number } = {};
        Object.entries(scorers).forEach(([playerId, goals]) => {
            if(goals && parseInt(goals) > 0) {
                finalScorers[playerId] = parseInt(goals);
            }
        });
        onUpdateResults(tournamentId, round.id, updatedGames, finalScorers);
    };


    return (
        <div className="border dark:border-gray-600 rounded-md p-3 mb-3 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h4 className="font-semibold">{round.name}</h4>
                {isExpanded ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
            </div>
            {isExpanded && (
                <div className="mt-3">
                    {/* Add Game Form */}
                     <div className="grid md:grid-cols-3 gap-2 mb-4">
                        <input type="text" value={teamA} onChange={e => setTeamA(e.target.value)} placeholder="Time A" className="p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"/>
                        <input type="text" value={teamB} onChange={e => setTeamB(e.target.value)} placeholder="Time B" className="p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"/>
                        <button onClick={handleAddGame} className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"><PlusIcon className="w-5 h-5 mr-1" /> Jogo</button>
                    </div>

                    {/* Games List & Results */}
                    <div className="space-y-2">
                        {round.games.map(game => (
                             <div key={game.id} className="grid grid-cols-5 items-center gap-2">
                                <span className="col-span-2 text-right">{game.teamA}</span>
                                <div className="flex items-center justify-center space-x-1">
                                     <input type="text" value={editingResults[game.id]?.scoreA ?? game.finalScoreA ?? ''} onChange={e => handleResultChange(game.id, 'A', e.target.value)} className="w-10 text-center font-bold bg-white dark:bg-gray-800 border dark:border-gray-600 rounded" />
                                     <span>x</span>
                                     <input type="text" value={editingResults[game.id]?.scoreB ?? game.finalScoreB ?? ''} onChange={e => handleResultChange(game.id, 'B', e.target.value)} className="w-10 text-center font-bold bg-white dark:bg-gray-800 border dark:border-gray-600 rounded" />
                                </div>
                                <span className="col-span-2">{game.teamB}</span>
                            </div>
                        ))}
                    </div>

                    {/* Scorers */}
                    <div className="mt-4">
                        <h5 className="font-bold mb-2">Artilheiros da Rodada</h5>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {players.map(player => (
                                <div key={player.id} className="flex items-center space-x-2">
                                    <label className="flex-grow">{player.name}</label>
                                    <input type="text" value={scorers[player.id] ?? round.scorers[player.id] ?? ''} onChange={e => handleScorerChange(player.id, e.target.value)} className="w-12 text-center bg-white dark:bg-gray-800 border dark:border-gray-600 rounded"/>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={handleSaveResults} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
                        <SaveIcon className="w-5 h-5 mr-2" /> Salvar Resultados da Rodada
                    </button>
                </div>
            )}
        </div>
    )
}

export default AdminPage;