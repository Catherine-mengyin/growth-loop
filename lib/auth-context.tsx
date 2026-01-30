"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // 获取用户资料
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          username: profile?.username || session.user.email?.split("@")[0] || "用户",
          email: session.user.email || "",
          createdAt: new Date(session.user.created_at).getTime(),
        });
      }
      setIsLoading(false);
    };

    getSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", session.user.id)
            .single();

          setUser({
            id: session.user.id,
            username: profile?.username || session.user.email?.split("@")[0] || "用户",
            email: session.user.email || "",
            createdAt: new Date(session.user.created_at).getTime(),
          });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();

      setUser({
        id: data.user.id,
        username: profile?.username || data.user.email?.split("@")[0] || "用户",
        email: data.user.email || "",
        createdAt: new Date(data.user.created_at).getTime(),
      });
      return { success: true };
    }

    return { success: false, error: "登录失败" };
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 先检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUser) {
      return { success: false, error: "用户名已存在" };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // 创建用户资料
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
      });

      if (profileError) {
        return { success: false, error: "创建用户资料失败" };
      }

      setUser({
        id: data.user.id,
        username,
        email: data.user.email || "",
        createdAt: new Date(data.user.created_at).getTime(),
      });
      return { success: true };
    }

    return { success: false, error: "注册失败" };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
