
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';
import { SaveIcon, EditIcon, UserIcon, MailIcon, PhoneIcon, UsersIcon } from '../components/icons';
import { Achievement } from '../types';
import { useData } from '../hooks/useData';

// FIX: Changed component to be of type React.FC to resolve the 'key' prop assignment error.
const AchievementIcon: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const icons = {
        [Achievement.FirstBet]: "🤞",
        [Achievement.PerfectRound]: "🎯",
        [Achievement.TopScorerGenius]: "🌟",
        [Achievement.HatTrick]: "🎩",
        [Achievement.PodiumFinish]: "🏆",
    };
    return (
        <div className="flex flex-col items-center p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg" title={achievement}>
            <span className="text-3xl">{icons[achievement]}</span>
            <span className="text-xs text-center mt-1 text-yellow-800 dark:text-yellow-200">{achievement}</span>
        </div>
    )
}


const ProfilePage: React.FC<{ navigate: Function }> = () => {
    const { user, updateUser } = useAuth();
    const { achievements } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User | null>(user);

    const userAchievements = achievements.filter(a => a.userId === user?.id);

    if (!user || !formData) return <div>Carregando...</div>;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            updateUser(formData);
        }
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="bg-cover bg-center h-40" style={{ backgroundImage: `url('https://picsum.photos/1000/200')` }}></div>
                <div className="p-6">
                    <div className="flex items-end -mt-20">
                        <img className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800" src={user.avatarUrl} alt="Avatar" />
                         <div className="ml-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{`${user.firstName} ${user.lastName}`}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{user.teamName}</p>
                        </div>
                    </div>
                
                    <div className="mt-8">
                        <form onSubmit={handleSave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primeiro Nome</label>
                                    <div className="relative">
                                        <UserIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400"/>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-700/50" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Último Nome</label>
                                    <div className="relative">
                                        <UserIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400"/>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-700/50" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Time</label>
                                    <div className="relative">
                                        <UsersIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400"/>
                                        <input type="text" name="teamName" value={formData.teamName} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-700/50" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                    <div className="relative">
                                        <MailIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400"/>
                                        <input type="email" name="email" value={formData.email} disabled className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-200 dark:bg-gray-700/50 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                                     <div className="relative">
                                        <PhoneIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400"/>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-700/50" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                {isEditing ? (
                                    <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        <SaveIcon className="w-5 h-5 mr-2" /> Salvar
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                                        <EditIcon className="w-5 h-5 mr-2" /> Editar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Conquistas</h2>
                        {userAchievements.length > 0 ? (
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {userAchievements.map((ach, index) => <AchievementIcon key={index} achievement={ach.achievement}/> )}
                            </div>
                        ) : (
                            <p className="text-gray-500">Você ainda não tem conquistas. Continue palpitando!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
