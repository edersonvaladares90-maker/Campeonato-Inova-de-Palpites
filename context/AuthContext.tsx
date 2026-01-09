
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { MOCK_USERS } from './DataContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_hash: string) => boolean;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'isAdmin'>) => boolean;
  updateUser: (updatedUser: User) => void;
}

// FIX: Export AuthContext to be available for use in hooks.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password_hash: string): boolean => {
    const foundUser = MOCK_USERS.find(u => u.email === email && u.passwordHash === password_hash);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };
  
  const register = (userData: Omit<User, 'id' | 'isAdmin'>) : boolean => {
      const existingUser = MOCK_USERS.find(u => u.email === userData.email);
      if (existingUser) {
          return false; // User already exists
      }
      const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
          isAdmin: false,
          avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`
      };
      MOCK_USERS.push(newUser);
      setUser(newUser);
      return true;
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const userIndex = MOCK_USERS.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
