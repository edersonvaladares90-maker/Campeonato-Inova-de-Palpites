
import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TournamentPage from './pages/TournamentPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import BetHistoryPage from './pages/BetHistoryPage';

type Page = 'login' | 'register' | 'dashboard' | 'tournament' | 'admin' | 'profile' | 'history';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const { selectedTournament } = useData();
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    
    const navigate = (page: Page) => {
        setCurrentPage(page);
    };

    const effectivePage = useMemo(() => {
        if (!user) {
            if (currentPage === 'register') return 'register';
            return 'login';
        }
        return currentPage;
    }, [user, currentPage]);

    const renderPage = () => {
        switch (effectivePage) {
            case 'login':
                return <LoginPage navigate={navigate} />;
            case 'register':
                return <RegisterPage navigate={navigate} />;
            case 'dashboard':
                return <DashboardPage navigate={navigate} />;
            case 'tournament':
                if (selectedTournament) {
                    return <TournamentPage navigate={navigate} />;
                }
                navigate('dashboard');
                return null;
            case 'admin':
                return <AdminPage navigate={navigate} />;
            case 'profile':
                return <ProfilePage navigate={navigate} />;
            case 'history':
                return <BetHistoryPage navigate={navigate} />;
            default:
                return <DashboardPage navigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Header navigate={navigate} />
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                {renderPage()}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <DataProvider>
                <AppContent />
            </DataProvider>
        </AuthProvider>
    );
};

export default App;
