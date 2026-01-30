"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ChevronLeft, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserSettingsProps {
  onBack: () => void;
}

export function UserSettings({ onBack }: UserSettingsProps) {
  const { user, updateUsername, updateEmail, updatePassword } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [usernameMessage, setUsernameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateUsername = async () => {
    if (!username.trim() || username === user?.username) return;

    setIsUpdatingUsername(true);
    setUsernameMessage(null);

    const result = await updateUsername(username.trim());

    if (result.success) {
      setUsernameMessage({ type: "success", text: "昵称已更新" });
    } else {
      setUsernameMessage({ type: "error", text: result.error || "更新失败" });
    }

    setIsUpdatingUsername(false);
  };

  const handleUpdateEmail = async () => {
    if (!email.trim() || email === user?.email) return;

    setIsUpdatingEmail(true);
    setEmailMessage(null);

    const result = await updateEmail(email.trim());

    if (result.success) {
      setEmailMessage({ type: "success", text: "邮箱已更新，请查收验证邮件" });
    } else {
      setEmailMessage({ type: "error", text: result.error || "更新失败" });
    }

    setIsUpdatingEmail(false);
  };

  const handleUpdatePassword = async () => {
    if (!password || password.length < 6) {
      setPasswordMessage({ type: "error", text: "密码至少需要6个字符" });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "两次输入的密码不一致" });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    const result = await updatePassword(password);

    if (result.success) {
      setPasswordMessage({ type: "success", text: "密码已更新" });
      setPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({ type: "error", text: result.error || "更新失败" });
    }

    setIsUpdatingPassword(false);
  };

  return (
    <div className="pb-24 px-4 md:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-xl -ml-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">账号设置</h1>
            <p className="text-muted-foreground text-sm mt-1">
              管理你的个人资料
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6 mt-4">
        {/* Username Section */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#4ADE80]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[#4ADE80]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">昵称</h3>
              <p className="text-xs text-muted-foreground">显示在应用中的名称</p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入昵称"
              className="rounded-xl"
            />

            {usernameMessage && (
              <p className={`text-sm ${usernameMessage.type === "success" ? "text-[#4ADE80]" : "text-destructive"}`}>
                {usernameMessage.text}
              </p>
            )}

            <Button
              onClick={handleUpdateUsername}
              disabled={!username.trim() || username === user?.username || isUpdatingUsername}
              className="w-full rounded-xl gradient-mint text-white press-effect"
            >
              {isUpdatingUsername ? "保存中..." : "保存昵称"}
            </Button>
          </div>
        </div>

        {/* Email Section */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">邮箱</h3>
              <p className="text-xs text-muted-foreground">用于登录的邮箱地址</p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入邮箱"
              className="rounded-xl"
            />

            {emailMessage && (
              <p className={`text-sm ${emailMessage.type === "success" ? "text-[#4ADE80]" : "text-destructive"}`}>
                {emailMessage.text}
              </p>
            )}

            <Button
              onClick={handleUpdateEmail}
              disabled={!email.trim() || email === user?.email || isUpdatingEmail}
              className="w-full rounded-xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white press-effect"
            >
              {isUpdatingEmail ? "保存中..." : "保存邮箱"}
            </Button>
          </div>
        </div>

        {/* Password Section */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">密码</h3>
              <p className="text-xs text-muted-foreground">修改登录密码</p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入新密码"
              className="rounded-xl"
            />

            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="确认新密码"
              className="rounded-xl"
            />

            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.type === "success" ? "text-[#4ADE80]" : "text-destructive"}`}>
                {passwordMessage.text}
              </p>
            )}

            <Button
              onClick={handleUpdatePassword}
              disabled={!password || isUpdatingPassword}
              className="w-full rounded-xl bg-[#A78BFA] hover:bg-[#A78BFA]/90 text-white press-effect"
            >
              {isUpdatingPassword ? "保存中..." : "修改密码"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
