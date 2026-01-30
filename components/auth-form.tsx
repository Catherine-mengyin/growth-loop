"use client";

import React from "react"

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Sparkles } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || "邮箱或密码错误");
        }
      } else {
        if (password.length < 6) {
          setError("密码至少需要6位");
          setIsLoading(false);
          return;
        }
        const result = await register(username, email, password);
        if (!result.success) {
          setError(result.error || "注册失败");
        }
      }
    } catch {
      setError("发生错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-peach mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">成长循环</h1>
          <p className="text-muted-foreground">像照料花园一样照料你的人生</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          {/* Tab Switcher */}
          <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                isLogin
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  用户名
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                  className="h-12 rounded-xl border-border/50 bg-white/50 focus:bg-white transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                邮箱
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
                className="h-12 rounded-xl border-border/50 bg-white/50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "请输入密码" : "至少6位密码"}
                required
                className="h-12 rounded-xl border-border/50 bg-white/50 focus:bg-white transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl gradient-peach text-white font-medium press-effect hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  处理中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {isLogin ? "登录" : "开始成长之旅"}
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
