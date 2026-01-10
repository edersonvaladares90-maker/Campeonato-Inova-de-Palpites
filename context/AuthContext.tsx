
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { loadDB, saveDB } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_hash: string) => boolean;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'isAdmin'>) => boolean;
  updateUser: (updatedUser: User) => void;
  requestPasswordReset: (email: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password_hash: string): boolean => {
    const db = loadDB();
    const foundUser = db.users.find(u => u.email === email && u.passwordHash === password_hash);
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
      const db = loadDB();
      const existingUser = db.users.find(u => u.email === userData.email);
      if (existingUser) {
          return false; // User already exists
      }
      const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
          isAdmin: false,
          avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`
      };
      db.users.push(newUser);
      saveDB(db);
      setUser(newUser);
      return true;
  };

  const updateUser = (updatedUser: User) => {
    const db = loadDB();
    const userIndex = db.users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
        db.users[userIndex] = updatedUser;
        saveDB(db);
        setUser(updatedUser);
    }
  };

  const requestPasswordReset = (email: string): boolean => {
      const db = loadDB();
      const userExists = db.users.some(u => u.email === email);
      // In a real app, this would trigger an email. Here, we just confirm the request was processed.
      console.log(`Password reset requested for ${email}. User exists: ${userExists}`);
      return true; // Always return true to prevent email enumeration
  }


  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, requestPasswordReset }}>
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
