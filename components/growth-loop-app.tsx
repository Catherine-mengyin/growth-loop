"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthForm } from "./auth-form";
import { FloatingDock } from "./floating-dock";
import { Dashboard } from "./dashboard";
import { VisionBoard } from "./vision-board";
import { Milestones } from "./milestones";
import { Journal } from "./journal";
import { AddTaskDialog } from "./add-task-dialog";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function GrowthLoopApp() {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Refresh dashboard when switching back to it
  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      setRefreshKey((prev) => prev + 1);
    }
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 py-3 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              aria-label="设置"
            >
              <span className="text-sm font-semibold text-primary">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-48">
            <DropdownMenuItem disabled className="text-muted-foreground">
              <span className="truncate">{user.username}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <main className="pt-14">
        {activeTab === "dashboard" && <Dashboard key={`dashboard-${refreshKey}`} />}
        {activeTab === "vision" && <VisionBoard />}
        {activeTab === "milestones" && <Milestones />}
        {activeTab === "journal" && <Journal />}
      </main>

      {/* Floating Dock */}
      <FloatingDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}
