"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hash function for password (not for production use)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("growth_loop_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("growth_loop_users") || "[]");
    const hashedPassword = simpleHash(password);

    const foundUser = users.find(
      (u: { username: string; password: string }) =>
        u.username === username && u.password === hashedPassword
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(
        "growth_loop_user",
        JSON.stringify(userWithoutPassword)
      );
      return true;
    }
    return false;
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("growth_loop_users") || "[]");

    // Check if username already exists
    if (users.some((u: { username: string }) => u.username === username)) {
      return false;
    }

    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password: simpleHash(password),
      createdAt: Date.now(),
    };

    users.push(newUser);
    localStorage.setItem("growth_loop_users", JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(
      "growth_loop_user",
      JSON.stringify(userWithoutPassword)
    );
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("growth_loop_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
