
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { apiLogin, apiRegister, apiUpdateUser } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_hash: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'isAdmin'>) => Promise<boolean>;
  updateUser: (updatedUser: User) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password_hash: string): Promise<boolean> => {
    const foundUser = await apiLogin(email, password_hash);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };
  
  const register = async (userData: Omit<User, 'id' | 'isAdmin'>) : Promise<boolean> => {
      const newUser = await apiRegister(userData);
      if (newUser) {
        setUser(newUser);
        return true;
      }
      return false; // User already exists
  };

  const updateUser = async (updatedUser: User) => {
    const finalUser = await apiUpdateUser(updatedUser);
    if (finalUser) {
        setUser(finalUser);
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
      // In a real app, this would trigger an email. Here, we just confirm the request was processed.
      console.log(`Password reset requested for ${email}.`);
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
