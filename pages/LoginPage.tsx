
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogInIcon, MailIcon, LockIcon } from '../components/icons';

interface LoginPageProps {
    navigate: (page: 'register') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = login(email, password);
        if (!success) {
            setError('Email ou senha inválidos.');
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                        Acessar sua conta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Bem-vindo de volta!
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <div className="relative">
                         <MailIcon className="absolute top-3.5 left-3 w-5 h-5 text-gray-400"/>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
                        />
                    </div>
                    <div className="relative">
                        <LockIcon className="absolute top-3.5 left-3 w-5 h-5 text-gray-400"/>
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
                        />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                        <LogInIcon className="w-5 h-5 mr-2"/>
                        Entrar
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Não tem uma conta?{' '}
                    <a onClick={() => navigate('register')} className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                        Cadastre-se
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
