import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Tournament, Game, Round, Player } from '../types';
import { PlusIcon, TrashIcon, EditIcon, SaveIcon, ChevronDownIcon, ChevronUpIcon, ImageIcon } from '../components/icons';

const AdminPage: React.FC<{ navigate: Function }> = () => {
    const { user } = useAuth();
    const { tournaments, addTournament, updateTournament, deleteTournament, addRound, addGameToRound, updateRoundResults, players } = useData();
    const [newTournamentName, setNewTournamentName] = useState('');
    const [newTournamentImageUrl, setNewTournamentImageUrl] = useState('');

    const handleAddTournament = () => {
        if (newTournamentName.trim()) {
            addTournament(newTournamentName.trim(), newTournamentImageUrl.trim());
            setNewTournamentName('');
            setNewTournamentImageUrl('');
        }
    };

    if (!user?.isAdmin) {
        return <div className="text-center text-red-500">Acesso negado. Apenas administradores.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Painel do Administrador</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-bold mb-4">Criar Novo Torneio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={newTournamentName}
                        onChange={(e) => setNewTournamentName(e.target.value)}
                        placeholder="Nome do novo torneio"
                        className="w-full p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                    />
                    <input
                        type="text"
                        value={newTournamentImageUrl}
                        onChange={(e) => setNewTournamentImageUrl(e.target.value)}
                        placeholder="URL da Imagem (opcional)"
                        className="w-full p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                    />
                </div>
                <button onClick={handleAddTournament} className="mt-4 w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 mr-1" /> Adicionar Torneio
                </button>
            </div>

            <div className="space-y-4">
                {tournaments.map(t => (
                    <TournamentEditor 
                        key={t.id} 
                        tournament={t} 
                        onDelete={deleteTournament} 
                        onUpdate={updateTournament}
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
    onUpdate: (tournamentId: string, data: { name: string; imageUrl: string }) => void;
    onAddRound: (tournamentId: string, name: string, deadline: number) => void;
    onAddGame: (tournamentId: string, roundId: string, game: Omit<Game, 'id'>) => void;
    onUpdateResults: (tournamentId: string, roundId: string, games: Game[], scorers: { [playerId: string]: number }) => void;
    players: Player[];
}

const TournamentEditor: React.FC<TournamentEditorProps> = ({ tournament, onDelete, onUpdate, onAddRound, onAddGame, onUpdateResults, players }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newRoundName, setNewRoundName] = useState('');
    const [newRoundDeadline, setNewRoundDeadline] = useState('');
    const [editingName, setEditingName] = useState(tournament.name);
    const [editingImageUrl, setEditingImageUrl] = useState(tournament.imageUrl || '');

    const handleAddRound = () => {
        if(newRoundName.trim() && newRoundDeadline) {
            const deadlineTimestamp = new Date(newRoundDeadline).getTime();
            onAddRound(tournament.id, newRoundName, deadlineTimestamp);
            setNewRoundName('');
            setNewRoundDeadline('');
        }
    }

    const handleUpdateTournament = () => {
        onUpdate(tournament.id, { name: editingName, imageUrl: editingImageUrl });
        alert("Torneio atualizado!");
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
                <div className="p-4 border-t dark:border-gray-700 space-y-4">
                    <div>
                        <h4 className="font-bold mb-2">Editar Torneio</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                           <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} placeholder="Nome do Torneio" className="p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"/>
                           <input type="text" value={editingImageUrl} onChange={e => setEditingImageUrl(e.target.value)} placeholder="URL da Imagem" className="p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"/>
                        </div>
                        <button onClick={handleUpdateTournament} className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center justify-center text-sm"><SaveIcon className="w-4 h-4 mr-1" /> Salvar Alterações</button>
                    </div>

                    <div className="p-4 border-t dark:border-gray-600">
                        <h4 className="font-bold mb-2">Adicionar Nova Rodada</h4>
                        <div className="grid md:grid-cols-3 gap-2">
                           <input type="text" value={newRoundName} onChange={e => setNewRoundName(e.target.value)} placeholder="Nome da Rodada" className="p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"/>
                           <input type="datetime-local" value={newRoundDeadline} onChange={e => setNewRoundDeadline(e.target.value)} className="p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"/>
                           <button onClick={handleAddRound} className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"><PlusIcon className="w-5 h-5 mr-1" /> Adicionar Rodada</button>
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
    // FIX: Explicitly setting the type for useState to string, to avoid issues with type inference.
    const [teamA, setTeamA] = useState<string>('');
    // FIX: Added explicit <string> type to useState for teamB to match teamA and fix type inference issues.
    const [teamB, setTeamB] = useState<string>('');
    const [editingResults, setEditingResults] = useState<{ [gameId: string]: { scoreA: string, scoreB: string } }>({});
    const [scorers, setScorers] = useState<{ [playerId: string]: string }>({});

    const handleAddGame = () => {
        if(teamA.trim() && teamB.trim()) {
            onAddGame(tournamentId, round.id, { 
                teamA: teamA.trim(), 
                teamB: teamB.trim(), 
                teamALogo: `https://picsum.photos/seed/${encodeURIComponent(teamA.trim())}/40`,
                teamBLogo: `https://picsum.photos/seed/${encodeURIComponent(teamB.trim())}/40`
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
        <div className="border dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h4 className="font-semibold">{round.name}</h4>
                {isExpanded ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
            </div>
            {isExpanded && (
                <div className="mt-3 pt-3 border-t dark:border-gray-600">
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