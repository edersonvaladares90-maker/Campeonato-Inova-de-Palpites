
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TrophyIcon, BarChart3Icon, UserIcon, LogOutIcon, ShieldIcon, HistoryIcon } from './icons';

interface HeaderProps {
    navigate: (page: 'dashboard' | 'admin' | 'profile' | 'history') => void;
}

const Header: React.FC<HeaderProps> = ({ navigate }) => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="bg-blue-700 dark:bg-blue-800 shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('dashboard')}>
                    <TrophyIcon className="w-8 h-8 text-yellow-300" />
                    <h1 className="text-xl md:text-2xl font-bold text-white">Campeonato Inova de Palpites</h1>
                </div>
                {user && (
                    <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2 text-white">
                            <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-300" />
                            <span className="hidden md:inline font-semibold">{`${user.firstName} ${user.lastName}`}</span>
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                                <a onClick={() => { navigate('profile'); setMenuOpen(false); }} className="cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <UserIcon className="w-4 h-4 mr-2" /> Perfil
                                </a>
                                <a onClick={() => { navigate('history'); setMenuOpen(false); }} className="cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <HistoryIcon className="w-4 h-4 mr-2" /> Histórico
                                </a>
                                {user.isAdmin && (
                                     <a onClick={() => { navigate('admin'); setMenuOpen(false); }} className="cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <ShieldIcon className="w-4 h-4 mr-2" /> Admin
                                     </a>
                                )}
                                <a onClick={() => { logout(); setMenuOpen(false); }} className="cursor-pointer flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <LogOutIcon className="w-4 h-4 mr-2" /> Sair
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
